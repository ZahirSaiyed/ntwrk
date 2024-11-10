import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

const navigation = [
  { name: 'Home', href: '/', icon: '🏠' },
  { name: 'Contacts', href: '/contacts', icon: '👥' },
  { name: 'Insights', href: '/insights', icon: '📊' },
  { name: 'Settings', href: '/settings', icon: '⚙️' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Mobile Navigation Overlay */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-sm"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-40 h-screen transition-transform
        ${isCollapsed ? '-translate-x-full' : 'translate-x-0'}
        lg:translate-x-0 w-64 bg-white border-r border-gray-200
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <Link href="/" className="text-xl font-bold text-[#1E1E3F]">
            ntwrk
          </Link>
        </div>

        {/* User Info */}
        {session?.user && (
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              {session.user.image ? (
                <img 
                  src={session.user.image} 
                  alt="" 
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#F4F4FF] flex items-center justify-center">
                  {session.user.name?.[0] || '?'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session.user.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {session.user.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-2 rounded-lg text-sm
                  ${isActive 
                    ? 'bg-[#F4F4FF] text-[#1E1E3F] font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                  }
                `}
              >
                <span className="w-5 h-5 flex items-center justify-center">
                  {item.icon}
                </span>
                {item.name}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content Wrapper */}
      <div className="lg:pl-64">
        {/* Your page content goes here */}
      </div>
    </>
  );
}
