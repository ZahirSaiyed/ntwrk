import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Contact } from '@/types';
import { Button, FilterChip, Icon } from '@/components/ui';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
// Optional: For the confetti effect when creating groups
import confetti from 'canvas-confetti';
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
    const wasSelected = selected.has(email);
    
    if (wasSelected) {
      newSelected.delete(email);
    } else {
      newSelected.add(email);
      
      // Find the checkbox element for this contact and animate it
      const contactRow = document.querySelector(`[data-contact-item][data-email="${email}"]`);
      if (contactRow) {
        const checkbox = contactRow.querySelector('input[type="checkbox"]') as HTMLInputElement;
        if (checkbox) {
          // Add subtle pulse animation
          checkbox.classList.add('animate-select');
          setTimeout(() => checkbox.classList.remove('animate-select'), 300);
        }
      }
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
      {/* Compressed Header Section */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            Select Contacts
            {selected.size > 0 && (
              <span className="text-sm font-medium text-[#1E1E3F] bg-[#F4F4FF] px-2 py-0.5 rounded-full">
                {selected.size} selected
              </span>
            )}
          </h2>
          <p className="text-xs text-gray-500">Add contacts to "{groupName}"</p>
        </div>
      </div>

      {/* Main Content + Footer Layout Container */}
      <div className="flex flex-col flex-1 min-h-0">
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Combined Search and Filters Row */}
          <div className="flex flex-wrap items-center gap-2 py-2">
            {/* Search input - Streamlined */}
            <div className="relative flex-1 min-w-[200px]">
              <div className="flex items-center">
                <div className="absolute left-2 text-gray-400 pointer-events-none">
                  <Icon name="Search" size={16} />
                </div>
                <input
                  type="text"
                  placeholder="Search contacts..."
                  className="w-full h-9 px-3 pl-8 bg-white border border-gray-200 shadow-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1E1E3F] focus:border-[#1E1E3F] transition-all duration-200 ease-in-out"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
                {filter && (
                  <button 
                    onClick={() => setFilter('')}
                    className="absolute right-2 text-gray-400 hover:text-gray-600 transition-colors duration-150"
                  >
                    <Icon name="X" size={12} />
                  </button>
                )}
              </div>
            </div>
            
            {/* Quick Filters - Inline */}
            <div className="flex flex-wrap items-center gap-1">
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
                label="Recent"
                icon="Clock"
                selected={activeFilters.has('recent')}
                onClick={() => toggleFilter('recent')}
                tooltipContent="Show contacts from the last 30 days"
                badge={activeFilters.has('recent') ? filteredContacts.length : undefined}
              />
              
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
                className="text-xs whitespace-nowrap"
              >
                Reset
              </Button>
            </div>
          </div>

          {/* Keyboard Tip - Only if needed */}
          {showKeyboardTip && (
            <div className="relative mb-1 inline-flex items-center px-2 py-1 bg-[#F4F4FF] rounded-full text-xs text-gray-700 animated fadeIn">
              <div className="flex-shrink-0 text-[#1E1E3F] mr-1">
                <Icon name="KeySquare" size={12} />
              </div>
              <span className="font-medium mr-1">Pro Tip:</span>
              <span>Use arrow keys to navigate, Enter to select</span>
              <button 
                onClick={dismissTip}
                className="ml-1 text-gray-400 hover:text-gray-600 flex-shrink-0"
                aria-label="Dismiss tip"
              >
                <Icon name="X" size={10} />
              </button>
            </div>
          )}

          {/* Contact List Header - Streamlined */}
          <div className="flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-t-lg shadow-sm gap-2">
            <div className="text-xs font-medium text-gray-700 flex items-center">
              <span className="bg-[#F4F4FF] text-[#1E1E3F] px-1.5 py-0.5 rounded-full text-xs font-semibold mr-1">
                {filteredContacts.length}
              </span>
              contacts
            </div>
            {filteredContacts.length > 0 && (
              <Button 
                variant={selected.size === filteredContacts.length ? 'tertiary' : 'primary'}
                onClick={() => {
                  const isSelectingAll = selected.size !== filteredContacts.length;
                  const newSelected = new Set([
                    ...Array.from(selected),
                    ...filteredContacts.map(contact => contact.email)
                  ]);
                  
                  if (!isSelectingAll) {
                    setSelected(new Set());
                    toast.success(`✓ All contacts deselected`, {
                      duration: 2000,
                      style: { 
                        background: '#F4F4FF', 
                        color: '#1E1E3F',
                        fontWeight: 500
                      },
                      icon: '🔄'
                    });
                  } else {
                    setSelected(newSelected);
                    toast.success(`✓ ${filteredContacts.length} contact${filteredContacts.length !== 1 ? 's' : ''} selected`, {
                      duration: 2000,
                      style: { 
                        background: '#F4F4FF', 
                        color: '#1E1E3F',
                        fontWeight: 500
                      },
                      icon: '✨'
                    });
                    
                    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
                    checkboxes.forEach((checkbox, index) => {
                      const inputElement = checkbox as HTMLInputElement;
                      if (!inputElement.checked) {
                        setTimeout(() => {
                          inputElement.classList.add('animate-select');
                          setTimeout(() => inputElement.classList.remove('animate-select'), 300);
                        }, index * 15); 
                      }
                    });
                  }
                }}
                icon={selected.size === filteredContacts.length ? 'RotateCcw' : 'CheckSquare'}
                iconPosition="right"
                size="sm"
                className="whitespace-nowrap text-xs min-w-[95px]"
              >
                {selected.size === filteredContacts.length && filteredContacts.length > 0 
                  ? 'Deselect All' 
                  : 'Select All'}
              </Button>
            )}
          </div>

          {/* Contact List - Maximum Height for Visibility */}
          <div 
            ref={contactListRef}
            className="overflow-y-auto border border-gray-200 border-t-0 rounded-b-lg shadow-sm" 
            style={{ height: 'calc(70vh - 220px)' }}
            tabIndex={0}
            onKeyDown={handleKeyDown}
          >
            {filteredContacts.length > 0 ? (
              filteredContacts.map((contact, index) => (
                <div 
                  key={contact.email}
                  data-contact-item
                  data-email={contact.email}
                  onClick={() => toggleContactSelection(contact.email)}
                  onFocus={() => setFocusedIndex(index)}
                  className={`flex items-center justify-between px-3 py-2 hover:bg-[#F9F9FF] border-b border-gray-100 last:border-b-0 group cursor-pointer transition-colors duration-150 ease-in-out
                    ${focusedIndex === index ? 'bg-[#F4F4FF]/50 shadow-sm' : ''}
                  `}
                  tabIndex={0}
                >
                  <div className="flex items-center">
                    <div className="flex items-center justify-center mr-2">
                      <input
                        type="checkbox"
                        checked={selected.has(contact.email)}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleContactSelection(contact.email);
                        }}
                        className="h-4 w-4 rounded-md border-gray-300 text-[#1E1E3F] focus:ring-[#1E1E3F] transition-opacity duration-150 ease-in-out"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">{contact.name}</h4>
                      <p className="text-xs text-gray-500">{contact.email}</p>
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
                      const previousCount = newSelected.size;
                      
                      similarContacts.forEach(c => newSelected.add(c.email));
                      setSelected(newSelected);
                      
                      const newlyAdded = newSelected.size - previousCount;
                      
                      if (newlyAdded > 0) {
                        similarContacts.forEach(c => {
                          const contactRow = document.querySelector(`[data-contact-item][data-email="${c.email}"]`);
                          if (contactRow) {
                            contactRow.classList.add('highlight-similar');
                            setTimeout(() => contactRow.classList.remove('highlight-similar'), 800);
                          }
                        });
                        
                        toast.success(`✨ ${newlyAdded} similar contact${newlyAdded !== 1 ? 's' : ''} selected`, {
                          duration: 2000,
                          style: { 
                            background: '#F4F4FF', 
                            color: '#1E1E3F',
                            fontWeight: 500
                          }
                        });
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white/80 text-xs"
                    icon="Users"
                    iconPosition="left"
                  >
                    Similar
                  </Button>
                </div>
              ))
            ) : (
              <div className="py-8 px-4 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 mb-3">
                  <Icon name="Search" size={24} className="text-gray-300" />
                </div>
                <p className="text-gray-600 font-medium text-sm">No contacts match your filters</p>
                <button
                  onClick={() => {
                    setFilter('');
                    setActiveFilters(new Set());
                  }}
                  className="mt-2 text-[#1E1E3F] font-medium text-xs hover:underline focus:outline-none focus:ring-2 focus:ring-[#1E1E3F] focus:ring-offset-2 rounded-md px-2 py-1 transition-all duration-150"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Non-Overlapping Footer - Part of the layout flow */}
        <div className="flex justify-end gap-3 bg-white border-t border-gray-200 px-6 py-4 mt-6">
          <Button
            variant="secondary"
            onClick={onBack}
            icon="ArrowLeft"
            iconPosition="left"
            size="sm"
            className="whitespace-nowrap px-4 py-2 flex-shrink-0"
          >
            Back
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              onComplete(selected);
              
              if (selected.size > 0) {
                const actionText = editingGroup ? 'updated' : 'created';
                
                toast.success(
                  `🎉 Group "${groupName}" ${actionText} with ${selected.size} contact${selected.size !== 1 ? 's' : ''}!`, 
                  {
                    duration: 3000,
                    style: { 
                      background: '#F4F4FF', 
                      color: '#1E1E3F',
                      fontWeight: 500
                    },
                  }
                );
                
                if (!editingGroup) {
                  const canvasOptions = {
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                  };
                  
                  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                  
                  if (!prefersReducedMotion) {
                    confetti({
                      ...canvasOptions,
                      colors: ['#1E1E3F', '#8F8FBF', '#E4E4FF']
                    });
                  }
                }
              }
            }}
            disabled={selected.size === 0}
            icon={editingGroup ? 'Save' : 'Plus'}
            iconPosition="right"
            size="sm"
            className="whitespace-nowrap px-4 py-2 min-w-[140px] flex-shrink-0"
          >
            {editingGroup ? 'Save Changes' : 'Create Group'} 
            {selected.size > 0 && ` (${selected.size})`}
          </Button>
        </div>
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
        
        /* New animation for Select All action */
        .animate-select {
          animation: selectPulse 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        @keyframes selectPulse {
          0% { transform: scale(0.9); opacity: 0.5; }
          70% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        /* Highlight animation for similar contacts */
        .highlight-similar {
          animation: highlightSimilar 0.8s ease-in-out;
        }
        
        @keyframes highlightSimilar {
          0% { background-color: rgba(30, 30, 63, 0); }
          30% { background-color: rgba(30, 30, 63, 0.1); }
          100% { background-color: rgba(30, 30, 63, 0); }
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
        
        /* Add support for prefers-reduced-motion */
        @media (prefers-reduced-motion: reduce) {
          .animate-select,
          .highlight-similar,
          input[type="checkbox"]:checked,
          .animated,
          .fadeIn,
          input[type="text"]:focus,
          button:active {
            animation: none !important;
            transition: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
}


