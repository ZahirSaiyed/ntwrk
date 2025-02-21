import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: { email: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { industry } = await request.json();
    const email = decodeURIComponent(params.email);

    // Broadcast the update to all connected clients
    const channel = new BroadcastChannel('contact-updates');
    channel.postMessage({ type: 'INDUSTRY_UPDATE', email, industry });
    channel.close();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating industry:', error);
    return NextResponse.json({ error: 'Failed to update industry' }, { status: 500 });
  }
} 