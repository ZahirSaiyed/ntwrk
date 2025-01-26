import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { google, gmail_v1 } from 'googleapis';
import { authOptions } from '@/lib/auth';
import OpenAI from 'openai';

interface MessageHeader {
  name: string;
  value: string;
}

// Common email providers to exclude from company extraction
const COMMON_EMAIL_PROVIDERS = new Set([
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'aol.com',
  'icloud.com',
  'me.com',
  'mail.com',
  'protonmail.com',
  'zoho.com',
  'live.com',
  'msn.com',
  'fastmail.com',
  'yandex.com',
  'tutanota.com',
  'hey.com',
  'pm.me',
  'gmx.com',
  'web.de',
  'mac.com',
  'qq.com',
  '163.com',
  'sina.com',
  'yeah.net',
  'foxmail.com',
  'ymail.com',
  'rocketmail.com',
  'btinternet.com',
  'comcast.net',
  'verizon.net',
  'att.net',
  'sbcglobal.net',
  'bellsouth.net',
  'cox.net',
  'earthlink.net',
  'juno.com',
  'optonline.net',
  'rediffmail.com',
  'aim.com',
  'edu'
]);

// Industry classification data
const INDUSTRY_KEYWORDS = new Map([
  // Technology & Software
  ['tech', ['software', 'tech', 'digital', 'cyber', 'cloud', 'ai', 'data', 'analytics', 'app', 'apps', 'mobile', 'web', 'dev', 'io', 'computing', 'systems', 'technologies']],
  ['fintech', ['fintech', 'pay', 'financial', 'banking', 'finance', 'capital', 'invest', 'trading', 'wealth', 'asset', 'money']],
  ['healthcare', ['health', 'medical', 'biotech', 'pharma', 'therapeutics', 'life sciences', 'care', 'clinic', 'hospital', 'med', 'bio']],
  ['ecommerce', ['shop', 'retail', 'commerce', 'market', 'store', 'buy', 'goods', 'cart', 'shopping']],
  ['media', ['media', 'news', 'entertainment', 'film', 'music', 'game', 'gaming', 'studio', 'creative', 'content', 'production']],
  ['consulting', ['consulting', 'consultancy', 'advisory', 'advisors', 'partners', 'group', 'solutions', 'strategy']],
  ['real estate', ['realty', 'property', 'properties', 'real estate', 'housing', 'home', 'homes', 'estate']],
  ['manufacturing', ['manufacturing', 'industrial', 'industries', 'factory', 'factories', 'production', 'materials']],
  ['energy', ['energy', 'solar', 'renewable', 'power', 'electric', 'utilities', 'battery', 'green']],
  ['education', ['education', 'learning', 'academy', 'school', 'training', 'university', 'institute', 'college']],
  ['legal', ['legal', 'law', 'attorney', 'lawyers', 'advocates', 'llp', 'counsel', 'firm']],
  ['marketing', ['marketing', 'advertising', 'ad', 'ads', 'agency', 'brand', 'communications', 'pr', 'seo']],
  ['logistics', ['logistics', 'shipping', 'transport', 'delivery', 'freight', 'supply', 'chain']],
  ['security', ['security', 'protection', 'defense', 'secure', 'guard', 'surveillance']],
  ['hr', ['hr', 'recruiting', 'talent', 'staffing', 'recruitment', 'personnel', 'workforce']],
  ['insurance', ['insurance', 'insure', 'risk', 'coverage', 'protect', 'assurance']],
  ['telecom', ['telecom', 'communications', 'network', 'wireless', 'broadband', 'cellular', 'mobile']],
  ['automotive', ['auto', 'car', 'automotive', 'vehicle', 'motors', 'mobility']],
  ['aerospace', ['aerospace', 'space', 'aviation', 'aircraft', 'defense', 'satellite']],
  ['construction', ['construction', 'builders', 'building', 'contractors', 'engineering', 'infrastructure']]
]);

// Common company suffixes to remove for better matching
const COMPANY_SUFFIXES = new Set([
  'inc', 'llc', 'ltd', 'limited', 'corp', 'corporation', 'co', 'company', 'group', 
  'holdings', 'international', 'worldwide', 'global', 'technologies', 'solutions',
  'enterprises', 'industries', 'services', 'systems', 'consulting'
]);

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Carefully crafted prompt for accurate industry detection
const SYSTEM_PROMPT = `You are an expert at identifying company industries. Your task is to classify companies into specific industries based on their names and domains. Respond ONLY with the industry name, nothing else. Choose from these industries:

Technology, Fintech, Healthcare, E-commerce, Media, Consulting, Real Estate, Manufacturing, Energy, Education, Legal, Marketing, Logistics, Security, HR, Insurance, Telecom, Automotive, Aerospace, Construction, AI/ML, Biotech, Crypto, Gaming, Travel, Food & Beverage, Fashion, Agriculture, Environmental, Professional Services, Finance, Startups, Government, Non-Profit

If unsure, respond with the most likely industry based on available information. If completely uncertain, respond with "Unknown".`;

