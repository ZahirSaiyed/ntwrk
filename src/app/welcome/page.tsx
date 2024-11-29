'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import OutcomeSelector from '@/components/insights/OutcomeSelector';
import { useEffect } from 'react';

export default function WelcomePage() {
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    localStorage.setItem('hasSeenWelcome', 'true');
  }, []);

  const handleOutcomeSelect = (outcome: 'all' | 'organize' | 'engage' | 'analyze' | null) => {
    if (!outcome) return;
    
    switch (outcome) {
      case 'all':
        router.push('/contacts');
        break;
      case 'organize':
        router.push('/contacts?view=groups');
        break;
      case 'engage':
        router.push('/insights?view=actions');
        break;
      case 'analyze':
        router.push('/insights?view=timeline');
        break;
    }
  };

  return (
    <OutcomeSelector 
      onSelect={handleOutcomeSelect}
      selectedOutcome={null}
    />
  );
}
