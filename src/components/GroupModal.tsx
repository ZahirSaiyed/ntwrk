'use client';

import { Dialog } from '@headlessui/react';
import { useState, useEffect } from 'react';
import ContactSelector from './ContactSelector';
import { Contact } from '@/types';
import CreateGroupStepper from './CreateGroupStepper';

interface GroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[];
  onGroupCreate: (name: string, members: Set<string>) => void;
  editingGroup?: {
    id: string;
    name: string;
    members: string[];
  };
}

export default function GroupModal({ isOpen, onClose, contacts, onGroupCreate, editingGroup }: GroupModalProps) {
  const [step, setStep] = useState<'name' | 'select'>('name');
  const [groupName, setGroupName] = useState('');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen && editingGroup) {
      setGroupName(editingGroup.name);
    } else if (!isOpen) {
      setGroupName('');
      setStep('name');
    }
  }, [isOpen, editingGroup]);

  const handleCreateGroup = (selectedEmails: Set<string>) => {
    onGroupCreate(groupName, selectedEmails);
    setGroupName('');
    setStep('name');
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-2xl p-6 w-[800px] max-w-[90vw] max-h-[85vh] overflow-hidden flex flex-col shadow-xl">
          <CreateGroupStepper currentStep={step} />
          
          {step === 'name' ? (
            <div className="space-y-6">
              <div>
                <Dialog.Title className="text-2xl font-bold text-gray-900">
                  {editingGroup ? 'Edit Group' : 'Name Your Group'}
                </Dialog.Title>
                <p className="text-sm text-gray-500 mt-1">
                  {editingGroup 
                    ? 'Update the name of your group'
                    : 'Choose a name that describes this collection of contacts'}
                </p>
              </div>
              
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g., Investors, Tech Industry, Healthcare, Finance..."
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E1E3F] focus:border-transparent"
                  autoFocus
                  maxLength={50}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                  {groupName.length}/50
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <button 
                  onClick={onClose}
                  className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => setStep('select')}
                  disabled={!groupName.trim()}
                  className="px-6 py-2 bg-[#1E1E3F] text-white rounded-lg hover:bg-[#2D2D5F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Next
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <ContactSelector
              contacts={contacts}
              groupName={groupName}
              onComplete={handleCreateGroup}
              onBack={() => setStep('name')}
              initialSelection={editingGroup ? new Set(editingGroup.members) : new Set()}
            />
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
