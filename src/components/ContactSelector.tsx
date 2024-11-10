import React, { useState, useMemo, useEffect } from 'react';
import { Contact } from '@/types';
// interface Contact {
//   name: string;
//   email: string;
//   lastContacted: string;
// }

interface ContactSelectorProps {
  contacts: Contact[];
  groupName: string;
  onComplete: (selected: Set<string>) => void;
  onBack: () => void;
  initialSelection?: Set<string>;
  editingGroup?: boolean;
}

export default function ContactSelector({ 
  contacts, 
  groupName, 
  onComplete, 
  onBack,
  initialSelection = new Set(),
  editingGroup = false
}: ContactSelectorProps) {
  const [selected, setSelected] = useState(initialSelection);
  const [filter, setFilter] = useState('');
  
  // Initialize selection when initialSelection changes
  useEffect(() => {
    setSelected(initialSelection);
  }, [initialSelection]);

  // Smart filtering system
  const filteredContacts = useMemo(() => {
    if (!filter) return contacts;
    const searchTerms = filter.toLowerCase().split(' ');
    return contacts.filter(contact => 
      searchTerms.every(term =>
        contact.name.toLowerCase().includes(term) ||
        contact.email.toLowerCase().includes(term) ||
        contact.lastContacted.toLowerCase().includes(term)
      )
    );
  }, [contacts, filter]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Select Contacts</h2>
          <p className="text-sm text-gray-500 mt-1">Add members to "{groupName}"</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              const newSelected = new Set(
                filteredContacts.map(contact => contact.email)
              );
              setSelected(
                selected.size === filteredContacts.length ? new Set() : newSelected
              );
            }}
            className="text-sm text-[#1E1E3F] hover:text-[#2D2D5F] transition-colors"
          >
            {selected.size === filteredContacts.length ? 'Deselect All' : 'Select All'}
          </button>
          <span className="text-sm text-gray-600">
            {selected.size} selected
          </span>
        </div>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto">
        {/* Search and Quick Actions */}
        <div className="space-y-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search contacts..."
              className="w-full px-4 py-2.5 pl-10 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E1E3F] focus:border-transparent"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <svg 
              className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => {
                const currentDomain = filter.includes('@') ? filter.split('@')[1] : '';
                setFilter(currentDomain ? '' : '@');
              }}
              className={`px-4 py-2 text-sm text-gray-700 ${
                filter.includes('@') 
                  ? 'bg-[#1E1E3F] text-white' 
                  : 'bg-gray-100 hover:bg-gray-200'
              } rounded-lg transition-colors`}
            >
              Same Domain
            </button>
            <button 
              onClick={() => {
                const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                const recentEmails = contacts
                  .filter(c => new Date(c.lastContacted) > thirtyDaysAgo)
                  .map(c => c.email);
                setSelected(new Set([...selected, ...recentEmails]));
              }}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Recent Contacts
            </button>
            <button 
              onClick={() => {
                setFilter('');
                setSelected(new Set());
              }}
              className="px-4 py-2 text-sm text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors ml-auto"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Contact List */}
        <div className="overflow-y-auto border border-gray-100 rounded-lg" style={{ maxHeight: 'calc(70vh - 280px)' }}>
          {filteredContacts.map(contact => (
            <div 
              key={contact.email}
              onClick={() => {
                const newSelected = new Set(selected);
                if (selected.has(contact.email)) {
                  newSelected.delete(contact.email);
                } else {
                  newSelected.add(contact.email);
                }
                setSelected(newSelected);
              }}
              className="flex items-center justify-between p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 group cursor-pointer"
            >
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selected.has(contact.email)}
                  onChange={(e) => {
                    e.stopPropagation();
                    const newSelected = new Set(selected);
                    if (e.target.checked) {
                      newSelected.add(contact.email);
                    } else {
                      newSelected.delete(contact.email);
                    }
                    setSelected(newSelected);
                  }}
                  className="mr-3 h-4 w-4 rounded border-gray-300 text-[#1E1E3F] focus:ring-[#1E1E3F]"
                />
                <div>
                  <h4 className="font-medium text-gray-900">{contact.name}</h4>
                  <p className="text-sm text-gray-500">{contact.email}</p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const domain = contact.email.split('@')[1];
                  const similarContacts = contacts.filter(c => 
                    c.email.endsWith(`@${domain}`) || 
                    c.name.split(' ')[1] === contact.name.split(' ')[1]
                  );
                  const newSelected = new Set(selected);
                  similarContacts.forEach(c => newSelected.add(c.email));
                  setSelected(newSelected);
                }}
                className="opacity-0 group-hover:opacity-100 text-sm text-[#1E1E3F] hover:text-[#2D2D5F] transition-all"
              >
                Select Similar
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-gray-100">
        <button
          onClick={onBack}
          className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Back
        </button>
        <button
          onClick={() => onComplete(selected)}
          disabled={selected.size === 0}
          className="px-6 py-2 bg-[#1E1E3F] text-white rounded-lg hover:bg-[#2D2D5F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {editingGroup ? 'Save Changes' : 'Create Group'}
        </button>
      </div>
    </div>
  );
}
