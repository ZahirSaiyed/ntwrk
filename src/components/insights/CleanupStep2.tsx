import React, { useState, useEffect } from 'react';
import { Contact } from '@/types';
import type { FlaggedContact } from './types.d';
import TaggingComponent from './TaggingComponent';
import ProgressBar from '@/components/ProgressBar';
import { motion } from 'framer-motion';

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

  const categories = [
    { 
      value: 'ignore' as CategoryType,
      label: 'Hide & Archive',
      icon: '🔕',
      description: 'Marketing emails and low-value contacts',
      color: 'bg-red-50 text-red-700 border-red-100'
    },
    { 
      value: 'review' as CategoryType,
      label: 'Review Later',
      icon: '⏳',
      description: 'Might be valuable, decide later',
      color: 'bg-yellow-50 text-yellow-700 border-yellow-100'
    },
    { 
      value: 'keep' as CategoryType,
      label: 'Important',
      icon: '⭐️',
      description: 'High-value contacts to keep',
      color: 'bg-green-50 text-green-700 border-green-100'
    }
  ];

  // Get encouraging message based on progress
  const getProgressMessage = () => {
    if (progressPercentage === 0) return "Let's get started! 🚀";
    if (progressPercentage === 100) return "Amazing work! 🎉";
    if (progressPercentage > 75) return "Almost there! ✨";
    if (progressPercentage > 50) return "Halfway there! 💪";
    if (progressPercentage > 25) return "Great progress! 🌟";
    return "Keep going! 🎯";
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
            <div className="text-xl mb-1">👥</div>
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
            <div className="text-xl mb-1">✅</div>
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
            <div className="text-xl mb-1">⏳</div>
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
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelectAll();
                }}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1 transition-colors"
              >
                <span>{selectedEmails.size === contacts.length ? 'Deselect All' : 'Select All Contacts'}</span>
                <span>{selectedEmails.size === contacts.length ? '↩️' : '✨'}</span>
              </button>
              {selectedEmails.size > 0 && (
                <span className="text-sm text-gray-600">
                  {selectedEmails.size} selected
                </span>
              )}
            </div>

            {/* Categories */}
            {categories.map((category, index) => (
              <motion.div
                key={category.value}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className={`p-3 rounded-lg border ${category.color} hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer group relative overflow-hidden`}
                whileHover={{
                  y: -2,
                  transition: { duration: 0.2 }
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (selectedEmails.size > 0) {
                    handleBulkAction(category.value);
                  }
                }}
              >
                <motion.div
                  className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"
                  initial={false}
                  whileHover={{ scale: 1.5, rotate: 15 }}
                />
                <div className="flex items-center justify-between mb-2 relative">
                  <div className="flex items-center gap-2">
                    <span className="text-lg group-hover:scale-110 transition-transform">{category.icon}</span>
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
                    <span className="text-sm group-hover:rotate-12 transition-transform">{category.icon}</span>
                  </motion.button>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Fixed Progress Indicator */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="sticky top-0 z-10 bg-white border-b border-gray-100 py-2 mb-2"
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <motion.span
                key={progressPercentage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-gray-600"
              >
                {getProgressMessage()}
              </motion.span>
            </div>
            <motion.div
              key={progressPercentage}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-sm font-medium text-purple-600"
            >
              {progressPercentage}%
            </motion.div>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-[#1E1E3F] to-[#4B4BA6]"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          {showCompletionBadge && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute right-0 -bottom-6 text-sm text-green-600 font-medium bg-white px-2 py-1 rounded-full border border-green-100 shadow-sm"
            >
              ✨ All set!
            </motion.div>
          )}
        </motion.div>

        {/* Contact List with Enhanced Animations */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="p-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Contacts to Optimize</h3>
            <p className="text-xs text-gray-500 mt-1">
              {remainingCount === 0 
                ? "All contacts categorized! 🎉" 
                : `${remainingCount} contacts remaining`}
            </p>
          </div>
          <div className="max-h-[calc(100vh-26rem)] overflow-y-auto">
            {contacts.map((contact, index) => (
              <motion.div
                key={contact.email}
                custom={index}
                variants={listItemVariants}
                initial="hidden"
                animate="visible"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleSelection(contact.email);
                }}
                className={`p-3 border-b border-gray-100 cursor-pointer transition-all ${
                  selectedEmails.has(contact.email) 
                    ? 'bg-purple-50 hover:bg-purple-100' 
                    : 'hover:bg-gray-50'
                }`}
                whileHover={{ x: 4 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div 
                      className={`w-4 h-4 rounded border transition-colors flex items-center justify-center ${
                        selectedEmails.has(contact.email)
                          ? 'bg-purple-600 border-purple-600 text-white'
                          : 'border-gray-300'
                      }`}
                      whileTap={{ scale: 0.9 }}
                    >
                      {selectedEmails.has(contact.email) && (
                        <motion.svg 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-3 h-3" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            fill="currentColor" 
                            d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                          />
                        </motion.svg>
                      )}
                    </motion.div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{contact.name}</h4>
                      <p className="text-xs text-gray-500">{contact.email}</p>
                      {/* Patterns Preview */}
                      {actions.find(a => a.contact.email === contact.email)?.analysis.reasons && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {actions.find(a => a.contact.email === contact.email)?.analysis.reasons.slice(0, 2).map((reason: string, i: number) => (
                            <span
                              key={i}
                              className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600"
                            >
                              {reason}
                            </span>
                          ))}
                          {(actions.find(a => a.contact.email === contact.email)?.analysis.reasons.length || 0) > 2 && (
                            <span className="text-xs text-gray-400">
                              +{(actions.find(a => a.contact.email === contact.email)?.analysis.reasons.length || 0) - 2} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={tags[contact.email] || ''}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleTagChange(contact.email, e.target.value as CategoryType | '');
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className={`text-xs border rounded-lg px-3 py-1.5 bg-white hover:border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:ring-opacity-50 transition-all appearance-none cursor-pointer relative pr-8 font-medium hover:bg-gray-50 active:bg-gray-100 ${
                        tags[contact.email] ? categories.find(c => c.value === tags[contact.email])?.color : ''
                      }`}
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 0.5rem center',
                        backgroundSize: '1.2em 1.2em'
                      }}
                    >
                      <option value="" className="text-gray-500">Select action...</option>
                      {categories.map((cat) => (
                        <option 
                          key={cat.value} 
                          value={cat.value}
                          className="py-1"
                        >
                          {cat.icon} {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Action Buttons with Enhanced Feedback */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="flex justify-between items-center pt-4 px-4 border-t bg-white mt-4"
      >
        <button
          onClick={onBack}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-1"
        >
          <span>←</span>
          <span>Back</span>
        </button>
        <div className="flex gap-2">
          <button
            onClick={onSkip}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Skip
          </button>
          <motion.button
            onClick={onNext}
            disabled={taggedCount === 0}
            whileHover={{ scale: taggedCount > 0 ? 1.02 : 1 }}
            whileTap={{ scale: taggedCount > 0 ? 0.98 : 1 }}
            className={`px-4 py-2 bg-gradient-to-r from-[#1E1E3F] to-[#4B4BA6] text-white rounded-lg transition-all flex items-center gap-1 group ${
              taggedCount === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
            }`}
          >
            <span>Continue</span>
            <span className="text-sm group-hover:rotate-12 transition-transform">→</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
