import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [showKeyboardTip, setShowKeyboardTip] = useState(false);
  const contactListRef = useRef<HTMLDivElement>(null);
  
  // Initialize selection when initialSelection changes
  useEffect(() => {
    setSelected(initialSelection);
  }, [initialSelection]);

  // Check localStorage for keyboard tip on first render
  useEffect(() => {
    const hasSeenKeystrokeTip = localStorage.getItem('hasSeenKeystrokeTip');
    if (!hasSeenKeystrokeTip) {
      // Show the tip after a short delay
      const timer = setTimeout(() => {
        setShowKeyboardTip(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  // Auto-dismiss tooltip after 5 seconds
  useEffect(() => {
    if (showKeyboardTip) {
      const timer = setTimeout(() => {
        dismissTip();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showKeyboardTip]);

  // Handle tip dismissal
  const dismissTip = () => {
    setShowKeyboardTip(false);
    localStorage.setItem('hasSeenKeystrokeTip', 'true');
  };
  
  // Smart filtering system
  const filteredContacts = useMemo(() => {
    // First filter out spam contacts
    const nonSpamContacts = contacts.filter(contact => !(contact as any).isSpam);
    
    // Apply text search filter
    const textFiltered = !filter ? nonSpamContacts : nonSpamContacts.filter(contact => {
      const searchTerms = filter.toLowerCase().split(' ');
      return searchTerms.every(term =>
        contact.name.toLowerCase().includes(term) ||
        contact.email.toLowerCase().includes(term) ||
        contact.lastContacted.toLowerCase().includes(term)
      );
    });
    
    // Apply active filters
    if (activeFilters.size === 0) return textFiltered;
    
    return textFiltered.filter(contact => {
      if (activeFilters.has('recent')) {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return new Date(contact.lastContacted) > thirtyDaysAgo;
      }
      if (activeFilters.has('domain') && filter.includes('@')) {
        const domain = filter.split('@')[1];
        return domain ? contact.email.endsWith(`@${domain}`) : true;
      }
      return true;
    });
  }, [contacts, filter, activeFilters]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filteredContacts.length === 0) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => {
          const nextIndex = prev < filteredContacts.length - 1 ? prev + 1 : prev;
          scrollIntoViewIfNeeded(nextIndex);
          return nextIndex;
        });
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => {
          const nextIndex = prev > 0 ? prev - 1 : 0;
          scrollIntoViewIfNeeded(nextIndex);
          return nextIndex;
        });
        break;
        
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < filteredContacts.length) {
          const contact = filteredContacts[focusedIndex];
          toggleContactSelection(contact.email);
        }
        break;

      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        scrollIntoViewIfNeeded(0);
        break;
        
      case 'End':
        e.preventDefault();
        setFocusedIndex(filteredContacts.length - 1);
        scrollIntoViewIfNeeded(filteredContacts.length - 1);
        break;
    }
  };
  
  // Helper to scroll focused item into view
  const scrollIntoViewIfNeeded = (index: number) => {
    if (!contactListRef.current) return;
    
    const container = contactListRef.current;
    const items = container.querySelectorAll('[data-contact-item]');
    if (items.length <= index) return;
    
    const item = items[index] as HTMLElement;
    const containerRect = container.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    
    if (itemRect.top < containerRect.top) {
      item.scrollIntoView({ block: 'start', behavior: 'smooth' });
    } else if (itemRect.bottom > containerRect.bottom) {
      item.scrollIntoView({ block: 'end', behavior: 'smooth' });
    }
  };
  
  // Toggle contact selection
  const toggleContactSelection = (email: string) => {
    const newSelected = new Set(selected);
    if (selected.has(email)) {
      newSelected.delete(email);
    } else {
      newSelected.add(email);
    }
    setSelected(newSelected);
  };

  // Handle filter toggle
  const toggleFilter = (filterName: string) => {
    setActiveFilters(prev => {
      const newFilters = new Set(prev);
      if (newFilters.has(filterName)) {
        newFilters.delete(filterName);
        
        // Clear domain filter if needed
        if (filterName === 'domain') {
          setFilter(filter.replace(/@.*$/, ''));
        }
      } else {
        newFilters.add(filterName);
        
        // Handle domain filter
        if (filterName === 'domain' && !filter.includes('@')) {
          setFilter(filter ? `${filter} @` : '@');
        }
      }
      return newFilters;
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Select Contacts</h2>
          <p className="text-sm text-gray-500 mt-1">Add contacts to "{groupName}"</p>
        </div>
        <div className="text-sm text-gray-500">
          {selected.size > 0 && (
            <span>{selected.size} contact{selected.size !== 1 ? 's' : ''} selected</span>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-3 flex-1 overflow-y-auto">
        {/* Search and Filter Section */}
        <div className="flex flex-col w-full">
          {/* Search input - Enhanced design */}
          <div className="relative w-full">
            <div className="flex items-center">
              <div className="absolute left-4 text-gray-400 pointer-events-none">
                <Icon name="Search" size={18} />
              </div>
              <input
                type="text"
                placeholder="Search contacts..."
                className="w-full h-11 px-4 py-2 pl-11 bg-white border border-gray-200 shadow-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E1E3F] focus:border-[#1E1E3F] transition-all duration-200 ease-in-out"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
              {filter && (
                <button 
                  onClick={() => setFilter('')}
                  className="absolute right-4 text-gray-400 hover:text-gray-600 transition-colors duration-150"
                >
                  <Icon name="X" size={16} />
                </button>
              )}
            </div>
          </div>
          
          {/* Action buttons row */}
          <div className="flex justify-between items-center mt-3">
            {/* Filter count */}
            {activeFilters.size > 0 && (
              <div className="text-xs text-[#1E1E3F] font-medium">
                <span className="bg-[#F4F4FF] px-2 py-1 rounded-full">
                  {activeFilters.size} filter{activeFilters.size !== 1 ? 's' : ''} active
                </span>
              </div>
            )}
            
            {/* Clear All button - Moved to right side */}
            <div className="ml-auto">
              <Button 
                variant="tertiary"
                size="sm"
                onClick={() => {
                  setFilter('');
                  setSelected(new Set());
                  setActiveFilters(new Set());
                }}
                icon="RotateCcw"
                iconPosition="left"
                className="whitespace-nowrap text-sm font-medium"
              >
                Reset All
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Filters Section */}
        <div className="mt-2">
          <div className="text-xs font-medium text-gray-700 mb-2">Quick Filters</div>
          <div className="flex gap-2 overflow-x-auto pb-2 filter-chips-container">
            <FilterChip
              label="Same Domain"
              icon="Globe"
              selected={activeFilters.has('domain')}
              onClick={() => toggleFilter('domain')}
              tooltipContent="Filter contacts from the same domain"
              badge={activeFilters.has('domain') && filter.includes('@') ? 
                filteredContacts.length : undefined}
            />
            
            <FilterChip
              label="Recent Contacts"
              icon="Clock"
              selected={activeFilters.has('recent')}
              onClick={() => toggleFilter('recent')}
              tooltipContent="Show contacts from the last 30 days"
              badge={activeFilters.has('recent') ? filteredContacts.length : undefined}
            />
            
            {activeFilters.size > 0 && (
              <Button
                variant="tertiary"
                size="sm"
                onClick={() => setActiveFilters(new Set())}
                className="ml-2 self-center"
                icon="X"
                iconPosition="left"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Keyboard Tip - Updated to be more compact and badge-like */}
        {showKeyboardTip && (
          <div className="relative mt-3 inline-flex items-center px-3 py-1.5 bg-[#F4F4FF] rounded-full text-xs text-gray-700 animated fadeIn">
            <div className="flex-shrink-0 text-[#1E1E3F] mr-2">
              <Icon name="KeySquare" size={16} />
            </div>
            <span className="font-medium mr-1">✨ Pro Tip:</span>
            <span>Use Tab and arrow keys to navigate, Enter to select</span>
            <button 
              onClick={dismissTip}
              className="ml-2 text-gray-400 hover:text-gray-600 flex-shrink-0"
              aria-label="Dismiss tip"
            >
              <Icon name="X" size={12} />
            </button>
          </div>
        )}

        {/* Contact List Header with Select All button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-5 px-4 py-3 bg-white border border-gray-200 rounded-t-lg border-b shadow-sm gap-2">
          <div className="text-sm font-medium text-gray-700 flex items-center">
            <span className="bg-[#F4F4FF] text-[#1E1E3F] px-2 py-0.5 rounded-full text-xs font-semibold mr-2">
              {filteredContacts.length}
            </span>
            <span>
              contact{filteredContacts.length !== 1 ? 's' : ''} available
            </span>
          </div>
          {filteredContacts.length > 0 && (
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
              className="whitespace-nowrap px-4 min-w-[120px] flex-shrink-0 w-full sm:w-auto transition-all duration-200"
            >
              {selected.size === filteredContacts.length && filteredContacts.length > 0 
                ? `Deselect All (${filteredContacts.length})` 
                : 'Select All'}
            </Button>
          )}
        </div>

        {/* Contact List (updated to remove top rounded corners, since header has them now) */}
        <div 
          ref={contactListRef}
          className="overflow-y-auto border border-gray-200 border-t-0 rounded-b-lg shadow-sm" 
          style={{ maxHeight: 'calc(70vh - 280px)' }}
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          {filteredContacts.length > 0 ? (
            filteredContacts.map((contact, index) => (
              <div 
                key={contact.email}
                data-contact-item
                onClick={() => toggleContactSelection(contact.email)}
                onFocus={() => setFocusedIndex(index)}
                className={`flex items-center justify-between px-4 py-3 hover:bg-[#F9F9FF] border-b border-gray-100 last:border-b-0 group cursor-pointer transition-colors duration-150 ease-in-out
                  ${focusedIndex === index ? 'bg-[#F4F4FF]/50 shadow-sm' : ''}
                `}
                tabIndex={0}
              >
                <div className="flex items-center">
                  <div className="flex items-center justify-center mr-3">
                    <input
                      type="checkbox"
                      checked={selected.has(contact.email)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleContactSelection(contact.email);
                      }}
                      className="h-5 w-5 rounded-md border-gray-300 text-[#1E1E3F] focus:ring-[#1E1E3F] transition-opacity duration-150 ease-in-out"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{contact.name}</h4>
                    <p className="text-sm text-gray-500 mt-0.5">{contact.email}</p>
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
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white/80"
                  icon="Users"
                  iconPosition="left"
                >
                  Select Similar
                </Button>
              </div>
            ))
          ) : (
            <div className="py-10 px-4 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
                <Icon name="Search" size={32} className="text-gray-300" />
              </div>
              <p className="text-gray-600 font-medium">No contacts match your filters</p>
              <button
                onClick={() => {
                  setFilter('');
                  setActiveFilters(new Set());
                }}
                className="mt-3 text-[#1E1E3F] font-medium text-sm hover:underline focus:outline-none focus:ring-2 focus:ring-[#1E1E3F] focus:ring-offset-2 rounded-md px-2 py-1 transition-all duration-150"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-gray-100">
        <Button
          variant="secondary"
          onClick={onBack}
          icon="ArrowLeft"
          iconPosition="left"
          className="whitespace-nowrap px-3 flex-shrink-0"
        >
          Back
        </Button>
        <Button
          variant="primary"
          onClick={() => onComplete(selected)}
          disabled={selected.size === 0}
          icon={editingGroup ? 'Save' : 'Plus'}
          iconPosition="right"
          className="whitespace-nowrap px-3 min-w-[120px] flex-shrink-0"
        >
          {editingGroup ? 'Save Changes' : 'Create Group'} 
          {selected.size > 0 && ` (${selected.size})`}
        </Button>
      </div>
      
      {/* Add styles for horizontal scrolling on mobile and transitions */}
      <style jsx>{`
        @media (max-width: 640px) {
          .filter-chips-container {
            display: flex;
            overflow-x: auto;
            padding-bottom: 0.5rem;
            scrollbar-width: none;  /* Firefox */
            -ms-overflow-style: none;  /* IE and Edge */
          }
          
          .filter-chips-container::-webkit-scrollbar {
            display: none;  /* Chrome, Safari and Opera */
          }
        }

        input[type="checkbox"] {
          transition: all 0.15s ease-in-out;
        }
        
        input[type="checkbox"]:checked {
          animation: pulse 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        @keyframes pulse {
          0% { transform: scale(0.95); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }

        .animated {
          animation-duration: 0.5s;
          animation-fill-mode: both;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .fadeIn {
          animation-name: fadeIn;
        }
        
        /* Add animations for improved UI experience */
        input[type="text"]:focus {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(30, 30, 63, 0.08);
        }
        
        button:active {
          transform: scale(0.97);
        }
      `}</style>
    </div>
  );
}


