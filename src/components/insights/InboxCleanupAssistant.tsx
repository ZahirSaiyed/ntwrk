import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Contact } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Switch } from '@headlessui/react';
import { analyzeContact, SpamDetectionResult } from '../../utils/spamDetection';
import CleanupStep1 from './CleanupStep1';
import CleanupStep2 from './CleanupStep2';
import CleanupStep3 from './CleanupStep3';
import { toast } from 'react-hot-toast';

interface ContactWithSpam extends Contact {
  isSpam?: boolean;
}

interface InboxCleanupAssistantProps {
  contacts: Contact[];
  onMarkAsSpam: (emails: string[]) => void;
  onUndo: (email: string) => void;
  onExcludeFromAnalytics: (exclude: boolean) => void;
  onClose: () => void;
}

interface FlaggedContact {
  contact: Contact;
  analysis: SpamDetectionResult;
}

type CategoryType = 'ignore' | 'review' | 'keep';

interface ContactCategory {
  email: string;
  category: CategoryType;
}

// Define clear categories for better organization
export const EMAIL_PATTERNS = {
  marketing: {
    title: 'Marketing & Promotions',
    patterns: [
      'promotions?',
      'deals?',
      'offer',
      'sale',
      'discount',
      'store',
      'shop',
      'buy',
      'special',
      'promo',
      '@marketing',
    ],
    icon: '🏷️',
  },
  notifications: {
    title: 'Notifications & Alerts',
    patterns: [
      'notification',
      'alert(s)?',
      'notify',
      'update',
      'status',
      'reminder',
      'confirm',
      'notice',
      '@alerts?',
    ],
    icon: '🔔',
  },
  newsletters: {
    title: 'Newsletters & Updates',
    patterns: [
      'newsletter(s)?',
      'news',
      'weekly',
      'monthly',
      'digest',
      'info',
      'learn',
      'list(s)?',
      '^info@',
      'subscribe',
      '@news',
      '@info',
      '@list(s)?',
    ],
    icon: '📰',
  },
  automated: {
    title: 'Automated Messages',
    patterns: [
      'noreply',
      'no-reply',
      'do-not-reply',
      'automated',
      'system',
      'mailer-daemon',
      '^mail@',
      '^email@',
      '^donotreply@',
      'notifications?@',
      '@mail\\.',
      '@mailer\\.',
    ],
    icon: '🤖',
  },
  corporate: {
    title: 'Corporate Communications',
    patterns: [
      'team',
      'office',
      'careers',
      'hr',
      'human-?resources',
      'recruiting',
      'talent',
      '^hello@',
      'company',
      '@team',
      '@office',
      '@careers',
    ],
    icon: '🏢',
  },
  support: {
    title: 'Customer Support',
    patterns: [
      'support',
      'help',
      'service',
      'contact',
      'feedback',
      'survey',
      'care',
      'assist',
      '^reviews?@',
      '@support',
      '@service',
      '@survey',
    ],
    icon: '💬',
  },
  travel: {
    title: 'Travel & Logistics',
    patterns: [
      'mileageplan',
      'travel',
      'flight',
      'booking',
      'reservation',
      'itinerary',
      'rewards?',
    ],
    icon: '✈️',
  },
  general: {
    title: 'General Communications',
    patterns: [
      'calendar',
      'events?',
      'invite',
      'rsvp',
      'schedule',
    ],
    icon: '📅',
  }
}

