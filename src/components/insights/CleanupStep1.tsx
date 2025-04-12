import React from 'react';
import { motion } from 'framer-motion';
import { SpamDetectionResult } from '@/utils/spamDetection';
import ProgressBar from '@/components/ProgressBar';
import { Button, Icon } from '@/components/ui';

interface CleanupStep1Props {
  flaggedCount: number;
  spamResults: { email: string; result: SpamDetectionResult }[];
  totalContactsCount: number;
  onNext: () => void;
  onSkip: () => void;
  currentStep: number;
  totalSteps: number;
}

export default function CleanupStep1({ 
  flaggedCount, 
  spamResults,
  totalContactsCount,
  onNext, 
  onSkip, 
  currentStep, 
  totalSteps 
}: CleanupStep1Props) {
  const potentialSpamCount = spamResults.length;
  const uniquePatterns = new Set(spamResults.flatMap(r => r.result.reasons)).size;

  // Group contacts by pattern for impact analysis
  const patternImpact = spamResults.reduce((acc, { result }) => {
    result.reasons.forEach(reason => {
      if (!acc[reason]) acc[reason] = 0;
      acc[reason]++;
    });
    return acc;
  }, {} as Record<string, number>);

  // Sort patterns by impact
  const sortedPatterns = Object.entries(patternImpact)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-h-[800px]">
      <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
      
      {/* Hero Section - Kept minimal */}
      <div className="text-center py-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[#1E1E3F] to-[#4B4BA6] bg-clip-text text-transparent">
            Network Optimization
          </h2>
          <p className="text-sm text-gray-600">
            Let's enhance your professional network
          </p>
        </motion.div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-indigo-50 p-4 rounded-xl border border-indigo-100"
          >
            <div className="text-xl mb-1">
              <Icon name="Users" size={24} className="text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-indigo-700">
              {totalContactsCount}
            </div>
            <div className="text-sm text-indigo-600">Total Contacts</div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-purple-50 p-4 rounded-xl border border-purple-100"
          >
            <div className="text-xl mb-1">
              <Icon name="Sparkles" size={24} className="text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-700">
              {potentialSpamCount}
            </div>
            <div className="text-sm text-purple-600">To Optimize</div>
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-blue-50 p-4 rounded-xl border border-blue-100"
          >
            <div className="text-xl mb-1">
              <Icon name="Search" size={24} className="text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-700">
              {uniquePatterns}
            </div>
            <div className="text-sm text-blue-600">Patterns Found</div>
          </motion.div>
        </div>

        {/* Key Insights with Impact */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="p-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Optimization Insights</h3>
            <p className="text-xs text-gray-500 mt-1">Key patterns detected in your network</p>
          </div>
          <div className="space-y-2 p-3">
            {sortedPatterns.map(([pattern, count], index) => (
              <motion.div
                key={pattern}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {index === 0 ? (
                      <Icon name="Target" size={20} className="text-red-500" />
                    ) : index === 1 ? (
                      <Icon name="BarChart" size={20} className="text-blue-500" />
                    ) : (
                      <Icon name="Sparkles" size={20} className="text-purple-500" />
                    )}
                  </span>
                  <span className="text-sm text-gray-900">{pattern}</span>
                </div>
                <span className="text-sm font-medium text-purple-600">
                  {count} {count === 1 ? 'contact' : 'contacts'}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right column - More compact Sample Contacts */}
        <div className="col-span-7">
          <div className="bg-white rounded-xl border border-gray-100 h-full">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="font-medium text-gray-900">Sample Contacts</h3>
              <p className="text-sm text-gray-500 mt-0.5">Examples of contacts that could be optimized</p>
            </div>
            <div className="divide-y divide-gray-100">
              {spamResults
                .filter(r => r.result.confidence > 50)
                .slice(0, 3)
                .map((result) => (
                  <div key={result.email} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-medium text-sm">
                          {result.email.charAt(0).toUpperCase()}
                        </div>
                        <p className="text-sm font-medium text-gray-900">{result.email}</p>
                      </div>
                      <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium">
                        {result.result.confidence}% match
                      </span>
                    </div>
                    <div className="pl-10 mt-2">
                      <div className="flex flex-wrap gap-1.5">
                        {result.result.reasons.map((reason, i) => (
                          <span key={i} className="px-2 py-0.5 bg-gray-50 text-gray-600 rounded-md text-xs">
                            {reason}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Value Proposition */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-sm border border-indigo-100 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <Icon name="Sparkles" size={28} className="text-purple-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Ready to optimize?</h3>
              <p className="text-xs text-gray-600 mt-0.5">
                Clean up your network and focus on meaningful connections
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Action Buttons - Fixed at bottom */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.0 }}
        className="flex justify-between items-center pt-4 px-4 border-t bg-white mt-4"
      >
        <Button
          variant="tertiary"
          onClick={onSkip}
        >
          Do Later
        </Button>
        <Button
          variant="primary"
          onClick={onNext}
          icon="Sparkles"
          iconPosition="right"
          className="bg-gradient-to-r from-[#1E1E3F] to-[#4B4BA6] hover:opacity-90 transform hover:scale-105 group"
        >
          Get Started
        </Button>
      </motion.div>
    </div>
  );
}