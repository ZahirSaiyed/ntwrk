import React from 'react';
import type { FlaggedContact } from './types.d';
import ProgressBar from '@/components/ProgressBar';
import { motion } from 'framer-motion';
import { Button, Icon, IconName } from '@/components/ui';

type CategoryType = 'ignore' | 'review' | 'keep';

interface ContactCategory {
  email: string;
  category: CategoryType;
}

interface CleanupStep3Props {
  actions: FlaggedContact[];
  categorizations: ContactCategory[];
  onReview: () => void;
  onBack: () => void;
  onComplete: () => void;
  currentStep: number;
  totalSteps: number;
}

interface CategoryDetails {
  label: string;
  icon: IconName;
  color: string;
}

export default function CleanupStep3({
  actions,
  categorizations,
  onReview,
  onBack,
  onComplete,
  currentStep,
  totalSteps,
}: CleanupStep3Props) {
  const totalContacts = actions.length;
  const categoryCounts = categorizations.reduce((acc, { category }) => {
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<CategoryType, number>);

  const categoryInfo: Record<CategoryType, CategoryDetails> = {
    ignore: {
      label: 'To Archive',
      icon: 'BellOff',
      color: 'bg-red-50 text-red-800 border-red-100',
    },
    review: {
      label: 'To Review',
      icon: 'Clock',
      color: 'bg-yellow-50 text-yellow-800 border-yellow-100',
    },
    keep: {
      label: 'To Keep',
      icon: 'Star',
      color: 'bg-green-50 text-green-800 border-green-100',
    },
  };

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
            Review Changes
          </h2>
          <p className="text-sm text-gray-600">
            Confirm your network optimization plan
          </p>
        </motion.div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 space-y-4">
        {/* Category Stats */}
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(categoryInfo).map(([category, info], index) => (
            <motion.div
              key={category}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className={`p-4 rounded-xl border ${info.color.split(' ')[0]} border-${info.color.split(' ')[2]}`}
            >
              <div className="text-xl mb-1">
                <Icon name={info.icon} size={24} />
              </div>
              <div className="text-2xl font-bold">
                {categoryCounts[category as CategoryType] || 0}
              </div>
              <div className="text-sm">{info.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Summary Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <Icon name="Sparkles" size={24} className="text-purple-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Network Impact</h3>
              <p className="text-xs text-gray-600 mt-0.5">
                {categoryCounts.ignore || 0} contacts will be archived, {categoryCounts.review || 0} marked for review
              </p>
            </div>
          </div>
        </motion.div>

        {/* Categorized Contacts */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="p-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Contact Changes</h3>
            <p className="text-xs text-gray-500 mt-1">Review your categorizations</p>
          </div>
          <div className="max-h-[calc(100vh-26rem)] overflow-y-auto divide-y divide-gray-100">
            {actions.map(({ contact, analysis }, index) => {
              const categorization = categorizations.find(c => c.email === contact.email);
              if (!categorization) return null;

              const category = categoryInfo[categorization.category];
              
              return (
                <motion.div
                  key={contact.email}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.7 + index * 0.05 }}
                  className="p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium text-gray-900">
                          {contact.name}
                        </h4>
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${category.color}`}>
                          <Icon name={category.icon} size={12} className="mr-1" /> {category.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{contact.email}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {analysis.reasons.map((reason, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {reason}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Action Buttons - Fixed at bottom */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex justify-between items-center pt-4 px-4 border-t bg-white mt-4"
      >
        <Button
          variant="tertiary"
          onClick={onBack}
          icon="ArrowLeft"
          iconPosition="left"
        >
          Back
        </Button>
        <div className="flex gap-2">
          <Button
            variant="tertiary"
            onClick={onReview}
            icon="Search"
            iconPosition="right"
          >
            Review
          </Button>
          <Button
            variant="primary"
            onClick={onComplete}
            icon="Sparkles"
            iconPosition="right"
            className="bg-gradient-to-r from-[#1E1E3F] to-[#4B4BA6] hover:opacity-90 transform hover:scale-105"
          >
            Apply Changes
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
