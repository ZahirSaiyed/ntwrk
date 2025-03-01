import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Get the pathname from the URL
  const { pathname } = request.nextUrl;

  console.log('Middleware - Request:', {
    pathname,
    search: request.nextUrl.search,
    isCallback: pathname.includes('/api/auth/callback')
  });

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
    console.log('Middleware - Allowing public route:', pathname);
    return NextResponse.next();
  }

  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });

  console.log('Middleware - Token check:', {
    pathname,
    hasToken: !!token,
    isAuthPage: pathname.startsWith('/auth')
  });

  // Handle auth pages
  if (pathname.startsWith('/auth')) {
    if (token) {
      console.log('Middleware - Authenticated user on auth page, redirecting to contacts');
      return NextResponse.redirect(new URL('/contacts', request.url));
    }
    return NextResponse.next();
  }

  // Protected routes - require authentication
  if (!token) {
    console.log('Middleware - Unauthenticated user on protected route, redirecting to auth');
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