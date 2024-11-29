import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Contact } from '@/types';

export async function PUT(
  request: Request,
  { params }: { params: { email: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.text(); // Get raw body text first
    const updatedContact: Contact = JSON.parse(body); // Then parse it
    
    // Return the updated contact with proper headers
    return new NextResponse(JSON.stringify(updatedContact), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error('Error updating contact:', error);
    return NextResponse.json({ 
      error: 'Failed to update contact',
      details: error.message 
    }, { status: 500 });
  }
}