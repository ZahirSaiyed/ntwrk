import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Contact } from '@/types';

export async function PUT(
  request: Request,
  { params }: { params: { email: string } }
): Promise<Response> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.text();
    const updatedContact: Contact = JSON.parse(body);
    
    return NextResponse.json(updatedContact, { status: 200 });
  } catch (error: any) {
    console.error('Error updating contact:', error);
    return NextResponse.json({ 
      error: 'Failed to update contact',
      details: error.message 
    }, { status: 500 });
  }
}