import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarSeparator } from '@/components/ui/sidebar';
import { Icon } from '@/components/ui';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { ReactNode, useState, useEffect } from 'react';

const navigation = [
  { name: 'Overview', href: '/overview', icon: 'Home' },
  { name: 'Contacts', href: '/contacts', icon: 'Users' },
  { name: 'Insights', href: '/insights', icon: 'LineChart' },
];

// Separate the sidebar into its own component as shown in the docs
function AppSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Function to get user initials
  const getUserInitials = (name: string | null | undefined): string => {
    if (!name) return 'U';
    
    const nameParts = name.split(' ');
    if (nameParts.length === 1) return nameParts[0][0].toUpperCase();
    
    return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="px-2 py-2">
          <Link href="/overview" className="w-full">
            <SidebarMenuButton tooltip="Node" className="justify-start items-center">
              <div className="bg-gray-900 w-[18px] h-[18px] rounded-full flex-shrink-0 flex items-center justify-center">
                {/* Black circle sized to match navigation icons */}
              </div>
              <span className="font-semibold ml-2 truncate">Node</span>
            </SidebarMenuButton>
          </Link>
        </div>
        <SidebarSeparator />
      </SidebarHeader>
      
      <SidebarContent>
        {session?.user && (
          <SidebarGroup>
            <SidebarGroupLabel>Account</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Profile" className="justify-start items-center">
                    {session.user.image ? (
                      <Image src={session.user.image} alt="" width={18} height={18} className="rounded-full flex-shrink-0" />
                    ) : (
                      <div className="w-[18px] h-[18px] rounded-full bg-sidebar-accent flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-medium">{getUserInitials(session.user.name)}</span>
                      </div>
                    )}
                    <div className="ml-2 flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{session.user.name}</p>
                      <p className="text-xs text-sidebar-foreground/70 truncate">{session.user.email}</p>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        
        <SidebarSeparator />
        
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <Link href={item.href} className="w-full">
                    <SidebarMenuButton isActive={pathname === item.href} tooltip={item.name}>
                      <Icon name={item.icon} size={18} className="flex-shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => signOut({ callbackUrl: '/' })}
                  tooltip="Sign out"
                  className="justify-start items-center"
                >
                  <Icon name="LogOut" size={18} className="flex-shrink-0 text-sidebar-foreground" />
                  <span className="truncate ml-2">Sign Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadingTimer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(loadingTimer);
  }, []);

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-screen bg-[#FAFAFA] items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-10 w-10 bg-gray-900 rounded-full mb-4 flex items-center justify-center">
            {/* Empty black circle for loading state */}
          </div>
          <div className="h-4 w-32 bg-[#1E1E3F]/10 rounded"></div>
        </div>
      </div>
    );
  }

  if (!session) {
    if (typeof window !== 'undefined') {
      window.location.href = '/auth';
    }
    return null;
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen bg-[#FAFAFA] overflow-x-hidden">
        <AppSidebar />
        <main className="flex-1 p-6 overflow-x-auto">
          <div className="flex items-center mb-8">
            <SidebarTrigger 
              className="h-9 w-9 border border-sidebar-border rounded-md text-gray-500 hover:text-gray-900 hover:bg-sidebar-accent/50 transition-colors" 
            />
            <h1 className="ml-4 text-2xl font-semibold text-gray-900">
              {/* Page title would go here */}
            </h1>
          </div>
          <div className="w-full max-w-full">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
