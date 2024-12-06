import { NextResponse } from 'next/server';
import { Contact } from '@/types';
import { getServerSession } from 'next-auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { webhookUrl, contacts } = await request.json();

    if (!webhookUrl || !contacts || !Array.isArray(contacts)) {
      return new NextResponse('Invalid request data', { status: 400 });
    }

    // Validate webhook URL
    try {
      const url = new URL(webhookUrl);
      if (!url.hostname.includes('zapier.com')) {
        return new NextResponse('Invalid Zapier webhook URL', { status: 400 });
      }
    } catch {
      return new NextResponse('Invalid webhook URL format', { status: 400 });
    }

    // Send data to Zapier webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        contacts: contacts.map((contact: Contact) => ({
          name: contact.name,
          email: contact.email,
          company: contact.company,
          lastContacted: contact.lastContacted,
          relationshipStrength: contact.relationshipStrength?.score,
          responseRate: contact.velocity?.interactionMetrics.responseRate,
          tags: contact.tags,
          notes: contact.notes
        }))
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send data to Zapier');
    }

    return new NextResponse(JSON.stringify({
      success: true,
      message: 'Data successfully sent to Zapier',
      contactCount: contacts.length
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Zapier export error:', error);
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to export contacts'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
} 