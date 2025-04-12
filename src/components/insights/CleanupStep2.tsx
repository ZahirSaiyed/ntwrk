import React, { useState, useEffect } from 'react';
import { Contact } from '@/types';
import type { FlaggedContact } from './types.d';
import TaggingComponent from './TaggingComponent';
import ProgressBar from '@/components/ProgressBar';
import { motion } from 'framer-motion';
import { Button, Icon, FilterChip, IconName } from '@/components/ui';

type CategoryType = 'ignore' | 'review' | 'keep';

interface CleanupStep2Props {
  contacts: Contact[];
  actions: FlaggedContact[];
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  currentStep: number;
  totalSteps: number;
  totalContactsCount: number;
  onCategorize: (categories: { [email: string]: CategoryType }) => void;
}

interface CategoryInfo {
  value: CategoryType;
  label: string;
  icon: IconName;
  description: string;
  color: string;
}

export default function CleanupStep2({
  contacts,
  actions,
  onNext,
  onBack,
  onSkip,
  currentStep,
  totalSteps,
  totalContactsCount,
  onCategorize,
}: CleanupStep2Props) {
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [tags, setTags] = useState<Record<string, CategoryType>>({});
  const [showCompletionBadge, setShowCompletionBadge] = useState(false);

  // Calculate progress based on valid tags
  const taggedCount = Object.keys(tags).length;
  const remainingCount = contacts.length - taggedCount;
  const progressPercentage = Math.round((taggedCount / contacts.length) * 100);

  // Update completion badge visibility
  useEffect(() => {
    if (progressPercentage === 100) {
      setShowCompletionBadge(true);
      const timer = setTimeout(() => {
        setShowCompletionBadge(false);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setShowCompletionBadge(false);
    }
  }, [progressPercentage]);

  const toggleSelection = (email: string) => {
    const newSelection = new Set(selectedEmails);
    if (newSelection.has(email)) {
      newSelection.delete(email);
    } else {
      newSelection.add(email);
    }
    setSelectedEmails(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedEmails.size === contacts.length) {
      // If all are selected, clear selection
      setSelectedEmails(new Set());
    } else {
      // Select all contacts
      const allEmails = contacts.map(contact => contact.email);
      setSelectedEmails(new Set(allEmails));
    }
  };

  const handleBulkAction = (category: CategoryType) => {
    if (selectedEmails.size === 0) return;

    const newTags = { ...tags };
    Array.from(selectedEmails).forEach(email => {
      newTags[email] = category;
    });
    
    setTags(newTags);
    setSelectedEmails(new Set());
    onCategorize(newTags);
  };

  const handleTagChange = (email: string, category: CategoryType | '') => {
    const newTags = { ...tags };
    if (category === '') {
      delete newTags[email];
    } else {
      newTags[email] = category;
    }
    setTags(newTags);
    onCategorize(newTags);
  };

  // Update parent component whenever tags change
  useEffect(() => {
    onCategorize(tags);
  }, [tags, onCategorize]);

  const categories: CategoryInfo[] = [
    { 
      value: 'ignore' as CategoryType,
      label: 'Hide & Archive',
      icon: 'BellOff',
      description: 'Marketing emails and low-value contacts',
      color: 'bg-red-50 text-red-700 border-red-100'
    },
    { 
      value: 'review' as CategoryType,
      label: 'Review Later',
      icon: 'Clock',
      description: 'Might be valuable, decide later',
      color: 'bg-yellow-50 text-yellow-700 border-yellow-100'
    },
    { 
      value: 'keep' as CategoryType,
      label: 'Important',
      icon: 'Star',
      description: 'High-value contacts to keep',
      color: 'bg-green-50 text-green-700 border-green-100'
    }
  ];

  // Get encouraging message based on progress
  const getProgressMessage = () => {
    if (progressPercentage === 0) return "Let's get started!";
    if (progressPercentage === 100) return "Amazing work!";
    if (progressPercentage > 75) return "Almost there!";
    if (progressPercentage > 50) return "Halfway there!";
    if (progressPercentage > 25) return "Great progress!";
    return "Keep going!";
  };

  // Calculate category counts for badges
  const categoryCounts = Object.values(tags).reduce((acc, category) => {
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<CategoryType, number>);

  // Animation variants for list items
  const listItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: 0.9 + i * 0.05,
        duration: 0.3,
        ease: "easeOut"
      }
    })
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-h-[800px]">
      <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
      
      {/* Hero Section */}
      <div className="text-center py-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[#1E1E3F] to-[#4B4BA6] bg-clip-text text-transparent">
            Smart Contact Organization
          </h2>
          <p className="text-sm text-gray-600">
            Organize your contacts efficiently
          </p>
        </motion.div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 space-y-4">
        {/* Stats Summary */}
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
              {contacts.length}
            </div>
            <div className="text-sm text-indigo-600">To Optimize</div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-green-50 p-4 rounded-xl border border-green-100"
          >
            <div className="text-xl mb-1">
              <Icon name="CheckCircle" size={24} className="text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-700">
              {taggedCount}
            </div>
            <div className="text-sm text-green-600">Categorized</div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-blue-50 p-4 rounded-xl border border-blue-100"
          >
            <div className="text-xl mb-1">
              <Icon name="Clock" size={24} className="text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-700">
              {remainingCount}
            </div>
            <div className="text-sm text-blue-600">Remaining</div>
          </motion.div>
        </div>

        {/* Categories with Bulk Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="p-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Categories</h3>
            <p className="text-xs text-gray-500 mt-1">Choose how to handle each contact</p>
          </div>
          <div className="p-3 space-y-3">
            {/* Quick Selection */}
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <Button
                variant="tertiary"
                onClick={(e) => {
                  e.preventDefault();
                  handleSelectAll();
                }}
                icon={selectedEmails.size === contacts.length ? "RotateCcw" : "CheckSquare"}
                iconPosition="right"
                size="sm"
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                {selectedEmails.size === contacts.length ? 'Deselect All' : 'Select All Contacts'}
              </Button>
              {selectedEmails.size > 0 && (
                <span className="text-sm text-gray-600">
                  {selectedEmails.size} selected
                </span>
              )}
            </div>

            {/* Progress Indicator */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <div className="text-sm font-medium text-gray-600">{getProgressMessage()}</div>
                <div className="text-sm font-medium text-gray-600">{progressPercentage}%</div>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[#1E1E3F]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Categories */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              {categories.map((category, index) => (
                <motion.div
                  key={category.value}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className={`
                    p-4 rounded-xl border ${category.color.split(' ')[0]} ${category.color.split(' ')[2]}
                    cursor-pointer hover:shadow-sm group transition-all
                  `}
                  onClick={() => {
                    if (selectedEmails.size > 0) {
                      handleBulkAction(category.value);
                    }
                  }}
                >
                  <div className="flex items-center justify-between mb-2 relative">
                    <div className="flex items-center gap-2">
                      <span className="text-lg group-hover:scale-110 transition-transform">
                        <Icon name={category.icon} size={22} />
                      </span>
                      <div>
                        <div className="font-medium text-sm group-hover:text-opacity-90">{category.label}</div>
                        <div className="text-xs opacity-75 group-hover:opacity-90">{category.description}</div>
                      </div>
                    </div>
                    {categoryCounts[category.value] > 0 && (
                      <motion.span
                        className="text-sm font-medium px-2 py-1 rounded-full bg-white bg-opacity-50 group-hover:bg-opacity-70 transition-all"
                        whileHover={{ scale: 1.05 }}
                      >
                        {categoryCounts[category.value]}
                      </motion.span>
                    )}
                  </div>
                  {selectedEmails.size > 0 && (
                    <motion.button
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleBulkAction(category.value);
                      }}
                      className="w-full mt-2 px-3 py-1.5 bg-white bg-opacity-50 hover:bg-opacity-75 rounded-lg transition-all flex items-center justify-center gap-2 text-sm font-medium group-hover:shadow-sm"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span>Mark {selectedEmails.size} contacts as {category.label}</span>
                      <Icon name={category.icon} size={16} className="group-hover:rotate-12 transition-transform" />
                    </motion.button>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Contacts List */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="p-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Contact List</h3>
            <p className="text-xs text-gray-500 mt-1">Categorize individual contacts</p>
          </div>
          <div className="divide-y divide-gray-100 max-h-[calc(100vh-26rem)] overflow-y-auto">
            {showCompletionBadge && (
              <div className="bg-green-50 p-3 text-green-700 flex items-center gap-2">
                <Icon name="CheckCircle" size={18} />
                <span className="font-medium text-sm">✨ All set!</span>
              </div>
            )}
            {contacts.map((contact, index) => {
              // Get assigned category for this contact
              const assignedCategory = tags[contact.email] || '';
              const isSelected = selectedEmails.has(contact.email);
              
              return (
                <motion.div
                  key={contact.email}
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  variants={listItemVariants}
                  className={`
                    p-3 transition-colors hover:bg-gray-50
                    ${isSelected ? 'bg-blue-50' : ''}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelection(contact.email)}
                        className="h-4 w-4 rounded border-gray-300 text-[#1E1E3F] focus:ring-[#1E1E3F]"
                      />
                      <div>
                        <div className="font-medium text-gray-900">
                          {contact.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {contact.email}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {categories.map(category => (
                        <button
                          key={category.value}
                          onClick={() => handleTagChange(contact.email, assignedCategory === category.value ? '' : category.value)}
                          className={`
                            p-1.5 rounded-full transition-colors
                            ${assignedCategory === category.value 
                              ? `${category.color.split(' ')[0]} ${category.color.split(' ')[1]}` 
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }
                          `}
                          title={category.label}
                        >
                          <Icon name={category.icon} size={16} />
                        </button>
                      ))}
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
            onClick={onSkip}
          >
            Skip
          </Button>
          <Button
            variant="primary"
            onClick={onNext}
            disabled={taggedCount === 0}
            icon="ArrowRight"
            iconPosition="right"
            className="bg-gradient-to-r from-[#1E1E3F] to-[#4B4BA6] hover:opacity-90 transform hover:scale-105"
          >
            Continue
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
