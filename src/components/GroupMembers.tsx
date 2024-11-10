import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

interface Contact {
  email: string;
  name: string;
  lastContacted: string;
}

interface GroupMembersProps {
  title: string;
  members: Set<string>;
  contacts: Contact[];
  icon?: string;
  description?: string;
  onCreateGroup?: (name: string, members: Set<string>) => void;
}

export default function GroupMembers({ 
  title, 
  members, 
  contacts,
  icon,
  description,
  onCreateGroup 
}: GroupMembersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const matchingContacts = contacts.filter(c => members.has(c.email));
  
  return (
    <button
      onClick={() => setIsExpanded(!isExpanded)}
      className={`w-full text-left p-4 bg-[#F4F4FF] rounded-xl hover:bg-[#E4E4FF] transition-all group ${
        isExpanded ? 'shadow-md' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
            {icon ? (
              <span className="text-xl">{icon}</span>
            ) : (
              <span className="text-lg font-medium text-[#1E1E3F]">
                {title.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <div className="font-medium text-[#1E1E3F]">{title}</div>
            <div className="text-sm text-gray-500">
              {members.size} contacts {description && `· ${description}`}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {onCreateGroup && (
            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[#1E1E3F] text-sm">
              Create Group →
            </span>
          )}
          <svg 
            className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-3">
              {matchingContacts.map(contact => (
                <div 
                  key={contact.email} 
                  className="flex items-center gap-3 p-2 hover:bg-white rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-[#1E1E3F] rounded-full flex items-center justify-center text-white text-sm">
                    {contact.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-sm text-[#1E1E3F]">{contact.name}</div>
                    <div className="text-xs text-gray-500">
                      Last contact: {formatDistanceToNow(new Date(contact.lastContacted))} ago
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
