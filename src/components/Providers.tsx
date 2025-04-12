'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { ReactNode, useState } from 'react';
import { TooltipProvider } from '@/components/ui/TooltipProvider';
import { Toaster } from 'react-hot-toast';

export default function Providers({ 
  children, 
  session 
}: { 
  children: ReactNode;
  session: any;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider session={session}>
        <TooltipProvider>
          {children}
          <Toaster position="bottom-right" />
        </TooltipProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
