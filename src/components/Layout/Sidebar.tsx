import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { motion } from 'framer-motion';

const navigation = [
  { 
    name: 'Overview',
    href: '/overview',
    icon: '🏠',
    description: 'Your network at a glance'
  },
  { 
    name: 'Contacts', 
    href: '/contacts', 
    icon: '👥',
    description: 'Manage your network'
  },
  { 
    name: 'Insights', 
    href: '/insights', 
    icon: '📊',
    description: 'Analytics and trends'
  }
];

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  className?: string;
}

export default function Sidebar({ isCollapsed, setIsCollapsed, className }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <>
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isCollapsed ? 80 : 280,
          opacity: 1,
        }}
        transition={{
          duration: 0.3,
          ease: 'easeInOut'
        }}
        className={`
          fixed top-0 left-0 z-40 h-screen
          bg-white border-r border-gray-200
          transition-all duration-300 ease-in-out
          lg:relative lg:translate-x-0 overflow-hidden
          ${className}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo and Toggle Button */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
            <Link 
              href="/overview" 
              className={`
                text-xl font-bold text-[#1E1E3F] flex items-center gap-2
                ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}
                transition-all duration-200
              `}
            >
              <span className="text-2xl whitespace-nowrap">⚡️</span>
              <span className="whitespace-nowrap">Node</span>
            </Link>
            
            {/* Collapse Toggle */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg 
                className={`w-5 h-5 text-gray-500 transition-transform duration-300`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d={isCollapsed 
                    ? "M11 19l7-7-7-7M4 19l7-7-7-7" 
                    : "M13 5l-7 7 7 7M20 5l-7 7 7 7"
                  }
                />
              </svg>
            </button>
          </div>

          {/* User Profile */}
          {session?.user && (
            <div className="px-4 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3 p-2 rounded-xl bg-gray-50">
                {session.user.image ? (
                  <img 
                    src={session.user.image} 
                    alt="" 
                    className="w-10 h-10 rounded-full ring-2 ring-white"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#F4F4FF] flex items-center justify-center ring-2 ring-white">
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

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6">
            <div className="flex flex-col space-y-4">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl text-sm
                      transition-all duration-200 ease-in-out
                      ${isActive 
                        ? 'bg-[#1E1E3F] text-white' 
                        : 'text-gray-600 hover:bg-gray-50'
                      }
                    `}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className={`font-medium ${isCollapsed ? 'hidden' : 'block'}`}>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-gray-200">
            <button 
              onClick={() => signOut({ callbackUrl: '/' })} 
              className={`
                w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-900 
                rounded-lg hover:bg-gray-50 transition-colors 
                flex items-center gap-2
                ${isCollapsed ? 'justify-center' : 'justify-start'}
              `}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className={isCollapsed ? 'hidden' : 'block'}>Sign Out</span>
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Content Wrapper */}
    </>
  );
}
