import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { useEffect, useRef, memo } from 'react';
import { Icon, IconName } from '@/components/ui';
import { AnimatePresence, motion } from 'framer-motion';

// Define navigation items with modern Lucide icons
const navigation = [
  { 
    name: 'Overview',
    href: '/overview',
    icon: 'Home',
    description: 'Your network at a glance'
  },
  { 
    name: 'Contacts', 
    href: '/contacts', 
    icon: 'Users',
    description: 'Manage your network'
  },
  { 
    name: 'Insights', 
    href: '/insights', 
    icon: 'LineChart',
    description: 'Analytics and trends'
  }
];

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  className?: string;
}

// Memoize navigation links to prevent unnecessary re-renders
const NavLink = memo(({ 
  href, 
  icon, 
  name, 
  isActive, 
  isCollapsed 
}: { 
  href: string;
  icon: IconName;
  name: string;
  isActive: boolean;
  isCollapsed: boolean;
}) => (
  <Link
    href={href}
    className={`
      group flex items-center gap-3 px-4 py-3 rounded-xl text-sm
      transition-all duration-200 
      ${isActive 
        ? 'bg-[#1E1E3F] text-white shadow-sm' 
        : 'text-gray-600 hover:bg-gray-50 hover:text-[#1E1E3F]'
      }
    `}
    prefetch
  >
    <div className="w-6 h-6 flex items-center justify-center">
      <Icon 
        name={icon} 
        size={isCollapsed ? 20 : 18} 
        className={`
          transition-all duration-300
          ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-[#1E1E3F]'}
        `}
      />
    </div>
    
    <AnimatePresence initial={false}>
      {!isCollapsed && (
        <motion.span 
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 'auto' }}
          exit={{ opacity: 0, width: 0 }}
          transition={{ duration: 0.2 }}
          className="font-medium whitespace-nowrap overflow-hidden"
        >
          {name}
        </motion.span>
      )}
    </AnimatePresence>
  </Link>
));

NavLink.displayName = 'NavLink';

export default function Sidebar({ isCollapsed, setIsCollapsed, className }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const sidebarRef = useRef<HTMLElement>(null);
  
  // CSS variable approach for width transitions (more performant)
  useEffect(() => {
    if (sidebarRef.current) {
      sidebarRef.current.style.setProperty('--sidebar-width', isCollapsed ? '80px' : '280px');
    }
  }, [isCollapsed]);

  return (
    <aside
      ref={sidebarRef}
      className={`
        fixed top-0 left-0 z-[100] h-screen
        bg-white border-r border-gray-200
        lg:relative lg:translate-x-0 overflow-hidden
        ${isCollapsed ? 'w-20' : 'w-[280px]'}
        transition-all duration-300 ease-in-out
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
              ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'}
              transition-all duration-200
            `}
          >
            <span className="text-2xl whitespace-nowrap flex-shrink-0">⚡️</span>
            <span className="whitespace-nowrap">Node</span>
          </Link>
          
          {/* Collapse Toggle - Optimized with single icon */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#1E1E3F]/20"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Icon 
              name={isCollapsed ? "ChevronRight" : "ChevronLeft"} 
              size={20} 
              className="text-gray-500"
            />
          </button>
        </div>

        {/* User Profile - Optimized with conditional rendering */}
        {session?.user && (
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center gap-3 p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              {session.user.image ? (
                <Image 
                  src={session.user.image} 
                  alt="Profile" 
                  width={40}
                  height={40}
                  className="rounded-full ring-2 ring-white flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#F4F4FF] flex items-center justify-center ring-2 ring-white flex-shrink-0">
                  {session.user.name?.[0] || '?'}
                </div>
              )}
              
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {session.user.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {session.user.email}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation - Memoized for performance */}
        <nav className="flex-1 px-3 py-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          <div className="flex flex-col space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <NavLink
                  key={item.name}
                  href={item.href}
                  icon={item.icon}
                  name={item.name}
                  isActive={isActive}
                  isCollapsed={isCollapsed}
                />
              );
            })}
          </div>
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={() => signOut({ callbackUrl: '/' })} 
            className={`
              w-full px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 
              rounded-lg hover:bg-gray-50 transition-colors 
              flex items-center gap-2 group
              ${isCollapsed ? 'justify-center' : 'justify-start'}
              focus:outline-none focus:ring-2 focus:ring-[#1E1E3F]/20
            `}
            aria-label="Sign out"
          >
            <Icon 
              name="LogOut" 
              size={18} 
              className="text-gray-500 group-hover:text-gray-900 transition-colors"
            />
            
            {!isCollapsed && (
              <span>Sign Out</span>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
