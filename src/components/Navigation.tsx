'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();
  
  const routes = [
    { path: '/contacts', label: 'Contacts', icon: '👥' },
    { path: '/insights', label: 'Insights', icon: '📊' },
    { path: '/settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <nav 
      className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link 
          href="/"
          className="text-xl font-bold text-[#1E1E3F]"
          aria-label="Home"
        >
          ntwrk
        </Link>
        
        <div className="flex items-center gap-6">
          {routes.map(route => (
            <Link
              key={route.path}
              href={route.path}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                pathname === route.path
                  ? 'bg-[#F4F4FF] text-[#1E1E3F]'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              aria-current={pathname === route.path ? 'page' : undefined}
            >
              <span aria-hidden="true">{route.icon}</span>
              {route.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
