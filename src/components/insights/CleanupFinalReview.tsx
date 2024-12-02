import React from 'react';
import { Contact } from '@/types';
import { motion } from 'framer-motion';

interface CleanupFinalReviewProps {
  cleanContacts: Contact[];
  originalCount: number;
}

export default function CleanupFinalReview({ cleanContacts, originalCount }: CleanupFinalReviewProps) {
  const cleanedCount = cleanContacts.length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center space-y-6"
    >
      <motion.h3
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-lg font-semibold text-gray-900"
      >
        Great Job!
      </motion.h3>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-gray-600"
      >
        Your inbox is now cleaner and more organized.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="flex justify-center gap-8"
      >
        <div className="bg-gray-100 p-6 rounded-lg">
          <h4 className="font-medium text-gray-700">Before</h4>
          <p className="text-xl">{originalCount} contacts</p>
         </div>
        <div className="bg-green-100 p-6 rounded-lg">
          <h4 className="font-medium text-green-700">After</h4>
          <p className="text-xl">{cleanedCount} clean contacts</p>
        </div>
      </motion.div>
      <motion.button
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mt-6 px-6 py-2 bg-[#1E1E3F] text-white rounded-lg hover:bg-[#2D2D5F] transition-colors"
        onClick={() => {
          // Implement redirection logic, e.g., to dashboard
        }}
      >
        View Dashboard
      </motion.button>
    </motion.div>
  );
}