const USER_PROMPT_TEMPLATE = (companies: { name: string, domain: string }[]) => {
  return companies.map(c => 
    `Company: ${c.name}${c.domain ? `, Domain: ${c.domain}` : ''}`
  ).join('\n');
};

const detectIndustry = async (companies: { name: string, domain: string }[]): Promise<{ [key: string]: string }> => {
  try {
    const results: { [key: string]: string } = {};
    
    // Process in batches of 20 for cost efficiency
    const BATCH_SIZE = 20;
    
    for (let i = 0; i < companies.length; i += BATCH_SIZE) {
      const batch = companies.slice(i, i + BATCH_SIZE);
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: USER_PROMPT_TEMPLATE(batch) }
        ],
        temperature: 0.1,
        max_tokens: 100,
      });

      const industries = completion.choices[0]?.message?.content?.split('\n') || [];
      
      // Map results back to companies
      batch.forEach((company, index) => {
        const key = `${company.name}|${company.domain}`;
        results[key] = industries[index]?.trim() || 'Unknown';
      });
    }

    return results;
  } catch (error) {
    console.error('Error detecting industries:', error);
    return {};
  }
};

// Update the contact data interface
interface Contact {
  name: string;
  email: string;
  company: string;
  industry: string;
  lastContacted: string;
  interactions: Array<{
    date: string;
    type: 'sent' | 'received';
    threadId?: string;
    participants?: string[];
  }>;
}

