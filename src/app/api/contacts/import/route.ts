import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { enrichBatchViaAI } from '@/utils/enrichBatchViaAI';
import { Contact } from '@/types';

export async function POST(
  request: Request
): Promise<Response> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { contacts } = await request.json();

    // Validate the imported contacts
    if (!Array.isArray(contacts)) {
      return NextResponse.json({ error: 'Invalid contacts data' }, { status: 400 });
    }

    // Validate each contact has required fields
    const validationErrors = contacts.map((contact, index) => {
      const errors: string[] = [];
      if (!contact.email) errors.push('Email is required');
      if (!contact.name) errors.push('Name is required');
      if (contact.email && !contact.email.includes('@')) errors.push('Invalid email format');
      return errors.length > 0 ? { row: index + 1, errors } : null;
    }).filter(Boolean);

    if (validationErrors.length > 0) {
      return NextResponse.json({ 
        error: 'Validation failed',
        details: validationErrors
      }, { status: 400 });
    }

    // Add metadata to imported contacts
    const processedContacts: Contact[] = contacts.map(contact => ({
      id: contact.email, // Use email as ID
      name: contact.name,
      email: contact.email.toLowerCase(),
      company: contact.company || '',
      lastContacted: contact.lastContacted || new Date().toISOString(),
      lastContactedRaw: contact.lastContacted || new Date().toISOString(),
      importedAt: new Date().toISOString(),
      source: 'csv_import',
      customFields: contact.customFields || [],
      tags: contact.tags || [],
      notes: contact.notes || '',
      interactions: [],
      sentDates: [],
      velocity: {
        score: 0,
        trend: 'stable',
        interactionMetrics: {
          last30Days: 0,
          last90Days: 0,
          responseRate: 0,
          averageResponseTime: 0
        }
      }
    }));

    // Enrich contacts with AI
    const enrichedContacts = await enrichBatchViaAI(processedContacts, {
      delayMs: 200,
      maxRetries: 2,
      cacheByDomain: true,
      userEmail: session.user.email
    });

    return NextResponse.json(enrichedContacts, { status: 200 });
  } catch (error: any) {
    console.error('Error importing contacts:', error);
    return NextResponse.json({ 
      error: 'Failed to import contacts',
      details: error.message 
    }, { status: 500 });
  }
} 