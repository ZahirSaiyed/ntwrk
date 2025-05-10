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
  name: string;
  email: string;
  lastContacted: string;
  lastContactedRaw: string; // For sorting
}

export class GraphClient {
  private client: Client;
  
  constructor(accessToken: string) {
    this.client = Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      },
    });
  }
  
  async getSentEmails(limit: number = 100): Promise<EmailMessage[]> {
    try {
      const response = await this.client.api('/me/mailFolders/sentItems/messages')
        .select('sentDateTime,toRecipients,ccRecipients,bccRecipients')
        .top(limit)
        .orderby('sentDateTime desc')
        .get();
      
      return response.value as EmailMessage[];
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
        const name = recipient.emailAddress.name || emailAddress;
        const sentDate = new Date(email.sentDateTime);
        
        // If this contact doesn't exist in our map, or if this email is more recent
        // than the one we have stored, update the contact info
        if (
          !contactMap.has(emailAddress) || 
          new Date(contactMap.get(emailAddress)!.lastContactedRaw) < sentDate
        ) {
          contactMap.set(emailAddress, {
            name,
            email: emailAddress,
            lastContactedRaw: email.sentDateTime,
            lastContacted: format(sentDate, 'MMM d, yyyy, h:mm a')
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