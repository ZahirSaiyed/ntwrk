'use client';

import AppLayout from '@/components/Layout/AppLayout';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import NetworkScore from '@/components/insights/NetworkScore';
import TimeframeSelector from '@/components/insights/TimeframeSelector';
import RelationshipTimeline from '@/components/insights/RelationshipTimeline';
import SmartInsights from '@/components/insights/SmartInsights';
import { adaptContacts } from '@/utils/contactAdapter';

// Add useDebounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function InsightsPage() {
  const { data: session } = useSession();
  const [selectedTimeframe, setSelectedTimeframe] = useState<'30d' | '90d' | '1y'>('30d');
  const [currentView, setCurrentView] = useState<'organize' | 'analyze'>('analyze');
  
  // Add search state with debouncing if there's a search input in this page
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 200);
  const [search, setSearch] = useState('');
  
  // Update search when debounced value changes
  useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch]);

  const { data: contacts = [], isLoading } = useQuery(
    ['sentRecipients', session?.user?.email],
    async () => {
      const response = await fetch('/api/contacts');
      if (!response.ok) throw new Error('Failed to fetch contacts');
      const data = await response.json();
      return adaptContacts(data);
    },
    {
      enabled: !!session?.user?.email,
      staleTime: 6 * 60 * 60 * 1000, // 6 hours stale time
      cacheTime: 8 * 60 * 60 * 1000, // 8 hours cache time
    }
  );

  if (isLoading) return <LoadingState />;

  return (
    <AppLayout>
      <div className="flex-1 transition-all duration-200">
        <div className="max-w-[1400px] mx-auto py-8 px-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-[#1E1E3F]">Network Analytics</h1>
            <TimeframeSelector selected={selectedTimeframe} onChange={setSelectedTimeframe} />
          </div>

          <div className="space-y-8">
            <NetworkScore 
              contacts={contacts} 
              onViewChange={setCurrentView}
            />
            
            {currentView === 'organize' ? (
              <SmartInsights 
                contacts={contacts}
                onGroupCreate={() => {}}
              />
            ) : (
              <RelationshipTimeline
                contacts={contacts}
                timeframe={selectedTimeframe}
                isExpanded={true}
                onToggleExpand={() => {}}
              />
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

const LoadingState = () => (
  <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
    <div className="space-y-4 text-center">
      <div className="w-16 h-16 border-4 border-[#1E1E3F] border-t-transparent rounded-full animate-spin mx-auto" />
      <p className="text-gray-600">Analyzing your network...</p>
    </div>
  </div>
);
