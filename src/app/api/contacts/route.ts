import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { google } from 'googleapis';
import { authOptions } from '@/lib/auth';

interface MessageHeader {
  name: string;
  value: string;
}

export async function GET(): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email || !session.accessToken) {
    return NextResponse.json({ 
      error: 'Unauthorized'
    }, { status: 401 });
  }

  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: session.accessToken });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    
    try {
      // Test the token with a simple API call first
      await gmail.users.getProfile({ userId: 'me' });
    } catch (error: any) {
      console.error('Gmail API authentication error:', error);
      return NextResponse.json({ 
        error: 'Gmail API authentication failed',
        details: error.message 
      }, { status: 401 });
    }

    // Get only sent emails - reduce maxResults from 500 to 100 for better performance
    const messagesResponse = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 100,
      q: 'in:sent'
    });

    if (!messagesResponse.data.messages) {
      return NextResponse.json([]);
    }

    const contactData = new Map<string, {
      name: string;
      email: string;
      lastSent: string;
      sentDates: string[];
    }>();

    // Process messages in batches to avoid rate limits
    const batchSize = 50;
    const batches = [];

    for (let i = 0; i < messagesResponse.data.messages.length; i += batchSize) {
      batches.push(messagesResponse.data.messages.slice(i, i + batchSize));
    }

    // Process up to 3 batches concurrently instead of serially
    const processBatch = async (batch: typeof messagesResponse.data.messages) => {
      await Promise.all(batch.map(async (message) => {
        try {
          const messageDetails = await gmail.users.messages.get({
            userId: 'me',
            id: message.id || '',
            format: 'metadata',
            metadataHeaders: ['To', 'Cc', 'Bcc', 'Date']
          });

          const headers = messageDetails.data.payload?.headers as MessageHeader[];
          const toHeader = headers?.find((h: MessageHeader) => h.name === 'To')?.value;
          const ccHeader = headers?.find((h: MessageHeader) => h.name === 'Cc')?.value;
          const bccHeader = headers?.find((h: MessageHeader) => h.name === 'Bcc')?.value;
          const dateHeader = headers?.find((h: MessageHeader) => h.name === 'Date')?.value;

          const extractEmailAndName = (header: string | undefined | null) => {
            if (!header) return { email: '', name: '' };
            
            // First try to match the standard format "Name <email@domain.com>"
            const standardMatch = header.match(/^(?:"?([^"<]+)"?\s*)?<(.+@.+)>$/);
            if (standardMatch) {
              const [_, name, email] = standardMatch;
              return {
                email: email.toLowerCase(),
                name: name?.replace(/"/g, '').trim() || email.split('@')[0]
              };
            }
            
            // If no standard format, just extract the email
            const emailMatch = header.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
            if (emailMatch) {
              const email = emailMatch[1].toLowerCase();
              return {
                email: email,
                name: email.split('@')[0]
              };
            }
            
            return { email: '', name: '' };
          };

          const date = dateHeader ? new Date(dateHeader).toISOString() : new Date().toISOString();

          const processRecipients = (header: string | undefined | null) => {
            if (!header) return [];
            return header.split(',').map(email => extractEmailAndName(email.trim()));
          };

          const toRecipients = processRecipients(toHeader);
          const ccRecipients = processRecipients(ccHeader);
          const bccRecipients = processRecipients(bccHeader);

          // Process all recipients
          [...toRecipients, ...ccRecipients, ...bccRecipients].forEach(recipient => {
            if (recipient.email && 
                session.user?.email && 
                recipient.email.toLowerCase() !== session.user.email.toLowerCase()) {
              
              const existing = contactData.get(recipient.email) || {
                name: recipient.name || recipient.email,
                email: recipient.email,
                lastSent: date,
                sentDates: []
              };

              existing.sentDates.push(date);

              // Update lastSent if this email is more recent
              if (new Date(existing.lastSent) < new Date(date)) {
                existing.lastSent = date;
              }

              contactData.set(recipient.email, existing);
            }
          });
        } catch (error) {
          console.error('Error processing message:', message.id, error);
        }
      }));
    };

    // Process batches concurrently with a maximum of 3 at a time
    for (let i = 0; i < batches.length; i += 3) {
      const batchesToProcess = batches.slice(i, i + 3);
      await Promise.all(batchesToProcess.map(processBatch));
    }

    // Convert the Map to an array of contacts
    const contacts = Array.from(contactData.values()).map(contact => ({
      email: contact.email,
      name: contact.name,
      lastContacted: contact.lastSent, // Keep the field name as lastContacted for backward compatibility
      sentDates: contact.sentDates
    }));

    return NextResponse.json(contacts);
  } catch (error: any) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch contacts',
      details: error.message 
    }, { status: 500 });
  }
}