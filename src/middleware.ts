import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Get the pathname from the URL
  const { pathname } = request.nextUrl;

  // Allow all auth-related routes and public assets
  if (
    pathname.startsWith('/_next') ||     // Next.js static files
    pathname.startsWith('/static') ||    // Static assets
    pathname.includes('.') ||            // Files with extensions (images, etc.)
    pathname === '/' ||                  // Home page
    pathname.startsWith('/api/auth') ||  // NextAuth API routes
    pathname === '/auth' ||              // Auth page
    pathname.startsWith('/auth/')        // Auth-related pages
  ) {
    return NextResponse.next();
  }

  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });

  // Handle auth pages
  if (pathname.startsWith('/auth')) {
    if (token) {
      return NextResponse.redirect(new URL('/contacts', request.url));
    }
    return NextResponse.next();
  }

  // Protected routes - require authentication
  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  return NextResponse.next();
}

// Update matcher configuration
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api/auth (auth endpoints)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|api/auth).*)',
  ],
}; 