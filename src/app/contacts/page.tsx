'use client';

import AppLayout from '@/components/Layout/AppLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from "next-auth/react";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { format } from "date-fns";
import GroupModal from "@/components/GroupModal";
import { Contact } from '@/types';
import ContactTable from "@/components/ContactTable";
import ContactDetail from "@/components/ContactDetail";
import ColumnCustomizer from "@/components/ColumnCustomizer";
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import OnboardingPrompt from '@/components/OnboardingPrompt';
import InboxCleanupAssistant from '@/components/insights/InboxCleanupAssistant';
import GroupExportModal from '@/components/GroupExportModal';
import ImportModal from '@/components/ImportModal';
import { toast } from 'react-hot-toast';
import FilterChip from '@/components/ui/filters/FilterChip';
import { IconName } from '@/components/ui/icons/Icon';
import { Icon } from '@/components/ui';
import React from 'react';
import DomainStats from '@/components/DomainStats';
import { adaptContacts } from '@/utils/contactAdapter';

// Add a custom useDebounce hook after the imports and before the component code
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Helper function to get the consistent session storage key
const getContactsSessionKey = (userEmail: string | null | undefined) => {
  return `sentRecipients_${userEmail || 'unknown'}`;
};

// Helper function to get user-specific group storage key
const getGroupsStorageKey = (userEmail: string | null | undefined) => {
  return `contact-groups_${userEmail || 'unknown'}`;
};

type FilterType = 'all' | `group-${string}`;

type SortConfig = {
  key: keyof Contact | CustomColumnKey | null;
  direction: 'asc' | 'desc';
};

type CustomColumnKey = `custom_${string}`;
type ColumnKey = keyof Contact | 'relationshipStrength' | CustomColumnKey;

type Column = {
  key: ColumnKey;
  label: string;
  description: string;
  render: (contact: Contact) => React.ReactNode;
};

interface CustomField {
  id: string;
  label: string;
  value: string;
}

// Add this interface before using Contact
interface ContactWithSpam extends Contact {
  isSpam?: boolean;
}



// Define types for filter items
type BaseFilterItem = {
  id: string;
  label: string;
  isGroup: boolean;
}

type QuickFilterItem = BaseFilterItem & {
  icon: IconName;
  isGroup: false;
}

type GroupFilterItem = BaseFilterItem & {
  isGroup: true;
  groupData: {id: string, name: string, members: string[]};
}

type FilterItem = QuickFilterItem | GroupFilterItem;

/**
 * Custom hook to handle groups persistence and filter state
 */
