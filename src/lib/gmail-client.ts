import { google } from 'googleapis';
import { format } from 'date-fns';

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

export class GmailClient {
  private oauth2Client: any;
  private cache: {
    sentEmails?: EmailMessage[];
    lastFetch?: number;
  } = {};
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  
  constructor(accessToken: string) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    this.oauth2Client.setCredentials({
      access_token: accessToken
    });
  }

  private parseEmailAddress(emailStr: string): EmailContact {
    // Improved regex to capture full quoted names with spaces
    const match = emailStr.match(/^"?([^"<]*)"?\s*<([^>]+)>$/);
    let displayName = '';
    let email = '';
    if (match) {
      const name = match[1]?.trim();
      email = match[2]?.trim().toLowerCase() || '';
      // If name is present and not an email, use it; otherwise use the email
      if (name && !/^\S+@\S+\.\S+$/.test(name)) {
        displayName = name;
      } else {
        displayName = email;
      }
    } else {
      // Fallback for plain email addresses
      email = emailStr.replace(/"/g, '').trim().toLowerCase();
      displayName = email;
    }
    return {
      emailAddress: {
        name: displayName,
        address: email
      }
    };
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
      const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
      const response = await gmail.users.messages.list({
        userId: 'me',
        q: 'in:sent',
        maxResults: limit
      });

      const messages = await Promise.all(
        (response.data.messages || []).map(async (message) => {
          const details = await gmail.users.messages.get({
            userId: 'me',
            id: message.id!,
            format: 'metadata',
            metadataHeaders: ['From', 'To', 'Cc', 'Bcc', 'Date']
          });

          const headers = details.data.payload?.headers || [];
          const getHeader = (name: string) => 
            headers.find(h => h.name?.toLowerCase() === name.toLowerCase())?.value || '';

          const dateStr = getHeader('Date');
          if (!this.isValidDate(dateStr)) {
            console.warn(`Invalid date format for message ${message.id}: ${dateStr}`);
            return null;
          }

          const to = getHeader('To').split(',').map(email => this.parseEmailAddress(email));
          const cc = getHeader('Cc').split(',').map(email => this.parseEmailAddress(email));
          const bcc = getHeader('Bcc').split(',').map(email => this.parseEmailAddress(email));

          return {
            sentDateTime: dateStr,
            toRecipients: to,
            ccRecipients: cc,
            bccRecipients: bcc
          };
        })
      );

      // Filter out null messages and update cache
      const validMessages = messages.filter((msg): msg is EmailMessage => msg !== null);
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