export default function InboxCleanupAssistant({ 
  contacts, 
  onMarkAsSpam, 
  onUndo,
  onExcludeFromAnalytics,
  onClose
}: InboxCleanupAssistantProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [flaggedContacts, setFlaggedContacts] = useState<FlaggedContact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [recentActions, setRecentActions] = useState<Array<{
    email: string;
    action: 'spam' | 'keep';
    timestamp: number;
  }>>([]);
  const [excludeFromAnalytics, setExcludeFromAnalytics] = useState(true);
  const [showUndo, setShowUndo] = useState(false);
  const [lastMarked, setLastMarked] = useState<string>('');
  const [spamContacts, setSpamContacts] = useState<Set<string>>(new Set());
  const [categorizedContacts, setCategorizedContacts] = useState<ContactCategory[]>([]);
  const [spamEmails, setSpamEmails] = useState<Set<string>>(new Set());

  // Memoize the filtered contacts to prevent infinite loops
  const contactsToProcess = useMemo(() => 
    contacts.filter(contact => 
      !(contact as ContactWithSpam).isSpam && 
      !spamEmails.has(contact.email)
    ), 
    [contacts, spamEmails]
  );

  useEffect(() => {
    const analyzed = contacts
      .filter(contact => !spamContacts.has(contact.email))
      .map(contact => ({
        contact,
        analysis: analyzeContact(contact)
      }))
      .filter(result => result.analysis.isSpam);
    
    setFlaggedContacts(analyzed);
    
    // Reset categorizations when contacts change
    setCategorizedContacts([]);
  }, [contacts, spamContacts]);

  const handleCategorization = (categories: { [email: string]: CategoryType }) => {
    const newCategories = Object.entries(categories).map(([email, category]) => ({
      email,
      category,
    }));
    setCategorizedContacts(newCategories);
  };

  const handleComplete = async () => {
    // Get emails to archive from categorized contacts
    const emailsToArchive = categorizedContacts
      .filter(contact => contact.category === 'ignore')
      .map(contact => contact.email);

    if (emailsToArchive.length > 0) {
      // Update local spam state
      setSpamEmails(prev => new Set([...prev, ...emailsToArchive]));
      
      // Call parent handler to mark as spam
      onMarkAsSpam(emailsToArchive);
      
      // Show success message
      toast.success(`${emailsToArchive.length} contacts archived`);
      
      // Close the assistant
      onClose();
    }
  };

  const handleMarkAsSpam = useCallback((emails: string[]) => {
    setSpamEmails(prev => {
      const newSet = new Set(prev);
      emails.forEach(email => newSet.add(email));
      return newSet;
    });
    onMarkAsSpam(emails);
  }, [onMarkAsSpam]);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <CleanupStep1 
                 flaggedCount={flaggedContacts.length} 
                 onNext={() => setCurrentStep(2)} 
                 onSkip={onClose}
                 spamResults={flaggedContacts.map(fc => ({
                   email: fc.contact.email,
                   result: fc.analysis
                 }))}
                 totalContactsCount={contacts.length}
                 currentStep={currentStep}
                 totalSteps={3}
               />;
      case 2:
        return <CleanupStep2 
                 contacts={flaggedContacts.map(fc => fc.contact)} 
                 actions={flaggedContacts}
                 onNext={() => setCurrentStep(3)} 
                 onBack={() => setCurrentStep(1)} 
                 onSkip={onClose}
                 currentStep={currentStep}
                 totalSteps={3}
                 totalContactsCount={contacts.length}
                 onCategorize={handleCategorization}
               />;
      case 3:
        return <CleanupStep3 
                 actions={flaggedContacts} 
                 categorizations={categorizedContacts}
                 onReview={() => setCurrentStep(2)}
                 onBack={() => setCurrentStep(2)} 
                 onComplete={handleComplete}
                 currentStep={currentStep}
                 totalSteps={3}
               />;
      default:
        return (
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900">All Steps Completed!</h3>
            <p className="text-gray-600">Your contacts are organized and ready for better insights.</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-[#1E1E3F] text-white rounded-lg hover:bg-[#2D2D5F] transition-colors"
            >
              Finish
            </button>
          </div>
        );
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="cleanup-assistant"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          exit={{ y: 50 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-xl shadow-lg pt-12 px-6 pb-6 max-w-lg w-full relative"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-lg hover:bg-gray-100 transition-colors group"
          >
            <div className="relative">
              <span className="sr-only">Close</span>
              <svg 
                className="w-5 h-5 text-gray-400 group-hover:text-gray-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </div>
          </button>

          {/* Step Content */}
          {renderStep()}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
