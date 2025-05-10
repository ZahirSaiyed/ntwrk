import { motion } from 'framer-motion';
import Image from 'next/image';

interface Props {
  onSelect: (outcome: 'all' | 'organize' | 'analyze' | null) => void;
  selectedOutcome: 'all' | 'organize' | 'analyze' | null;
  variant?: 'dashboard' | 'insights';
}

export default function OutcomeSelector({ onSelect, selectedOutcome, variant = 'dashboard' }: Props) {
  const dashboardOutcomes = [
    {
      id: 'all' as const,
      title: 'View My Network',
      description: 'See all your contacts in one place',
      icon: '/undraw_contacts.svg',
      actionText: 'Browse Contacts',
      benefit: 'Get a complete overview of your professional network',
      path: '/contacts'
    },
    {
      id: 'analyze' as const,
      title: 'Network Insights',
      description: 'Discover patterns and opportunities in your network',
      icon: '/undraw_analyze.svg',
      actionText: 'View Insights',
      benefit: 'Make data-driven decisions about your relationships',
      path: '/insights'
    }
  ];

  const insightOutcomes = [
    {
      id: 'organize' as const,
      title: 'Organize Network',
      description: 'Create smart groups and categorize your contacts',
      icon: '/undraw_organize.svg',
      actionText: 'Start Organizing',
      benefit: 'Save time with AI-powered contact organization'
    },
    {
      id: 'analyze' as const,
      title: 'Analyze Patterns',
      description: 'Visualize your network growth and patterns',
      icon: '/undraw_analyze.svg',
      actionText: 'See Analytics',
      benefit: 'Understand your network strength'
    }
  ];

  const outcomes = variant === 'dashboard' ? dashboardOutcomes : insightOutcomes;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {outcomes.map((outcome) => (
        <button
          key={outcome.id}
          onClick={() => onSelect(outcome.id)}
          className="group p-8 bg-white rounded-2xl transition-all hover:shadow-lg hover:scale-[1.02] text-left"
        >
          <div className="h-40 flex items-center justify-center mb-6">
            <Image
              src={outcome.icon}
              alt={outcome.title}
              width={128}
              height={128}
              className="w-32 h-32 group-hover:scale-105 transition-transform"
            />
          </div>
          
          <h3 className="text-2xl font-semibold mb-3">
            {outcome.title}
          </h3>
          <p className="text-gray-600 mb-4">
            {outcome.description}
          </p>
          
          <div className="flex items-center gap-2 text-[#1E1E3F] mb-4">
            <span className="font-medium">{outcome.actionText}</span>
            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" 
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>

          <div className="p-4 bg-[#F4F4FF] rounded-lg">
            <div className="text-sm text-[#1E1E3F]">
              ✨ {outcome.benefit}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
