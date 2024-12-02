import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingPromptProps {
  onStartCleanup: () => void;
  onSkip: () => void;
}

export default function OnboardingPrompt({ onStartCleanup, onSkip }: OnboardingPromptProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          exit={{ y: 50 }}
          className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full text-center"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Ready to Declutter Your Inbox?
          </h2>
          <p className="text-gray-600 mb-6">
            Our Inbox Cleanup Assistant can help organize your contacts for better insights.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={onStartCleanup}
              className="px-4 py-2 bg-[#1E1E3F] text-white rounded-lg hover:bg-[#2D2D5F] transition-colors"
            >
              Yes, Let’s Clean Up
            </button>
            <button
              onClick={onSkip}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Skip for Now
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
