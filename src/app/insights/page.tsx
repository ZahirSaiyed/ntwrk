'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NetworkScore from '@/components/insights/NetworkScore';
import TimeframeSelector from '@/components/insights/TimeframeSelector';
import ActionableInsights from '@/components/insights/ActionableInsights';
import RelationshipTimeline from '@/components/insights/RelationshipTimeline';
import toast from 'react-hot-toast';
import Link from 'next/link';
import SmartInsights from '@/components/SmartInsights';
import OutcomeSelector from '@/components/insights/OutcomeSelector';

export default function InsightsPage() {
  const { data: session } = useSession();
  const [selectedTimeframe, setSelectedTimeframe] = useState<'30d' | '90d' | '1y'>('30d');
  const [selectedOutcome, setSelectedOutcome] = useState<'organize' | 'engage' | 'analyze' | null>(null);

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['contacts', session?.user?.email],
    queryFn: async () => {
      const response = await fetch('/api/contacts');
      if (!response.ok) throw new Error('Failed to fetch contacts');
      return response.json();
    },
    enabled: !!session?.user?.email,
  });

  const handleGroupCreate = async (groupName: string, contactIds: Set<string>) => {
    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: groupName, contactIds: Array.from(contactIds) }),
      });
      if (!response.ok) throw new Error('Failed to create group');
      toast.success('Group created successfully');
    } catch (error) {
      toast.error('Failed to create group');
    }
  };

  const handleActionComplete = () => {
    // Optionally refresh data or update UI
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/contacts" className="flex items-center gap-2 text-gray-500 hover:text-[#1E1E3F]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Contacts
          </Link>
          <TimeframeSelector selected={selectedTimeframe} onChange={setSelectedTimeframe} />
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Network Health Overview */}
        <section className="mb-12">
          <NetworkScore contacts={contacts} />
        </section>

        {/* New Outcome Selector */}
        <OutcomeSelector onSelect={setSelectedOutcome} selectedOutcome={selectedOutcome} />

        {/* Dynamic Content Based on Selection */}
        <AnimatePresence mode="wait">
          {selectedOutcome === 'organize' && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <SmartInsights contacts={contacts} onGroupCreate={handleGroupCreate} />
            </motion.section>
          )}

          {selectedOutcome === 'engage' && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ActionableInsights
                contacts={contacts}
                timeframe={selectedTimeframe}
                isExpanded={true}
                onToggleExpand={() => {}}
                onActionComplete={handleActionComplete}
              />
            </motion.section>
          )}

          {selectedOutcome === 'analyze' && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <RelationshipTimeline
                contacts={contacts}
                timeframe={selectedTimeframe}
                isExpanded={true}
                onToggleExpand={() => {}}
              />
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </div>
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
