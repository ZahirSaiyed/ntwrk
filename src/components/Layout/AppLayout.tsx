import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import { ReactNode, useState, useEffect } from 'react';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    setIsCollapsed(true);
  }, [pathname]);

  if (status === 'loading') return null;
  if (!session) {
    router.push('/auth');
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      <Sidebar 
        className="sticky top-0 h-screen"
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      <main className="flex-1 min-h-screen">
        {children}
      </main>
    </div>
  );
}
