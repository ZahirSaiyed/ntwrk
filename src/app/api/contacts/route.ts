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

    // Get recent emails
    const messagesResponse = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 500,
      q: 'in:sent OR in:inbox'
    });

    if (!messagesResponse.data.messages) {
      return NextResponse.json([]);
    }

    const emailAddresses = new Set<string>();
    const contactData = new Map<string, {
      name: string;
      email: string;
      lastContacted: string;
      interactions: Array<{
        date: string;
        type: 'sent' | 'received';
        threadId?: string;
        participants?: string[];
      }>;
    }>();

    // Process messages in batches to avoid rate limits
    const batchSize = 50;
    for (let i = 0; i < messagesResponse.data.messages.length; i += batchSize) {
      const batch = messagesResponse.data.messages.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (message) => {
        try {
          const messageDetails = await gmail.users.messages.get({
            userId: 'me',
            id: message.id || '',
            format: 'metadata',
            metadataHeaders: ['From', 'To', 'Cc', 'Bcc', 'Date', 'References', 'In-Reply-To', 'Message-ID']
          });

          const headers = messageDetails.data.payload?.headers as MessageHeader[];
          const fromHeader = headers?.find((h: MessageHeader) => h.name === 'From')?.value;
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
                email: email,
                name: name?.replace(/"/g, '').trim() || email.split('@')[0]
              };
            }
            
            // If no standard format, just extract the email
            const emailMatch = header.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
            if (emailMatch) {
              const email = emailMatch[1];
              return {
                email: email,
                name: email.split('@')[0]
              };
            }
            
            return { email: '', name: '' };
          };

          const fromEmails = extractEmailAndName(fromHeader);
          const date = dateHeader ? new Date(dateHeader).toISOString() : new Date().toISOString();

          if (fromEmails.email && fromEmails.email !== session.user!.email) {
            emailAddresses.add(fromEmails.email);
            const existing = contactData.get(fromEmails.email.toLowerCase()) || {
              name: fromEmails.name || fromEmails.email,
              email: fromEmails.email.toLowerCase(),
              lastContacted: date,
              interactions: []
            };

            existing.interactions.push({
              date,
              type: 'received',
              threadId: message.threadId || undefined
            });

            if (new Date(existing.lastContacted) < new Date(date)) {
              existing.lastContacted = date;
            }

            contactData.set(fromEmails.email.toLowerCase(), existing);
          }

          const processRecipients = (header: string | undefined | null) => {
            if (!header) return [];
            return header.split(',').map(email => extractEmailAndName(email.trim()));
          };

          const toRecipients = processRecipients(toHeader);
          const ccRecipients = processRecipients(ccHeader);
          const bccRecipients = processRecipients(bccHeader);

          // Process all recipients
          const allRecipients = [...toRecipients, ...ccRecipients, ...bccRecipients]
            .map(r => r.email)
            .filter((email): email is string => {
              if (!email || !session.user?.email) return false;
              // Skip if recipient is the same as sender (case-insensitive)
              return email.toLowerCase() !== session.user.email.toLowerCase();
            });

          if (allRecipients.length > 0 && session.user?.email) {
            // Store the sent message in the sender's contact record
            const senderEmail = session.user.email;
            const senderContact = contactData.get(senderEmail.toLowerCase()) || {
              name: session.user.name || senderEmail,
              email: senderEmail.toLowerCase(),
              lastContacted: date,
              interactions: []
            };

            // Only store if we're actually sending to someone else
            if (allRecipients.some(r => r.toLowerCase() !== senderEmail.toLowerCase())) {
              senderContact.interactions.push({
                date,
                type: 'sent',
                threadId: message.threadId || undefined,
                participants: allRecipients
              });

              if (new Date(senderContact.lastContacted) < new Date(date)) {
                senderContact.lastContacted = date;
              }

              contactData.set(senderEmail.toLowerCase(), senderContact);
            }
          }

          // Also store the interaction for each recipient
          [...toRecipients, ...ccRecipients, ...bccRecipients].forEach(recipient => {
            if (recipient.email && 
                session.user?.email && 
                recipient.email.toLowerCase() !== session.user.email.toLowerCase()) {
              emailAddresses.add(recipient.email);
              const existing = contactData.get(recipient.email.toLowerCase()) || {
                name: recipient.name || recipient.email,
                email: recipient.email.toLowerCase(),
                lastContacted: date,
                interactions: []
              };

              existing.interactions.push({
                date,
                type: 'received',
                threadId: message.threadId || undefined,
                participants: [session.user.email]
              });

              if (new Date(existing.lastContacted) < new Date(date)) {
                existing.lastContacted = date;
              }

              contactData.set(recipient.email.toLowerCase(), existing);
            }
          });
        } catch (error) {
          console.error('Error processing message:', message.id, error);
        }
      }));
    }

    const contacts = Array.from(contactData.values()).map(contact => ({
      email: contact.email,
      name: contact.name,
      lastContacted: contact.lastContacted,
      interactions: contact.interactions
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