function useGroupsPersistence(userEmail: string | null | undefined) {
  const [groups, setGroupsState] = useState<Array<{id: string, name: string, members: string[]}>>([]);
  const [activeFilter, setActiveFilterState] = useState<FilterType>('all');
  const [loadedGroups, setLoadedGroups] = useState(false);
  
  // Load groups and filter state from localStorage
  const loadData = useCallback(() => {
    if (!userEmail) return;
    
    try {
      // Load groups first
      const groupsKey = getGroupsStorageKey(userEmail);
      const savedGroups = localStorage.getItem(groupsKey);
      
      let loadedGroupsData: Array<{id: string, name: string, members: string[]}> = [];
      
      if (savedGroups) {
        console.log('Loading groups from localStorage:', groupsKey);
        loadedGroupsData = JSON.parse(savedGroups);
        setGroupsState(loadedGroupsData);
      } else {
        // Migration from older format
        const oldGroups = localStorage.getItem('contact-groups');
        if (oldGroups) {
          const parsedOldGroups = JSON.parse(oldGroups);
          if (Array.isArray(parsedOldGroups) && parsedOldGroups.length > 0) {
            console.log('Migrating groups to user-specific storage format');
            localStorage.setItem(groupsKey, oldGroups);
            loadedGroupsData = parsedOldGroups;
            setGroupsState(parsedOldGroups);
          }
        }
      }
      
      setLoadedGroups(true);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, [userEmail]);
  
  // Save groups to localStorage
  const saveGroups = useCallback((updatedGroups: Array<{id: string, name: string, members: string[]}>) => {
    if (!userEmail) return;
    
    try {
      const groupsKey = getGroupsStorageKey(userEmail);
      localStorage.setItem(groupsKey, JSON.stringify(updatedGroups));
      setGroupsState(updatedGroups);
      setLoadedGroups(true);
    } catch (error) {
      console.error('Error saving groups:', error);
    }
  }, [userEmail]);
  
  // Save filter state to localStorage
  const saveFilter = useCallback((filter: FilterType) => {
    if (!userEmail) return;
    
    try {
      console.log('Saving filter state:', filter);
      const filterKey = `contact-filter_${userEmail}`;
      localStorage.setItem(filterKey, filter);
      setActiveFilterState(filter);
    } catch (error) {
      console.error('Error saving filter state:', error);
    }
  }, [userEmail]);
  
  // Initial load on mount or when user email changes
  useEffect(() => {
    loadData();
  }, [loadData, userEmail]);
  
  return { 
    groups, 
    setGroups: saveGroups, 
    filter: activeFilter,
    setFilter: saveFilter,
    reloadData: loadData,
    loadedGroups
  };
}

export default function ContactsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const userEmail = session?.user?.email;
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Get group ID from URL if present
  const groupIdFromUrl = searchParams.get('group');
  
  const [search, setSearch] = useState('');
  const [inputSearch, setInputSearch] = useState('');
  const debouncedSearch = useDebounce(inputSearch, 200);
  
  const [showGroupModal, setShowGroupModal] = useState(false);
  
  // Use the custom hook for groups and filter persistence
  const { groups, setGroups, filter, setFilter, reloadData, loadedGroups } = useGroupsPersistence(userEmail);
  
  // Update filter when URL changes (separate from the next useEffect to avoid race conditions)
  useEffect(() => {
    if (groupIdFromUrl && loadedGroups) {
      // Check if the group exists in the loaded groups
      const groupExists = groups.some(g => g.id === groupIdFromUrl);
      if (groupExists) {
        console.log('Setting filter from URL param:', `group-${groupIdFromUrl}`);
        setFilter(`group-${groupIdFromUrl}` as FilterType);
      }
    }
  }, [groupIdFromUrl, groups, loadedGroups, setFilter]);
  
  // Sync filter state to URL when filter changes (keep this separate)
  useEffect(() => {
    if (filter && filter !== 'all' && filter.startsWith('group-')) {
      const groupId = filter.replace('group-', '');
      // Only update URL if it's different to avoid unnecessary history entries
      if (groupIdFromUrl !== groupId) {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('group', groupId);
        console.log('Updating URL with group param:', groupId);
        router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
      }
    } else if (groupIdFromUrl) {
      // Remove group param if filter is not a group
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('group');
      console.log('Removing group param from URL');
      router.replace(pathname, { scroll: false });
    }
  }, [filter, pathname, router, searchParams, groupIdFromUrl]);
  
  // Add a separate effect to ensure groups persist across page loads
  useEffect(() => {
    // This will run on every render to ensure we always have the most up-to-date groups
    if (userEmail && groups.length > 0) {
      const groupsKey = getGroupsStorageKey(userEmail);
      localStorage.setItem(groupsKey, JSON.stringify(groups));
      console.log('Persisting groups to localStorage:', groups.length, 'groups');
    }
  }, [groups, userEmail]);
  
  // Force reload data when the component becomes visible
  useEffect(() => {
    // This will run when the component mounts or becomes visible
    reloadData();
    
    // Set up visibility change event listener
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Page became visible, reloading data');
        reloadData();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [reloadData]);
  
  // Current group based on filter (keep this separate from storage logic)
  const currentGroup = useMemo(() => {
    if (filter.startsWith('group-')) {
      const groupId = filter.replace('group-', '');
      return groups.find(g => g.id === groupId);
    }
    return null;
  }, [filter, groups]);

  const [showGroupExportModal, setShowGroupExportModal] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ 
    key: 'lastContacted', 
    direction: 'desc' 
  });
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [editingGroup, setEditingGroup] = useState<{id: string, name: string, members: string[]} | null>(null);
  const [activeColumns, setActiveColumns] = useState<ColumnKey[]>([
    'name',
    'email',
    'company',
    'lastContacted'
  ]);
  const [availableColumnsList, setAvailableColumnsList] = useState<Column[]>([]);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showCleanupAssistant, setShowCleanupAssistant] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Add state to track if domain filter mode is active
  const [isDomainFilterMode, setIsDomainFilterMode] = useState(false);

  // Add state for selected domain in domain stats
  const [selectedDomain, setSelectedDomain] = useState<string | undefined>(undefined);

  // Clear session cache if the user changes
  useEffect(() => {
    if (!session?.user?.email) {
      // User logged out or session expired
      // Clear session cache
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('sentRecipients_')) {
          sessionStorage.removeItem(key);
        }
      });
      
      // Reset the groups state to empty since there's no logged-in user
      setGroups([]);
    }
  }, [session?.user?.email, setGroups]);



  const { data: contacts = [], isLoading, error } = useQuery<Contact[]>(
    ['sentRecipients', session?.user?.email],
    async () => {
      // Check if we have cached data in sessionStorage
      const sessionKey = getContactsSessionKey(session?.user?.email);
      const cachedData = sessionStorage.getItem(sessionKey);
      
      if (cachedData) {
        console.log('Loading contacts from session cache');
        // Show a non-intrusive toast notification
        setTimeout(() => {
          toast.success('Contacts loaded from cache', {
            duration: 2000,
            position: 'bottom-right',
            style: { backgroundColor: '#F4F4FF', color: '#1E1E3F' }
          });
        }, 500);
        // Set a flag to indicate data came from cache
        sessionStorage.setItem('sentRecipients_loaded_from_cache', 'true');
        return adaptContacts(JSON.parse(cachedData));
      }

      console.log('Fetching contacts from API');
      const response = await fetch('/api/contacts');
      
      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }
      
      const data = await response.json();
      // Cache the data in sessionStorage for next time
      sessionStorage.setItem(sessionKey, JSON.stringify(data));
      // Set a flag to indicate data came from API
      sessionStorage.setItem('sentRecipients_loaded_from_cache', 'false');
      return adaptContacts(data);
    },
    {
      enabled: !!session?.user?.email,
      // Set the stale time to 6 hours instead of infinity
      staleTime: 6 * 60 * 60 * 1000, // 6 hours in milliseconds
      // Set the cache time to 8 hours
      cacheTime: 8 * 60 * 60 * 1000 // 8 hours in milliseconds
    }
  );

  // Check if cleanup assistant has been shown before - this needs to run AFTER contacts are loaded
  useEffect(() => {
    if (!session?.user?.email || isLoading) return;
    
    console.log("Checking cleanup assistant status...");
    
    // First check if assistant was just manually closed in this session
    // This is a strong signal that we should not show it again immediately
    const justClosed = sessionStorage.getItem('cleanup_just_closed') === 'true';
    if (justClosed) {
      console.log("Cleanup assistant was just closed, not showing again");
      setShowCleanupAssistant(false);
      return;
    }
    
    // Check if we should force show the cleanup assistant (after Clear Session or explicit refresh)
    const forceShow = sessionStorage.getItem('force_show_cleanup') === 'true';
    if (forceShow) {
      // Clear the force show flag
      sessionStorage.removeItem('force_show_cleanup');
      console.log("Force showing cleanup assistant after session clear or refresh");
      setShowCleanupAssistant(true);
      return;
    }
    
    // Check if data was loaded from cache
    const loadedFromCache = sessionStorage.getItem('sentRecipients_loaded_from_cache') === 'true';
    
    // Get the session key for this user's cleanup assistant state
    const sessionKey = `cleanup-shown-in-session-${session.user.email}`;
    
    // Check if we've already shown the assistant in this session
    const shownInCurrentSession = sessionStorage.getItem(sessionKey) === 'true';
    
    console.log("Cleanup assistant shown in session:", shownInCurrentSession, "Data loaded from cache:", loadedFromCache);
    
    // Only show cleanup assistant if:
    // 1. It hasn't been shown yet in this session AND
    // 2. Data was NOT loaded from cache (i.e., it was freshly loaded from the API)
    if (!shownInCurrentSession && !loadedFromCache) {
      console.log("Showing cleanup assistant (fresh API data)");
      setShowCleanupAssistant(true);
      // Mark that we've shown it in this session
      sessionStorage.setItem(sessionKey, 'true');
    } else {
      console.log("Not showing cleanup assistant");
      setShowCleanupAssistant(false);
    }
  }, [session?.user?.email, isLoading]);

  // Function to invalidate cache and refresh data
  const refreshContacts = useCallback(() => {
    const sessionKey = getContactsSessionKey(session?.user?.email);
    sessionStorage.removeItem(sessionKey);
    
    // Set sentRecipients_loaded_from_cache to false since we're forcing a refresh
    sessionStorage.setItem('sentRecipients_loaded_from_cache', 'false');
    
    // Set force_show_cleanup to true since this is an explicit refresh
    sessionStorage.setItem('force_show_cleanup', 'true');
    sessionStorage.removeItem('cleanup_just_closed'); // Clear this flag
    
    queryClient.invalidateQueries({ queryKey: ['sentRecipients', session?.user?.email] });
  }, [queryClient, session?.user?.email]);



  // For development/testing - simulate a new session without clearing permanent preferences
  const resetSessionOnly = useCallback(() => {
    if (session?.user?.email) {
      // Set consistent flags for testing
      sessionStorage.removeItem(`cleanup-shown-in-session-${session.user.email}`);
      sessionStorage.setItem('force_show_cleanup', 'true');
      sessionStorage.setItem('sentRecipients_loaded_from_cache', 'false');
      sessionStorage.removeItem('cleanup_just_closed'); // Make sure we clear this
      
      // Show cleanup assistant immediately
      setShowCleanupAssistant(true);
      
      toast.success('Cleanup assistant showing (simulating first visit)', { 
        duration: 2000,
        style: { background: '#F4F4FF', color: '#1E1E3F' }
      });
    }
  }, [session?.user?.email]);

  // Filter out spam contacts for display
  const displayContacts = contacts.filter((contact: Contact) => 
    !(contact as ContactWithSpam).isSpam
  );

  const availableColumns = useMemo(() => [
    {
      key: 'name' as ColumnKey,
      label: 'Name',
      description: 'Contact\'s full name',
      render: (contact: Contact) => contact.name
    },
    {
      key: 'email' as ColumnKey,
      label: 'Email',
      description: 'Primary email address',
      render: (contact: Contact) => contact.email
    },
    {
      key: 'lastContacted' as ColumnKey,
      label: 'Last Emailed',
      description: 'Most recent email sent',
      render: (contact: Contact) => format(new Date(contact.lastContacted), 'MMM d, yyyy')
    },
    {
      key: 'company' as ColumnKey,
      label: 'Company',
      description: 'Current organization',
      render: (contact: Contact) => contact.company || '-'
    },
    ...(contacts[0]?.customFields?.map((field: CustomField) => ({
      key: field.label.toLowerCase().replace(/\s+/g, '_') as ColumnKey,
      label: field.label,
      description: `Custom field: ${field.label}`,
      render: (contact: Contact) => {
        const customField = contact.customFields?.find(f => 
          f.label.toLowerCase().replace(/\s+/g, '_') === field.label.toLowerCase().replace(/\s+/g, '_')
        );
        return customField?.value || '-';
      }
    })) || [])
  ], [contacts]);

  // Replace this useEffect with direct assignment
  useEffect(() => {
    // Only update if availableColumnsList isn't already set or if columns have changed
    const columnsChanged = JSON.stringify(availableColumnsList) !== JSON.stringify(availableColumns);
    if (availableColumnsList.length === 0 || columnsChanged) {
      setAvailableColumnsList(availableColumns);
    }
  }, [availableColumns, availableColumnsList]);

  // Save groups to localStorage whenever they change
  useEffect(() => {
    if (session?.user?.email) {
      const groupsKey = getGroupsStorageKey(session.user.email);
      localStorage.setItem(groupsKey, JSON.stringify(groups));
    }
  }, [groups, session?.user?.email]);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Add utility functions for smart domain filtering
  const extractDomain = useCallback((email: string): string => {
    const parts = email.split('@');
    return parts.length > 1 ? parts[1].toLowerCase() : '';
  }, []);

  const isDomainSearch = (term: string): boolean => {
    // Checks if a search term appears to be a domain or partial domain
    // Examples: "amazon", "gmail", "amazon.com", etc.
    return !term.includes('@') && !term.includes(' ') && (
      term.includes('.') || 
      ['gmail', 'yahoo', 'hotmail', 'outlook', 'amazon', 'apple', 'google', 'facebook', 
       'microsoft', 'aol', 'proton', 'icloud', 'me', 'live', 'msn', 'zoho'].includes(term.toLowerCase())
    );
  };

  const domainMatches = (email: string, domainTerm: string): boolean => {
    const domain = extractDomain(email);
    const searchTerm = domainTerm.toLowerCase();

    // Check for exact matches
    if (domain === searchTerm) return true;
    
    // Handle common variations
    if (searchTerm === 'gmail' && domain === 'gmail.com') return true;
    if (searchTerm === 'yahoo' && (domain === 'yahoo.com' || domain === 'yahoo.co.uk')) return true;
    if (searchTerm === 'hotmail' && (domain === 'hotmail.com' || domain === 'hotmail.co.uk')) return true;
    if (searchTerm === 'outlook' && domain === 'outlook.com') return true;
    if (searchTerm === 'icloud' && domain === 'icloud.com') return true;
    if (searchTerm === 'me' && domain === 'me.com') return true;
    if (searchTerm === 'live' && domain === 'live.com') return true;
    if (searchTerm === 'msn' && domain === 'msn.com') return true;
    
    // Handle partial domain matches (e.g., "amazon" matches "amazon.com", "amazon.co.uk", etc.)
    if (domain.startsWith(searchTerm + '.')) return true;
    
    // Special case for domain search with TLD
    if (searchTerm.includes('.')) {
      // Allow subdomain matches, e.g., "mail.google.com" when searching for "google.com"
      const searchParts = searchTerm.split('.');
      const domainParts = domain.split('.');
      
      // If the domain term has fewer parts than the full domain
      if (searchParts.length < domainParts.length) {
        // Extract the last N parts of the domain where N is the length of the search term parts
        const relevantDomainParts = domainParts.slice(-searchParts.length);
        return relevantDomainParts.join('.') === searchTerm;
      }
    }
    
    return false;
  };

  // Add function to group contacts by domain
  const groupContactsByDomain = useCallback((contacts: Contact[]) => {
    // Create a map to group contacts by domain
    const domainGroups = new Map<string, Contact[]>();
    
    contacts.forEach(contact => {
      const domain = extractDomain(contact.email);
      if (!domainGroups.has(domain)) {
        domainGroups.set(domain, []);
      }
      domainGroups.get(domain)!.push(contact);
    });
    
    // Convert map to array of [domain, contacts] pairs and sort by domain
    return Array.from(domainGroups.entries())
      .sort((a, b) => a[0].localeCompare(b[0]));
  }, [extractDomain]);

  // Modified getFilteredContacts to handle domain grouping
  const getFilteredContacts = (_contactsParam: Contact[], searchTerm: string, activeFilter: FilterType) => {
    let filteredResults = [...displayContacts];
    
    // Apply search filter
    if (searchTerm) {
      const searchTerms = searchTerm.toLowerCase().split(' ');
      
      filteredResults = filteredResults.filter(contact => 
        searchTerms.every(term => {
          // Check for domain-like search term
          if (isDomainSearch(term)) {
            return domainMatches(contact.email, term);
          }
          
          // Regular search criteria
          return (
            contact.name.toLowerCase().includes(term) ||
            contact.email.toLowerCase().includes(term) ||
            (contact.company && contact.company.toLowerCase().includes(term)) ||
            contact.customFields?.some((field: CustomField) => 
              field.value.toLowerCase().includes(term)
            )
          );
        })
      );
    }
    
    // Apply group filter
    if (activeFilter.startsWith('group-')) {
      const groupId = activeFilter.replace('group-', '');
      const group = groups.find(g => g.id === groupId);
      filteredResults = filteredResults.filter(contact => 
        group?.members.includes(contact.email) ?? false
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      filteredResults.sort((a, b) => {
        // Handle custom field sorting
        if (typeof sortConfig.key === 'string' && sortConfig.key.startsWith('custom_')) {
          const aCustomField = a.customFields?.find((f: CustomField) => 
            f.id === sortConfig.key
          );
          const bCustomField = b.customFields?.find((f: CustomField) => 
            f.id === sortConfig.key
          );
          
          const aValue = aCustomField?.value || '';
          const bValue = bCustomField?.value || '';
          
          // Try to sort numerically if both values are numbers
          const aNum = Number(aValue);
          const bNum = Number(bValue);
          if (!isNaN(aNum) && !isNaN(bNum)) {
            return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
          }
          
          // Otherwise sort alphabetically
          return sortConfig.direction === 'asc'
            ? String(aValue).localeCompare(String(bValue))
            : String(bValue).localeCompare(String(aValue));
        }
        
        // Handle standard field sorting
        if (sortConfig.key && sortConfig.key in a) {
          const aValue = a[sortConfig.key as keyof Contact];
          const bValue = b[sortConfig.key as keyof Contact];
          
          if (sortConfig.key === 'lastContacted') {
            return sortConfig.direction === 'asc'
              ? new Date(aValue as string).getTime() - new Date(bValue as string).getTime()
              : new Date(bValue as string).getTime() - new Date(aValue as string).getTime();
          }
          
          return sortConfig.direction === 'asc'
            ? String(aValue).localeCompare(String(bValue))
            : String(bValue).localeCompare(String(aValue));
        }
        
        return 0;
      });
    }
    
    return filteredResults;
  };
  
  const filteredContacts = getFilteredContacts(contacts, search, filter);
  
  // Get domain-grouped contacts when in domain filter mode and domain search is active
  const domainGroupedContacts = useMemo(() => {
    if (isDomainFilterMode && search && isDomainSearch(search)) {
      return groupContactsByDomain(filteredContacts);
    }
    return null;
  }, [filteredContacts, isDomainFilterMode, search, groupContactsByDomain]);

  const handleSort = (key: keyof Contact | CustomColumnKey) => {
    setSortConfig(prevConfig => {
      const isSameKey = prevConfig.key === key;
      return {
        key,
        direction: isSameKey && prevConfig.direction === 'asc' ? 'desc' : 'asc'
      };
    });
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter]);

  // Memoize the custom fields processing
  const customFieldsData = useMemo(() => {
    if (!contacts?.length) return [];
    
    const firstContactWithFields = contacts.find((contact: Contact) => 
      contact.customFields && contact.customFields.length > 0
    );
    
    if (!firstContactWithFields?.customFields) return [];
    
    return firstContactWithFields.customFields.map((field: CustomField) => 
      `custom_${field.label.toLowerCase().replace(/\s+/g, '_')}` as ColumnKey
    );
  }, [contacts]);

  // Memoize the column update function
  const updateColumns = useCallback((customFields: ColumnKey[]) => {
    setActiveColumns(prev => {
      const newFields = customFields.filter(key => !prev.includes(key));
      return newFields.length > 0 ? [...prev, ...newFields] : prev;
    });
  }, []);

  // Use effect with memoized values
  useEffect(() => {
    if (customFieldsData.length > 0) {
      // Check if we actually need to update to avoid unnecessary state changes
      const newFields = customFieldsData.filter((key: ColumnKey) => !activeColumns.includes(key));
      if (newFields.length > 0) {
        updateColumns(customFieldsData);
      }
    }
  }, [customFieldsData, updateColumns, activeColumns]);

  const updateContactMutation = useMutation({
    mutationFn: async (updatedContact: Contact) => {
      const response = await fetch(`/api/contacts/${updatedContact.email}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedContact),
      });
      if (!response.ok) {
        throw new Error('Failed to update contact');
      }
      return response.json();
    },
    onSuccess: (updatedContact) => {
      console.log('Contact updated:', updatedContact);
      queryClient.setQueryData(['sentRecipients', session?.user?.email], (oldData: Contact[] | undefined) => {
        if (!oldData) return [updatedContact];
        const newData = oldData.map(contact => 
          contact.email === updatedContact.email ? updatedContact : contact
        );
        console.log('Updated contacts:', newData);
        
        // Update sessionStorage with the new data
        const sessionKey = getContactsSessionKey(session?.user?.email);
        sessionStorage.setItem(sessionKey, JSON.stringify(newData));
        
        return newData;
      });
    },
  });

  const handleImportComplete = useCallback((newContacts: Contact[]) => {
    queryClient.setQueryData(['sentRecipients', session?.user?.email], (oldData: Contact[] | undefined) => {
      if (!oldData) return newContacts;
      
      // Filter out any contacts that are marked as spam
      const nonSpamContacts = oldData.filter(contact => !(contact as ContactWithSpam).isSpam);
      
      // Create a Set of existing email addresses (case-insensitive)
      const existingEmails = new Set(nonSpamContacts.map(c => c.email.toLowerCase()));
      
      // Only add new contacts that don't exist in the current list
      const uniqueNewContacts = newContacts.filter(
        contact => !existingEmails.has(contact.email.toLowerCase())
      );
      
      const updatedContacts = [...nonSpamContacts, ...uniqueNewContacts];
      
      // Update sessionStorage with the new data
      const sessionKey = getContactsSessionKey(session?.user?.email);
      sessionStorage.setItem(sessionKey, JSON.stringify(updatedContacts));
      
      // Always show cleanup assistant after import if there are new contacts
      if (uniqueNewContacts.length > 0) {
        // Clear the "just closed" flag if it exists
        sessionStorage.removeItem('cleanup_just_closed');
        
        // Directly show cleanup assistant without relying on the useEffect
        setShowCleanupAssistant(true);
        
        // Force the cleanup assistant to show even after refresh,
        // but only if new contacts were added
        if (session?.user?.email) {
          // Set flags for consistent behavior
          sessionStorage.removeItem(`cleanup-shown-in-session-${session.user.email}`);
          sessionStorage.setItem('force_show_cleanup', 'true');
          sessionStorage.setItem('sentRecipients_loaded_from_cache', 'false');
        }
        
        toast.success(`Imported ${uniqueNewContacts.length} new contacts`, {
          duration: 3000,
          style: { background: '#F4F4FF', color: '#1E1E3F' }
        });
      } else if (newContacts.length > 0) {
        toast.success('All contacts already exist in your network', {
          duration: 3000,
          style: { background: '#F4F4FF', color: '#1E1E3F' }
        });
      } else {
        toast.error('No contacts found in import file', {
          duration: 3000,
          style: { background: '#FFEBEE', color: '#C62828' }
        });
      }
      
      return updatedContacts;
    });
  }, [queryClient, session?.user?.email]);

  const handleContactUpdate = async (updatedContact: Contact): Promise<void> => {
    try {
      await updateContactMutation.mutate(updatedContact);
    } catch (error) {
      console.error('Failed to update contact:', error);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    toast[type](message);
  };

  // Handle domain selection from domain stats
  const handleDomainSelect = (domain: string) => {
    if (domain === selectedDomain) {
      setSelectedDomain(undefined);
      setSearch(''); // Clear search when deselecting
    } else {
      setSelectedDomain(domain);
      setSearch(domain); // Set search to selected domain
      if (!isDomainFilterMode) {
        setIsDomainFilterMode(true); // Ensure domain filter mode is active
      }
    }
  };

  // Update search state when debounced value changes
  useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="flex flex-col items-center justify-center">
          <div className="w-16 h-16 relative">
            <div className="w-16 h-16 rounded-full border-4 border-[#F4F4FF]"></div>
            <div className="w-16 h-16 rounded-full border-4 border-t-[#1E1E3F] animate-spin absolute inset-0"></div>
          </div>
          <h2 className="text-xl font-semibold text-[#1E1E3F] mt-8 mb-2">
            Organizing Your Network
          </h2>
          <p className="text-gray-600 text-center max-w-md">
            We're analyzing your contacts to provide personalized insights
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-red-500 mb-4">⚠️ Error</div>
        <p className="text-gray-600 dark:text-gray-400">{error instanceof Error ? error.message : 'An unknown error occurred'}</p>
      </div>
    );
  }

  // Add these calculations before the return statement
  // const { needFollowUp, activeConnectionsPercentage } = calculateMetrics();

  const handleCreateGroup = (name: string, members: Set<string>) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const newGroup = {
      id: Date.now().toString(),
      name,
      members: Array.from(members)
    };
    
    const updatedGroups = [...groups, newGroup];
    setGroups(updatedGroups);
    
    setShowGroupModal(false);
    setFilter(`group-${newGroup.id}`);
  };

  const handleDeleteGroup = (groupId: string) => {
    if (filter === `group-${groupId}`) setFilter('all');
    const updatedGroups = groups.filter(g => g.id !== groupId);
    setGroups(updatedGroups);
  };

  const handleEditGroup = (group: { id: string; name: string; members: string[] }) => {
    setEditingGroup(group);
    setShowGroupModal(true);
  };

  const handleGroupSave = (name: string, members: Set<string>) => {
    if (editingGroup) {
      const updatedGroups = groups.map(g => 
        g.id === editingGroup.id 
          ? { ...g, name, members: Array.from(members) }
          : g
      );
      setGroups(updatedGroups);
    } else {
      handleCreateGroup(name, members);
    }
    setShowGroupModal(false);
    setEditingGroup(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddColumn = (column: { 
    key: string; 
    label: string; 
    render: (contact: Contact) => React.ReactNode 
  }) => {
    const customKey = `custom_${column.label.toLowerCase().replace(/\s+/g, '_')}` as CustomColumnKey;
    const newColumn = {
      key: customKey,
      label: column.label,
      description: `Custom field: ${column.label}`,
      render: column.render
    };
    
    // Update contacts to include the new custom field
    const updatedContacts = contacts.map((contact: Contact) => ({
      ...contact,
      customFields: [
        ...(contact.customFields || []),
        {
          id: customKey,
          label: column.label,
          value: ''
        }
      ]
    }));
    
    queryClient.setQueryData(['sentRecipients', session?.user?.email], updatedContacts);
    
    setActiveColumns(prev => {
      if (prev.includes(customKey)) return prev;
      return [...prev, customKey];
    });
    
    setAvailableColumnsList(prev => {
      if (prev.some(col => col.key === customKey)) return prev;
      return [...prev, newColumn];
    });
  };

  const handleStartCleanup = () => {
    setShowOnboarding(false);
    sessionStorage.removeItem('cleanup_just_closed'); // Clear this flag
    setShowCleanupAssistant(true);
  };

  const handleSkipOnboarding = () => {
    setShowOnboarding(false);
    // We don't need to mark cleanup as permanently completed anymore
  };

  const quickFilters: QuickFilterItem[] = [
    { id: 'all', label: 'All', icon: 'Users', isGroup: false },
    { id: 'domain', label: 'By Domain', icon: 'Globe', isGroup: false }
  ];

  // Update the filter handling logic
  const handleFilterClick = (filterId: string) => {
    if (filterId === 'domain') {
      setIsDomainFilterMode(!isDomainFilterMode);
      // If turning on domain filter mode, clear search if it doesn't look like a domain
      if (!isDomainFilterMode && search && !isDomainSearch(search)) {
        setSearch('');
      }
    } else {
      const newFilter = filter === filterId ? 'all' : filterId as FilterType;
      setFilter(newFilter);
      
      // Update URL if selecting or deselecting a group
      if (newFilter !== 'all' && newFilter.startsWith('group-')) {
        const groupId = newFilter.replace('group-', '');
        const newParams = new URLSearchParams(searchParams);
        newParams.set('group', groupId);
        router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
      } else if (filterId.startsWith('group-')) {
        // If deselecting a group, remove group param
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('group');
        router.replace(pathname, { scroll: false });
      }
      
      // Turn off domain filter mode when selecting other filters
      if (isDomainFilterMode) {
        setIsDomainFilterMode(false);
      }
    }
  };

  // Add a placeholder hint for domain search
  const getSearchPlaceholder = () => {
    if (isDomainFilterMode) {
      return "Type a domain or company name (e.g., amazon, gmail.com)...";
    }
    return "Search by name, email, company...";
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-full">
        {/* Enhanced Header Section */}
        <div className="bg-gradient-to-r from-[#F4F4FF] to-[#FAFAFA] rounded-3xl p-4 md:p-8 overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#1E1E3F] mb-2">Your Network</h1>
              <p className="text-gray-600">Manage and organize your professional connections</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <button
                onClick={refreshContacts}
                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all text-sm"
                title="Refresh contacts"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="hidden md:inline">Refresh</span>
              </button>
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={resetSessionOnly}
                  className="flex items-center gap-2 px-3 md:px-4 py-2 bg-gray-100 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all text-sm"
                  title="Show cleanup assistant (testing only)"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="hidden md:inline">Test Cleanup</span>
                </button>
              )}
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={() => {
                    // Clear all session data for testing
                    sessionStorage.clear();
                    
                    // Set flags for the next load:
                    // 1. Force show cleanup (for testing)
                    sessionStorage.setItem('force_show_cleanup', 'true');
                    // 2. Mark that we're not loading from cache
                    sessionStorage.setItem('sentRecipients_loaded_from_cache', 'false');
                    
                    toast.success('All session data cleared', {
                      duration: 2000,
                      style: { background: '#F4F4FF', color: '#1E1E3F' }
                    });
                    
                    // Reload the page to simulate a fresh visit
                    setTimeout(() => window.location.reload(), 500);
                  }}
                  className="flex items-center gap-2 px-3 md:px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-xl hover:bg-red-100 transition-all text-sm"
                  title="Clear all session data (testing only)"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span className="hidden md:inline">Clear Session</span>
                </button>
              )}
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={() => {
                    // Show all localStorage keys and values
                    const storage: Record<string, unknown> = {};
                    Object.keys(localStorage).forEach(key => {
                      try {
                        storage[key] = JSON.parse(localStorage.getItem(key) || '');
                      } catch {
                        storage[key] = localStorage.getItem(key);
                      }
                    });
                    console.log('All localStorage items:', storage);
                    
                    toast.success('Storage data logged to console', {
                      duration: 2000,
                      style: { background: '#F4F4FF', color: '#1E1E3F' }
                    });
                  }}
                  className="flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl hover:bg-blue-100 transition-all text-sm"
                  title="Log storage data to console (testing only)"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span className="hidden md:inline">Debug Storage</span>
                </button>
              )}
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={() => {
                    // Clear groups data
                    Object.keys(localStorage).forEach(key => {
                      if (key.startsWith('contact-groups_')) {
                        localStorage.removeItem(key);
                      }
                    });
                    
                    // Also clear the legacy groups data
                    localStorage.removeItem('contact-groups');
                    
                    // Reset groups state using the hook's setGroups
                    setGroups([]);
                    
                    toast.success('All groups data cleared', {
                      duration: 2000,
                      style: { background: '#F4F4FF', color: '#1E1E3F' }
                    });
                  }}
                  className="flex items-center gap-2 px-3 md:px-4 py-2 bg-orange-50 border border-orange-200 text-orange-700 rounded-xl hover:bg-orange-100 transition-all text-sm"
                  title="Clear all groups data (testing only)"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span className="hidden md:inline">Clear Groups</span>
                </button>
              )}
              <button
                onClick={() => setShowGroupModal(true)}
                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-gradient-to-r from-[#1E1E3F] to-[#2D2D5F] text-white rounded-xl hover:opacity-90 transition-all text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden md:inline">Create Group</span>
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span className="hidden md:inline">Import CSV</span>
              </button>
              <button
                onClick={() => setShowGroupExportModal(true)}
                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span className="hidden md:inline">{currentGroup ? 'Export Group' : 'Export'}</span>
              </button>
            </div>
          </div>

          {/* Filter section */}
          <div className="mb-4 md:mb-6 overflow-x-auto pb-2 hide-scrollbar">
            <div className="flex gap-2 md:gap-3 items-center">
              {/* Debug logging 
                console.log('Rendering filters, current filter:', filter, 'loadedGroups:', loadedGroups, 'groups:', groups)
              */}
              {loadedGroups && [...quickFilters, ...groups.map(group => ({
                id: `group-${group.id}`, 
                label: group.name, 
                isGroup: true,
                groupData: group
              } as GroupFilterItem))].map((filterItem: FilterItem) => {
                // Debug each filter item is commented out for production
                // console.log('Filter item:', filterItem.id, 'selected:', filterItem.id === 'domain' ? isDomainFilterMode : filter === filterItem.id);
                return (
                  <div key={filterItem.id} className="relative group">
                    <FilterChip
                      label={filterItem.id.startsWith('group-') 
                        ? filterItem.label 
                        : filterItem.id.charAt(0).toUpperCase() + filterItem.id.slice(1).replace(/([A-Z])/g, ' $1')}
                      icon={filterItem.isGroup ? 'Users' as IconName : filterItem.icon}
                      selected={filterItem.id === 'domain' ? isDomainFilterMode : filter === filterItem.id}
                      onClick={() => handleFilterClick(filterItem.id)}
                      badge={filterItem.isGroup ? filterItem.groupData?.members.length : undefined}
                      tooltipContent={filterItem.isGroup 
                        ? `Filter by ${filterItem.label} group contacts` 
                        : filterItem.id === 'domain'
                          ? 'Filter contacts by domain (e.g., gmail, amazon.com)'
                          : `Show ${filterItem.id === 'all' ? 'all' : filterItem.id.charAt(0).toUpperCase() + filterItem.id.slice(1).replace(/([A-Z])/g, ' $1').toLowerCase()} contacts`}
                      showSelectedIcon={true}
                    />
                    {filterItem.isGroup && (
                      <div className="absolute right-0 top-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity -mt-2 -mr-2">
                        <button 
                          onClick={() => handleEditGroup(filterItem.groupData)}
                          className="bg-white rounded-full p-1 shadow-md"
                          title="Edit group"
                        >
                          <Icon name="Edit2" size={12} className="text-gray-500" />
                        </button>
                        <button 
                          onClick={() => handleDeleteGroup(filterItem.groupData.id)}
                          className="bg-white rounded-full p-1 shadow-md"
                          title="Delete group"
                        >
                          <Icon name="Trash2" size={12} className="text-red-500" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Enhanced Search Bar */}
        <div className="bg-white rounded-3xl shadow-sm mb-4">
          <div className="p-4">
            <div className="relative">
              <input
                type="text"
                value={inputSearch}
                onChange={(e) => setInputSearch(e.target.value)}
                placeholder={getSearchPlaceholder()}
                className={`w-full px-4 py-3 pl-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E1E3F] focus:border-transparent transition-all ${(isDomainFilterMode || (search && isDomainSearch(search))) ? 'border-[#4B4BA6] bg-[#F4F4FF]' : ''}`}
              />
              <svg 
                className="w-6 h-6 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {search && isDomainSearch(search) && (
                <div className="absolute right-16 top-1/2 -translate-y-1/2 text-[#4B4BA6] bg-[#F4F4FF] px-2 py-0.5 rounded text-xs font-medium">
                  Domain Search
                </div>
              )}
              {inputSearch && (
                <button
                  onClick={() => {
                    setInputSearch('');
                    setSearch('');
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
            {(isDomainFilterMode || (search && isDomainSearch(search))) && (
              <div className="mt-2 text-xs flex items-start">
                <svg className="w-4 h-4 mr-1 text-[#4B4BA6] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" 
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div className="text-gray-600">
                  <p className="font-medium text-[#4B4BA6]">Smart Domain Search</p>
                  <p>
                    {search ? (
                      <>Showing contacts with <span className="font-semibold">{search}</span> and related domains like <span className="font-semibold">{search.includes('.') ? search : `${search}.com`}</span></>
                    ) : (
                      <>Type a company or domain name (e.g., <span className="font-medium">amazon</span>, <span className="font-medium">gmail</span>) to filter your contacts</>
                    )}
                  </p>
                  {search && !search.includes('@') && !search.includes(' ') && (
                    <p className="mt-1 text-gray-500">
                      Note: Partial matches like "{search}" will match "{search}.com", "{search}.org", etc.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Domain Stats Section - Only show when domain filter mode is active */}
        {isDomainFilterMode && (
          <div className="mb-4">
            <DomainStats 
              contacts={displayContacts}
              extractDomain={extractDomain}
              selectedDomain={selectedDomain}
              onDomainSelect={handleDomainSelect}
            />
          </div>
        )}

        {/* Enhanced Table Section */}
        <div className="bg-white rounded-3xl shadow-sm">
          <div className="p-4 flex justify-between border-b border-gray-100">
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-700">Your Network</span>
              <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-[#F4F4FF] text-[#1E1E3F]">
                {filteredContacts.length} contacts
              </span>
              {isDomainFilterMode && search && isDomainSearch(search) && domainGroupedContacts && (
                <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-[#F4F4FF] text-[#1E1E3F]">
                  {domainGroupedContacts.length} domains
                </span>
              )}
            </div>
            <ColumnCustomizer
              availableColumns={availableColumnsList}
              activeColumns={activeColumns}
              onColumnChange={(columns) => setActiveColumns(columns as ColumnKey[])}
              onAddColumn={handleAddColumn}
              onEditColumn={(key, newLabel) => {
                // Also update availableColumnsList to show the new label in the UI
                setAvailableColumnsList(prev => prev.map(col => 
                  col.key === key ? { ...col, label: newLabel } : col
                ));
              }}
            />
          </div>

          {isDomainFilterMode && search && isDomainSearch(search) && domainGroupedContacts ? (
            // Domain-grouped view
            <div className="divide-y divide-gray-100">
              {domainGroupedContacts.map(([domain, domainContacts]) => (
                <div key={domain} className="py-2">
                  <div className="px-4 py-2 bg-gray-50 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-[#4B4BA6]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 21a9 9 0 100-18 9 9 0 000 18z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3.6 9h16.8M3.6 15h16.8M12 3a4.5 4.5 0 000 18 4.5 4.5 0 000-18z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="font-medium text-sm text-[#1E1E3F]">{domain}</span>
                    <span className="ml-2 text-xs text-gray-500">({domainContacts.length} contacts)</span>
                  </div>
                  <ContactTable 
                    contacts={domainContacts}
                    onContactClick={setSelectedContact}
                    onContactUpdate={handleContactUpdate}
                    currentPage={1}
                    itemsPerPage={domainContacts.length}
                    columns={availableColumnsList.filter(col => activeColumns.includes(col.key))}
                    className="divide-y divide-gray-100"
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    showToast={showToast}
                    totalContacts={domainContacts.length}
                    onPageChange={() => {}}
                    onPageSizeChange={() => {}}
                    hideHeader={true}
                  />
                </div>
              ))}
            </div>
          ) : (
            // Standard view
            <ContactTable 
              contacts={filteredContacts}
              onContactClick={setSelectedContact}
              onContactUpdate={handleContactUpdate}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              columns={availableColumnsList.filter(col => activeColumns.includes(col.key))}
              className="divide-y divide-gray-100"
              sortConfig={sortConfig}
              onSort={handleSort}
              showToast={showToast}
              totalContacts={filteredContacts.length}
              onPageChange={(page) => setCurrentPage(page)}
              onPageSizeChange={(size) => setItemsPerPage(size)}
            />
          )}
        </div>
      </div>

      {selectedContact && (
        <ContactDetail
          contact={selectedContact}
          onClose={() => setSelectedContact(null)}
          onSave={(contact) => updateContactMutation.mutate(contact)}
          onAddColumn={handleAddColumn}
        />
      )}

      {/* Group Modal */}
      <GroupModal
        isOpen={showGroupModal}
        onClose={() => {
          setShowGroupModal(false);
          setEditingGroup(null);
        }}
        contacts={contacts}
        onGroupCreate={handleGroupSave}
        editingGroup={editingGroup || undefined}
      />

      {/* Onboarding Prompt */}
      {showOnboarding && (
        <OnboardingPrompt 
          onStartCleanup={handleStartCleanup} 
          onSkip={handleSkipOnboarding} 
        />
      )}

      {/* Inbox Cleanup Assistant */}
      {showCleanupAssistant && (
        <InboxCleanupAssistant 
          contacts={contacts}
          onMarkAsSpam={(emails) => {
            const updatedContacts = contacts.map((contact: Contact) => ({
              ...contact,
              isSpam: emails.includes(contact.email)
            } as ContactWithSpam));
            queryClient.setQueryData(['sentRecipients', session?.user?.email], updatedContacts);
            
            // Update sessionStorage with the new data
            const sessionKey = getContactsSessionKey(session?.user?.email);
            sessionStorage.setItem(sessionKey, JSON.stringify(updatedContacts));
          }}
          onUndo={(email) => {
            const updatedContacts = contacts.map((contact: Contact) => ({
              ...contact,
              isSpam: (contact as ContactWithSpam).isSpam === undefined ? false : 
                     email === contact.email ? false : (contact as ContactWithSpam).isSpam
            } as ContactWithSpam));
            queryClient.setQueryData(['sentRecipients', session?.user?.email], updatedContacts);
            
            // Update sessionStorage with the new data
            const sessionKey = getContactsSessionKey(session?.user?.email);
            sessionStorage.setItem(sessionKey, JSON.stringify(updatedContacts));
          }}
          onExcludeFromAnalytics={(exclude) => {
            // Update analytics settings in user preferences
            fetch('/api/user/preferences', {
              method: 'PATCH',
              body: JSON.stringify({ excludeFromAnalytics: exclude })
            });
          }}
          onClose={() => {
            // Set flag that we just closed the assistant to prevent it from immediately showing again
            sessionStorage.setItem('cleanup_just_closed', 'true');
            
            // After a short delay, remove the "just closed" flag to allow normal behavior later
            setTimeout(() => {
              sessionStorage.removeItem('cleanup_just_closed');
            }, 5000); // 5 seconds is enough to prevent double-showing
            
            setShowCleanupAssistant(false);
          }}
        />
      )}

      {/* Group Export Modal */}
      <GroupExportModal
        isOpen={showGroupExportModal}
        onClose={() => setShowGroupExportModal(false)}
        groupName={currentGroup?.name || 'All Contacts'}
        contacts={currentGroup 
          ? contacts.filter((contact: Contact) => currentGroup.members.includes(contact.email))
          : filteredContacts
        }
      />

      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportComplete={handleImportComplete}
      />
    </AppLayout>
  );
}