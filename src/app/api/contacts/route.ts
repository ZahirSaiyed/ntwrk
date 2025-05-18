import { NextResponse } from "next/server";
import { GraphClient } from "@/lib/graph-client";
import { GmailClient } from "@/lib/gmail-client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Contact } from "@/types";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: "You must be signed in to access this API" },
        { status: 401 }
      );
    }

    let contacts: Contact[];
    
    // Use the appropriate client based on the provider
    if (session.provider === 'google') {
      const gmailClient = new GmailClient(session.accessToken);
      contacts = await gmailClient.getUniqueContactsByLatestInteraction();
    } else if (session.provider === 'microsoft-entra-id') {
      const graphClient = new GraphClient(session.accessToken);
      contacts = await graphClient.getUniqueContactsByLatestInteraction();
    } else {
      return NextResponse.json(
        { error: "Unsupported provider" },
        { status: 400 }
      );
    }
    
    if (!Array.isArray(contacts)) {
      console.error("Contacts is not an array:", contacts);
      return NextResponse.json(
        { error: "Invalid contacts data" },
        { status: 500 }
      );
    }
    
    // Transform contacts to match the expected format
    const transformedContacts: Contact[] = contacts.map(contact => {
      const transformed = {
        id: contact.email, // Use email as ID
        name: contact.name,
        email: contact.email,
        lastContacted: contact.lastContacted,
        sentDates: contact.lastContactedRaw ? [contact.lastContactedRaw] : [], // Add sentDates array
        interactions: contact.lastContactedRaw ? [{
          date: contact.lastContactedRaw,
          channel: 'email' as const,
          type: 'sent' as const
        }] : [],
        provider: session.provider as 'google' | 'microsoft-entra-id'
      };
      
      return transformed;
    });
    
    // Set cache control headers for stale-while-revalidate caching strategy
    const response = NextResponse.json({ contacts: transformedContacts });
    response.headers.set(
      'Cache-Control', 
      'public, s-maxage=600, stale-while-revalidate=300'
    );
    
    return response;
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json(
      { error: "Failed to fetch contacts" },
      { status: 500 }
    );
  }
}