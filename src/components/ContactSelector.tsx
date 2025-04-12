import React, { useState, useMemo, useEffect } from 'react';
import { Contact } from '@/types';
import { Button, FilterChip, Icon } from '@/components/ui';
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
    // First filter out spam contacts
    const nonSpamContacts = contacts.filter(contact => !(contact as any).isSpam);
    
    if (!filter) return nonSpamContacts;
    const searchTerms = filter.toLowerCase().split(' ');
    return nonSpamContacts.filter(contact => 
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
          <div className="flex items-center gap-2">
            <FilterChip
              label="Same Domain"
              selected={filter.includes('@')}
              onClick={() => {
                const currentDomain = filter.includes('@') ? filter.split('@')[1] : '';
                setFilter(currentDomain ? '' : '@');
              }}
              icon="Globe"
            />
            <Button 
              variant={selected.size === filteredContacts.length ? 'tertiary' : 'primary'}
              onClick={() => {
                const newSelected = new Set([
                  ...Array.from(selected),  // Keep existing selections
                  ...filteredContacts.map(contact => contact.email)  // Add new filtered contacts
                ]);
                setSelected(
                  selected.size === filteredContacts.length ? new Set() : newSelected
                );
              }}
              icon={selected.size === filteredContacts.length ? 'RotateCcw' : 'CheckSquare'}
              iconPosition="right"
              size="sm"
            >
              {selected.size === filteredContacts.length ? 'Deselect All' : 'Select All'}
            </Button>
            <Button 
              variant="danger"
              size="sm"
              onClick={() => {
                setFilter('');
                setSelected(new Set());
              }}
              icon="X"
              iconPosition="left"
            >
              Clear All
            </Button>
          </div>
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
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Icon name="Search" size={18} />
            </div>
          </div>

          <div className="flex gap-2">
            <FilterChip
              label="Recent Contacts"
              icon="Clock"
              onClick={() => {
                const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                const recentEmails = contacts
                  .filter(c => new Date(c.lastContacted) > thirtyDaysAgo)
                  .map(c => c.email);
                setSelected(new Set([...selected, ...recentEmails]));
              }}
            />
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
              <Button
                variant="tertiary"
                size="sm"
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
                className="opacity-0 group-hover:opacity-100"
                icon="Users"
                iconPosition="left"
              >
                Select Similar
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-gray-100">
        <Button
          variant="secondary"
          onClick={onBack}
          icon="ArrowLeft"
          iconPosition="left"
        >
          Back
        </Button>
        <Button
          variant="primary"
          onClick={() => onComplete(selected)}
          disabled={selected.size === 0}
          icon={editingGroup ? 'Save' : 'Plus'}
          iconPosition="right"
        >
          {editingGroup ? 'Save Changes' : 'Create Group'}
        </Button>
      </div>
    </div>
  );
}
