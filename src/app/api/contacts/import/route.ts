import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
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

    // Add metadata to imported contacts
    const processedContacts = contacts.map(contact => ({
      ...contact,
      importedAt: new Date().toISOString(),
      source: 'csv_import',
      lastContacted: contact.lastContacted || new Date().toISOString(),
    }));

    return NextResponse.json(processedContacts, { status: 200 });
  } catch (error: any) {
    console.error('Error importing contacts:', error);
    return NextResponse.json({ 
      error: 'Failed to import contacts',
      details: error.message 
    }, { status: 500 });
  }
} 