// Helper function to extract company from email metadata only
const extractCompanyInfo = async (
  email: string,
  name: string,
): Promise<{ company: string; industry: string }> => {
  let company = '';
  const fullDomain = email.split('@')[1]?.toLowerCase();
  
  // Use existing company extraction logic
  if (fullDomain) {
    if (!COMMON_EMAIL_PROVIDERS.has(fullDomain) && !fullDomain.endsWith('.edu')) {
      // Get the first part of the domain for company name
      company = fullDomain
        .split('.')[0]
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
  }

  // Try to extract from name if no company found
  if (!company) {
    const companyInName = name.match(/\((.*?)\)|\[(.*?)\]/);
    if (companyInName) {
      company = companyInName[1] || companyInName[2];
    }
  }

  // Initialize industry as empty string
  let industry = '';
  
  // Only call detectIndustry if we have a company name
  if (company) {
    const companyInfo = [{
      name: company,
      domain: fullDomain || '' // Send the complete domain
    }];
    const industries = await detectIndustry(companyInfo);
    const key = `${company}|${fullDomain}`;
    industry = industries[key] || '';
  }

  return { company, industry };
};

// Update the email extraction function
const extractEmailAndName = async (header: string | undefined | null) => {
  if (!header) return { email: '', name: '', company: '', industry: '' };
  
  const standardMatch = header.match(/^(?:"?([^"<]+)"?\s*)?<(.+@.+)>$/);
  if (standardMatch) {
    const [_, name, email] = standardMatch;
    const cleanName = name?.replace(/"/g, '').trim() || email.split('@')[0];
    const { company, industry } = await extractCompanyInfo(email, cleanName);
    return {
      email,
      name: cleanName,
      company,
      industry
    };
  }
  
  const emailMatch = header.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  if (emailMatch) {
    const email = emailMatch[1];
    const name = email.split('@')[0];
    const { company, industry } = await extractCompanyInfo(email, name);
    return {
      email,
      name,
      company,
      industry
    };
  }
  
  return { email: '', name: '', company: '', industry: '' };
};

export async function GET(
  request: Request
): Promise<NextResponse> {
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
      await gmail.users.getProfile({ userId: 'me' });
    } catch (error: any) {
      console.error('Gmail API authentication error:', error);
      return NextResponse.json({ 
        error: 'Gmail API authentication failed',
        details: error.message 
      }, { status: 401 });
    }

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
      company: string;
      industry: string;
      lastContacted: string;
      interactions: Array<{
        date: string;
        type: 'sent' | 'received';
        threadId?: string;
        participants?: string[];
      }>;
    }>();

    const batchSize = 50;
    for (let i = 0; i < messagesResponse.data.messages.length; i += batchSize) {
      const batch = messagesResponse.data.messages.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (message) => {
        try {
          const messageDetails = await gmail.users.messages.get({
            userId: 'me',
            id: message.id || '',
            format: 'metadata',
            metadataHeaders: ['From', 'To', 'Cc', 'Bcc', 'Date']
          });

          const headers = messageDetails.data.payload?.headers as MessageHeader[];
          const fromHeader = headers?.find((h: MessageHeader) => h.name === 'From')?.value;
          const toHeader = headers?.find((h: MessageHeader) => h.name === 'To')?.value;
          const ccHeader = headers?.find((h: MessageHeader) => h.name === 'Cc')?.value;
          const bccHeader = headers?.find((h: MessageHeader) => h.name === 'Bcc')?.value;
          const dateHeader = headers?.find((h: MessageHeader) => h.name === 'Date')?.value;

          const fromEmails = await extractEmailAndName(fromHeader);
          const date = dateHeader ? new Date(dateHeader).toISOString() : new Date().toISOString();

          if (fromEmails.email && fromEmails.email !== session.user!.email) {
            emailAddresses.add(fromEmails.email);
            const existing = contactData.get(fromEmails.email.toLowerCase()) || {
              name: fromEmails.name || fromEmails.email,
              email: fromEmails.email.toLowerCase(),
              company: fromEmails.company,
              industry: fromEmails.industry,
              lastContacted: date,
              interactions: []
            };

            // Update company if we found one and the existing one is empty
            if (fromEmails.company && !existing.company) {
              existing.company = fromEmails.company;
            }

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

          const processRecipients = async (header: string | undefined | null) => {
            if (!header) return [];
            const recipients = header.split(',');
            return await Promise.all(recipients.map(email => extractEmailAndName(email.trim())));
          };

          const toRecipients = await processRecipients(toHeader);
          const ccRecipients = await processRecipients(ccHeader);
          const bccRecipients = await processRecipients(bccHeader);

          const allRecipients = [...toRecipients, ...ccRecipients, ...bccRecipients]
            .filter(r => r.email && r.email.toLowerCase() !== session.user?.email?.toLowerCase());

          if (allRecipients.length > 0 && session.user?.email) {
            const senderEmail = session.user.email;
            const senderContact = contactData.get(senderEmail.toLowerCase()) || {
              name: session.user.name || senderEmail,
              email: senderEmail.toLowerCase(),
              company: '',
              industry: '',
              lastContacted: date,
              interactions: []
            };

            if (allRecipients.some(r => r.email.toLowerCase() !== senderEmail.toLowerCase())) {
              senderContact.interactions.push({
                date,
                type: 'sent',
                threadId: message.threadId || undefined,
                participants: allRecipients.map(r => r.email)
              });

              if (new Date(senderContact.lastContacted) < new Date(date)) {
                senderContact.lastContacted = date;
              }

              contactData.set(senderEmail.toLowerCase(), senderContact);
            }
          }

          allRecipients.forEach(recipient => {
            if (recipient.email) {
              emailAddresses.add(recipient.email);
              const existing = contactData.get(recipient.email.toLowerCase()) || {
                name: recipient.name || recipient.email,
                email: recipient.email.toLowerCase(),
                company: recipient.company,
                industry: recipient.industry,
                lastContacted: date,
                interactions: []
              };

              // Update company if we found one and the existing one is empty
              if (recipient.company && !existing.company) {
                existing.company = recipient.company;
              }

              existing.interactions.push({
                date,
                type: 'received',
                threadId: message.threadId || undefined,
                participants: [session.user!.email!]
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

    // After processing all emails, detect industries for companies
    const companiesForIndustryDetection = Array.from(contactData.values())
      .filter(contact => contact.company && !contact.industry)
      .map(contact => ({
        name: contact.company,
        domain: contact.email.split('@')[1]
      }));

    if (companiesForIndustryDetection.length > 0) {
      const industries = await detectIndustry(companiesForIndustryDetection);
      
      // Update contact data with detected industries
      contactData.forEach(contact => {
        if (contact.company && !contact.industry) {
          const key = `${contact.company}|${contact.email.split('@')[1]}`;
          contact.industry = industries[key] || '';
        }
      });
    }

    const contacts = Array.from(contactData.values()).map(contact => ({
      email: contact.email,
      name: contact.name,
      company: contact.company,
      industry: contact.industry,
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