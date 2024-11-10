import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { google } from 'googleapis';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET() {
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
      maxResults: 200
    });

    if (!messagesResponse.data.messages) {
      return NextResponse.json([]);
    }

    const emailAddresses = new Set<string>();
    const contactData = new Map<string, {
      name: string;
      lastContacted: string;
      interactions: {
        date: string;
        type: 'sent' | 'received';
        threadId?: string;
      }[];
    }>();

    // Process messages in batches to avoid rate limits
    const batchSize = 50;
    for (let i = 0; i < messagesResponse.data.messages.length; i += batchSize) {
      const batch = messagesResponse.data.messages.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (message) => {
        try {
          const messageDetails = await gmail.users.messages.get({
            userId: 'me',
            id: message.id!,
            format: 'metadata',
            metadataHeaders: ['From', 'To', 'Date', 'References', 'In-Reply-To', 'Message-ID', 'Subject']
          });

          const headers = messageDetails.data.payload?.headers;
          const fromHeader = headers?.find(h => h.name === 'From')?.value;
          const toHeader = headers?.find(h => h.name === 'To')?.value;
          const dateHeader = headers?.find(h => h.name === 'Date')?.value;

          const extractEmails = (header: string | undefined | null) => {
            if (!header) return [];
            const matches = header.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
            return matches || [];
          };

          const emails = [...extractEmails(fromHeader), ...extractEmails(toHeader)];
          const date = dateHeader ? new Date(dateHeader).toISOString() : new Date().toISOString();

          emails.forEach(email => {
            if (email !== session.user!.email) {
              emailAddresses.add(email);
              const name = fromHeader?.match(/^"?([^"<]+)"?\s*(?:<[^>]+>)?$/)?.[1] || email;
              
              const existing = contactData.get(email) || {
                name: name.trim(),
                lastContacted: date,
                interactions: []
              };

              existing.interactions.push({
                date,
                type: fromHeader?.includes(email) ? 'received' : 'sent',
                threadId: message.threadId || undefined
              });

              if (new Date(existing.lastContacted) < new Date(date)) {
                existing.lastContacted = date;
              }

              contactData.set(email, existing);
            }
          });
        } catch (error) {
          console.error('Error processing message:', message.id, error);
        }
      }));
    }

    const contacts = Array.from(emailAddresses).map(email => ({
      email,
      name: contactData.get(email)?.name || email,
      lastContacted: contactData.get(email)?.lastContacted || new Date().toISOString(),
      interactions: contactData.get(email)?.interactions || []
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
