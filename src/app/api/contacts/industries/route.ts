import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const updates = await request.json();
    
    // Broadcast updates to all connected clients
    const channel = new BroadcastChannel('contact-updates');
    
    // Send each update individually to maintain granular UI updates
    updates.forEach((update: { email: string; industry: string }) => {
      channel.postMessage({ 
        type: 'INDUSTRY_UPDATE', 
        email: update.email, 
        industry: update.industry 
      });
    });
    
    channel.close();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating industries:', error);
    return NextResponse.json({ error: 'Failed to update industries' }, { status: 500 });
  }
} 