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
  
  // Extract domains from contacts for smarter filtering
  const contactDomains = useMemo(() => {
    // Get all domains from contacts
    const domains = contacts.map(contact => {
      const emailParts = contact.email.split('@');
      return emailParts.length > 1 ? emailParts[1] : null;
    }).filter(Boolean);
    
    // Count frequency of each domain
    const domainCounts = domains.reduce((acc, domain) => {
      acc[domain as string] = (acc[domain as string] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Sort domains by frequency
    return Object.entries(domainCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([domain]) => domain);
  }, [contacts]);

  // Get active domain from filter input
  const activeDomain = useMemo(() => {
    if (activeFilters.has('domain')) {
      // Check if domain is explicitly in search field
      if (filter.includes('@')) {
        const domain = filter.split('@')[1].trim();
        return domain || '';
      } 
      // Fallback to most common domain if available
      else if (contactDomains.length > 0) {
        return contactDomains[0];
      }
    }
    return '';
  }, [activeFilters, filter, contactDomains]);

  // Utility functions for smart domain search
  const extractDomain = (email: string): string => {
    const parts = email.split('@');
    return parts.length > 1 ? parts[1].toLowerCase() : '';
  };

  const isDomainSearch = (term: string): boolean => {
    // Check if explicitly using @ symbol for domain search
    if (term.startsWith('@') && !term.includes(' ')) return true;
    
    // Check for common domain names without @ symbol
    const commonDomains = ['gmail', 'yahoo', 'hotmail', 'outlook', 'amazon', 'apple', 
      'google', 'microsoft', 'facebook', 'aol', 'proton', 'icloud', 'me', 'live', 'msn'];
    
    // Check if term looks like a domain (has no spaces and either contains a dot or is a common domain)
    if (!term.includes(' ') && (term.includes('.') || commonDomains.includes(term.toLowerCase()))) {
      return true;
    }
    
    return false;
  };

  const domainMatches = (email: string, searchTerm: string): boolean => {
    const domain = extractDomain(email);
    let queryDomain;
    
    // Handle terms that start with @ 
    if (searchTerm.startsWith('@')) {
      queryDomain = searchTerm.substring(1).toLowerCase(); // Remove @ symbol
    } else {
      // For terms without @, use as is
      queryDomain = searchTerm.toLowerCase();
    }
    
    if (!queryDomain) return true; // Empty domain matches all
    
    // Exact match
    if (domain === queryDomain) return true;
    
    // Handle common variations
    if (queryDomain === 'gmail' && domain === 'gmail.com') return true;
    if (queryDomain === 'yahoo' && (domain === 'yahoo.com' || domain === 'yahoo.co.uk')) return true;
    if (queryDomain === 'hotmail' && (domain === 'hotmail.com' || domain === 'hotmail.co.uk')) return true;
    if (queryDomain === 'outlook' && domain === 'outlook.com') return true;
    if (queryDomain === 'icloud' && domain === 'icloud.com') return true;
    if (queryDomain === 'me' && domain === 'me.com') return true;
    if (queryDomain === 'live' && domain === 'live.com') return true;
    if (queryDomain === 'msn' && domain === 'msn.com') return true;
    
    // Handle partial domain matches (e.g., "amazon" matches "amazon.com", "amazon.co.uk", etc.)
    if (domain.startsWith(queryDomain + '.')) return true;
    
    // Check if domain contains the query (for partial matches like "@amaz" matching "amazon.com")
    const domainParts = domain.split('.');
    if (domainParts[0].startsWith(queryDomain)) return true;

    // Handle subdomain matches
    return domain.includes(queryDomain);
  };

  // Smart filtering system
  const filteredContacts = useMemo(() => {
    // First filter out spam contacts
    const nonSpamContacts = contacts.filter(contact => !(contact as any).isSpam);
    
    // Apply text/domain search filter
    let searchFiltered = nonSpamContacts;
    
    if (filter) {
      // Check if this is a domain search (either with @ or common domain names)
      const isDomainSearchActive = isDomainSearch(filter);
      
      searchFiltered = nonSpamContacts.filter(contact => {
        // If domain search is active, check domain matches
        if (isDomainSearchActive) {
          return domainMatches(contact.email, filter);
        }
        
        // Otherwise perform regular text search
        const searchTerms = filter
          .toLowerCase()
          .split(' ')
          .filter(Boolean);
          
        if (searchTerms.length === 0) return true;
        
        return searchTerms.every(term =>
          contact.name.toLowerCase().includes(term) ||
          contact.email.toLowerCase().includes(term) ||
          (contact.company && contact.company.toLowerCase().includes(term)) ||
          contact.lastContacted.toLowerCase().includes(term)
        );
      });
    }
    
    // Apply active filters
    if (activeFilters.size === 0) return searchFiltered;
    
    return searchFiltered.filter(contact => {
      // Apply recent filter
      if (activeFilters.has('recent')) {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        if (new Date(contact.lastContacted) <= thirtyDaysAgo) {
          return false;
        }
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
      
      // Handle turning filter off
      if (newFilters.has(filterName)) {
        newFilters.delete(filterName);
        
        // When turning off domain filter, clean up the search
        if (filterName === 'domain') {
          if (filter === '@') {
            // If it's just @ with nothing after it, clear it completely
            setFilter('');
          } else if (filter.trim().startsWith('@') && !filter.includes(' ')) {
            // If search is only a domain filter (e.g., "@gmail"), clear it
            setFilter('');
          } else if (filter.includes(' @')) {
            // If domain filter was added to the end of a regular search,
            // remove the @ portion and any text after it
            setFilter(filter.replace(/\s+@\S*$/g, '').trim());
          }
        }
      } 
      // Handle turning filter on
      else {
        newFilters.add(filterName);
        
        // Domain filter special handling
        if (filterName === 'domain') {
          // Check if current search is already a domain search without @
          if (isDomainSearch(filter) && !filter.includes('@')) {
            // Convert "gmail" to "@gmail" to make it explicit
            setFilter(`@${filter.trim()}`);
          }
          // If search doesn't include @, add it to prompt for domain input
          else if (!filter.includes('@')) {
            setFilter(filter ? `${filter.trim()} @` : '@');
          }
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
                  placeholder={isDomainSearch(filter) || activeFilters.has('domain') 
                    ? "Type domain (e.g. amazon, @gmail)..." 
                    : "Search by name or email"}
                  className={`w-full h-9 px-3 pl-8 bg-white border border-gray-200 shadow-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1E1E3F] focus:border-[#1E1E3F] transition-all duration-200 ease-in-out ${isDomainSearch(filter) ? 'border-[#4B4BA6] bg-[#F9F9FF]' : ''}`}
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
                {isDomainSearch(filter) && (
                  <div className="absolute right-8 top-1/2 transform -translate-y-1/2 flex items-center">
                    <span className="text-xs text-[#4B4BA6] bg-[#F4F4FF] px-1.5 py-0.5 rounded-full flex items-center">
                      <Icon name="Globe" size={10} className="mr-1" />
                      Domain Search
                    </span>
                  </div>
                )}
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
                label={activeFilters.has('domain') && activeDomain ? 
                  `Domain: ${activeDomain}` : "Same Domain"}
                icon="Globe"
                selected={activeFilters.has('domain')}
                onClick={() => toggleFilter('domain')}
                tooltipContent={
                  activeFilters.has('domain') ? 
                  `Filtering contacts from ${activeDomain}` : 
                  "Smart domain search: Type @amazon to find amazon.com, etc."
                }
                badge={activeFilters.has('domain') ? 
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

          {/* Domain Quick Chips - Only show when domain search is active */}
          {isDomainSearch(filter) && contactDomains.length > 0 && (
            <div className="px-1 py-1 mb-2 overflow-x-auto hide-scrollbar">
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500 shrink-0">Popular domains:</span>
                {contactDomains.slice(0, 5).map(domain => {
                  const domainSuffix = domain.split('.')[0]; // Get just 'gmail' from 'gmail.com'
                  const count = contacts.filter(c => extractDomain(c.email) === domain).length;
                  return (
                    <button
                      key={domain}
                      onClick={() => setFilter(`@${domainSuffix}`)}
                      className={`text-xs px-1.5 py-0.5 rounded-full transition-colors flex items-center
                        ${filter.includes(domainSuffix) ? 'bg-[#1E1E3F] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {domainSuffix}
                      <span className="ml-1 font-medium">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

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
          <div className="flex flex-col px-3 py-2 bg-white border border-gray-200 rounded-t-lg shadow-sm gap-2">
            <div className="flex items-center justify-between">
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
          </div>

          {/* Contact List - Maximum Height for Visibility */}
          <div 
            ref={contactListRef}
            className="overflow-y-auto border border-gray-200 border-t-0 rounded-b-lg shadow-sm" 
            style={{ height: 'calc(60vh - 220px)' }}
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
                {isDomainSearch(filter) && (
                  <div className="mt-2 text-gray-500 text-xs max-w-md mx-auto">
                    <p className="mb-1">Domain search tips:</p>
                    <ul className="text-left ml-4 list-disc">
                      <li>Try a shorter domain (e.g. <b>@amazon</b> instead of <b>@amazon.com</b>)</li>
                      <li>Check for typos in your domain name</li>
                      <li>Try searching by company name instead of domain</li>
                    </ul>
                  </div>
                )}
                <button
                  onClick={() => {
                    setFilter('');
                    setActiveFilters(new Set());
                  }}
                  className="mt-3 text-[#1E1E3F] font-medium text-xs hover:underline focus:outline-none focus:ring-2 focus:ring-[#1E1E3F] focus:ring-offset-2 rounded-md px-2 py-1 transition-all duration-150"
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


