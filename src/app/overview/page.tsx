'use client';

import AppLayout from '@/components/Layout/AppLayout';
import { useRouter } from 'next/navigation';
import OutcomeSelector from '@/components/insights/OutcomeSelector';

export default function DashboardPage() {
  const router = useRouter();

  const handleOutcomeSelect = (outcome: 'all' | 'organize' | 'engage' | 'analyze' | null) => {
    if (!outcome) return;
    
    switch (outcome) {
      case 'all':
        router.push('/contacts');
        break;
      case 'analyze':
        router.push('/insights');
        break;
    }
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#1E1E3F] mb-4">
            Welcome to Node! 👋
          </h1>
          <p className="text-xl text-gray-600">
            Let's get started by choosing what you'd like to do
          </p>
        </div>

        <OutcomeSelector 
          onSelect={handleOutcomeSelect}
          selectedOutcome={null}
          variant="dashboard"
        />
      </div>
    </AppLayout>
  );
} 