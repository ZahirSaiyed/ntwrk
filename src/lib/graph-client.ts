import { Client } from "@microsoft/microsoft-graph-client";
import { format } from "date-fns";

interface EmailContact {
  emailAddress: {
    name?: string;
    address: string;
  };
}

interface EmailMessage {
  sentDateTime: string;
  toRecipients: EmailContact[];
  ccRecipients: EmailContact[];
  bccRecipients: EmailContact[];
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  lastContacted: string;
  lastContactedRaw: string; // For sorting
}

export class GraphClient {
  private client: Client;
  private cache: {
    sentEmails?: EmailMessage[];
    lastFetch?: number;
  } = {};
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  
  constructor(accessToken: string) {
    this.client = Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      },
    });
  }

  private isValidDate(dateStr: string): boolean {
    const date = new Date(dateStr);
    return date instanceof Date && !isNaN(date.getTime());
  }
  
  async getSentEmails(limit: number = 100): Promise<EmailMessage[]> {
    // Check cache first
    const now = Date.now();
    if (this.cache.sentEmails && this.cache.lastFetch && (now - this.cache.lastFetch < this.CACHE_DURATION)) {
      return this.cache.sentEmails;
    }

    try {
      const response = await this.client.api('/me/mailFolders/sentItems/messages')
        .select('sentDateTime,toRecipients,ccRecipients,bccRecipients')
        .top(limit)
        .orderby('sentDateTime desc')
        .get();
      
      // Validate dates and filter out invalid messages
      const validMessages = (response.value as EmailMessage[])
        .filter(message => this.isValidDate(message.sentDateTime));

      // Update cache
      this.cache.sentEmails = validMessages;
      this.cache.lastFetch = now;

      return validMessages;
    } catch (error) {
      console.error('Error fetching sent emails:', error);
      throw error;
    }
  }

  async getUniqueContactsByLatestInteraction(): Promise<Contact[]> {
    const emails = await this.getSentEmails();
    const contactMap = new Map<string, Contact>();
    
    // Process each email to extract recipients
    for (const email of emails) {
      const processRecipient = (recipient: EmailContact) => {
        const emailAddress = recipient.emailAddress.address.toLowerCase();
        if (!emailAddress) return; // Skip invalid email addresses
        const name = recipient.emailAddress.name || emailAddress;
        const sentDate = new Date(email.sentDateTime);
        
        // Skip if date is invalid
        if (!this.isValidDate(email.sentDateTime)) {
          console.warn(`Invalid date for email to ${emailAddress}: ${email.sentDateTime}`);
          return;
        }

        // If this contact doesn't exist in our map, or if this email is more recent
        // than the one we have stored, update the contact info
        if (
          !contactMap.has(emailAddress) || 
          new Date(contactMap.get(emailAddress)!.lastContactedRaw) < sentDate
        ) {
          // Convert the date to ISO format for consistent handling
          const isoDate = sentDate.toISOString();
          
          contactMap.set(emailAddress, {
            id: emailAddress,
            name,
            email: emailAddress,
            lastContactedRaw: email.sentDateTime,
            lastContacted: isoDate // Store in ISO format
          });
        }
      };
      
      // Process all recipient types
      [...email.toRecipients, ...email.ccRecipients, ...email.bccRecipients].forEach(processRecipient);
    }
    
    // Convert map to array and sort by latest contact date (descending)
    return Array.from(contactMap.values())
      .sort((a, b) => new Date(b.lastContactedRaw).getTime() - new Date(a.lastContactedRaw).getTime());
  }
} 