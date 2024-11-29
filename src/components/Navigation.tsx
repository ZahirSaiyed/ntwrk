'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

export default function Navigation() {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const routes = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/contacts', label: 'Contacts', icon: '👥' },
    { path: '/insights', label: 'Analytics', icon: '📊' }
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href={session ? '/dashboard' : '/'} className="text-xl font-bold text-[#1E1E3F]">
          Node
        </Link>
        
        <div className="flex items-center gap-6">
          {session ? (
            <>
              {routes.map(route => (
                <Link
                  key={route.path}
                  href={route.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    pathname === route.path
                      ? 'bg-[#F4F4FF] text-[#1E1E3F]'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{route.icon}</span>
                  {route.label}
                </Link>
              ))}
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-gray-600 hover:text-[#1E1E3F] px-3 py-2"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link 
              href="/auth" 
              className="px-6 py-2 bg-[#1E1E3F] text-white rounded-full hover:bg-[#2D2D5F] transition-all"
            >
              Get Started
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
