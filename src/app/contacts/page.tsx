'use client';

import AppLayout from '@/components/Layout/AppLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from "next-auth/react";
import { useEffect, useState, useMemo, useCallback } from "react";
import { format } from "date-fns";
import GroupFAB from "@/components/GroupFAB";
import GroupModal from "@/components/GroupModal";
import { Contact } from '@/types';
import SmartInsights from "@/components/SmartInsights";
import StatCard from "@/components/StatCard";
import SearchInput from "@/components/SearchInput";
import Link from "next/link";
import ContactTable from "@/components/ContactTable";
import ContactDetail from "@/components/ContactDetail";
import Pagination from "@/components/Pagination";
import { calculateVelocityScore } from '@/utils/velocityTracking';
import ColumnCustomizer from "@/components/ColumnCustomizer";
import ExportButton from '@/components/ExportButton';
import { useRouter } from 'next/navigation';
import OnboardingPrompt from '@/components/OnboardingPrompt';
import InboxCleanupAssistant from '@/components/insights/InboxCleanupAssistant';
import GroupExportModal from '@/components/GroupExportModal';
import NetworkScore from '@/components/insights/NetworkScore';
import ImportModal from '@/components/ImportModal';
import { toast } from 'react-hot-toast';

// Helper function to get the consistent session storage key
const getContactsSessionKey = (userEmail: string | null | undefined) => {
  return `contacts_${userEmail || 'unknown'}`;
};

// interface Contact {
//   name: string;
//   email: string;
//   lastContacted: string;
// }

type FilterType = 'active' | 'noReply' | 'needsAttention' | 'all' | 'followup' | 'close' | `group-${string}`;

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

// Add this function before the importContactsMutation declaration
const importContactsFunction = async () => {
  const response = await fetch('/api/contacts/import', {
    method: 'POST'
  });
  if (!response.ok) throw new Error('Failed to import contacts');
  return response.json();
};

export default function ContactsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groups, setGroups] = useState<Array<{id: string, name: string, members: string[]}>>([]);
  
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
  const [lastDeletedGroup, setLastDeletedGroup] = useState<{id: string, name: string, members: string[]} | null>(null);
  const [editingGroup, setEditingGroup] = useState<{id: string, name: string, members: string[]} | null>(null);
  const [activeColumns, setActiveColumns] = useState<ColumnKey[]>([
    'name',
    'email',
    'company',
    'lastContacted'
  ]);
  const [customColumns, setCustomColumns] = useState<Column[]>([]);
  const [availableColumnsList, setAvailableColumnsList] = useState<Column[]>([]);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showCleanupAssistant, setShowCleanupAssistant] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Clear session cache if the user changes
  useEffect(() => {
    if (!session?.user?.email) {
      // User logged out or session expired
      // Clear session cache
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('contacts_')) {
          sessionStorage.removeItem(key);
        }
      });
    }
  }, [session?.user?.email]);

  const importContactsMutation = useMutation({
    mutationFn: importContactsFunction,
    onSuccess: (data) => {
      // Always show cleanup assistant after importing contacts
      if (data && data.length > 0) {
        // Clear the "just closed" flag if it exists
        sessionStorage.removeItem('cleanup_just_closed');
        
        // If there are new contacts, ensure the cleanup assistant shows
        setShowCleanupAssistant(true);
        
        // Also ensure it shows after page refresh by setting the appropriate flags
        if (session?.user?.email) {
          // Remove shown-in-session marker
          sessionStorage.removeItem(`cleanup-shown-in-session-${session.user.email}`);
          // Force show cleanup
          sessionStorage.setItem('force_show_cleanup', 'true');
          // Mark data as not from cache
          sessionStorage.setItem('contacts_loaded_from_cache', 'false');
        }
        
        setShowOnboarding(false); // We prefer showing the cleanup assistant directly
        
        toast.success(`Imported ${data.length} contacts`, {
          duration: 3000,
          style: { background: '#F4F4FF', color: '#1E1E3F' }
        });
      } else {
        // No new contacts were imported
        toast.success('No new contacts to import', {
          duration: 3000,
          style: { background: '#F4F4FF', color: '#1E1E3F' }
        });
      }
    }
  });

  const { data: contacts = [], isLoading, error } = useQuery({
    queryKey: ['contacts', session?.user?.email],
    queryFn: async () => {
      // Check if we have cached data in sessionStorage
      const sessionKey = getContactsSessionKey(session?.user?.email);
      const cachedData = sessionStorage.getItem(sessionKey);
      
      if (cachedData) {
        console.log('Loading contacts from session cache');
        // Show a non-intrusive toast notification
        setTimeout(() => {
          toast.success('Contacts loaded from cache', { 
            duration: 2000,
            style: { background: '#F4F4FF', color: '#1E1E3F' },
            icon: '⚡'
          });
        }, 100);
        
        // Set a flag to indicate data came from cache
        sessionStorage.setItem('contacts_loaded_from_cache', 'true');
        
        return JSON.parse(cachedData);
      }
      
      console.log('Fetching contacts from API');
      const response = await fetch('/api/contacts');
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Contact fetch error:', errorData);
        // Clear potentially corrupted cache on error
        sessionStorage.removeItem(sessionKey);
        throw new Error(errorData.error || 'Failed to fetch contacts');
      }
      
      const data = await response.json();
      
      // Store the fetched data in sessionStorage
      sessionStorage.setItem(sessionKey, JSON.stringify(data));
      
      // Set a flag to indicate data came from API
      sessionStorage.setItem('contacts_loaded_from_cache', 'false');
      
      // Show a non-intrusive toast notification
      setTimeout(() => {
        toast.success('Contacts loaded from server', { 
          duration: 2000,
          style: { background: '#F4F4FF', color: '#1E1E3F' },
          icon: '🔄'
        });
      }, 100);
      
      return data;
    },
    enabled: !!session?.user?.email,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

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
    const loadedFromCache = sessionStorage.getItem('contacts_loaded_from_cache') === 'true';
    
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
  }, [session?.user?.email, contacts, isLoading]); // Include contacts and loading state as dependencies

  // Function to invalidate cache and refresh data
  const refreshContacts = useCallback(() => {
    const sessionKey = getContactsSessionKey(session?.user?.email);
    sessionStorage.removeItem(sessionKey);
    
    // Set contacts_loaded_from_cache to false since we're forcing a refresh
    sessionStorage.setItem('contacts_loaded_from_cache', 'false');
    
    // Set force_show_cleanup to true since this is an explicit refresh
    sessionStorage.setItem('force_show_cleanup', 'true');
    sessionStorage.removeItem('cleanup_just_closed'); // Clear this flag
    
    queryClient.invalidateQueries({ queryKey: ['contacts', session?.user?.email] });
  }, [queryClient, session?.user?.email]);

  // For development/testing purposes - reset cleanup assistant
  const resetCleanupAssistant = useCallback(() => {
    if (session?.user?.email) {
      // Clear session-based flag
      sessionStorage.removeItem(`cleanup-shown-in-session-${session.user.email}`);
      setShowCleanupAssistant(true);
      toast.success('Cleanup assistant reset', { 
        duration: 2000,
        style: { background: '#F4F4FF', color: '#1E1E3F' }
      });
    }
  }, [session?.user?.email]);

  // For development/testing - simulate a new session without clearing permanent preferences
  const resetSessionOnly = useCallback(() => {
    if (session?.user?.email) {
      // Set consistent flags for testing
      sessionStorage.removeItem(`cleanup-shown-in-session-${session.user.email}`);
      sessionStorage.setItem('force_show_cleanup', 'true');
      sessionStorage.setItem('contacts_loaded_from_cache', 'false');
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
      label: 'Last Contacted',
      description: 'Most recent interaction date',
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

  useEffect(() => {
    setAvailableColumnsList(availableColumns);
  }, [availableColumns]);

  useEffect(() => {
    // Load groups from localStorage on mount
    const savedGroups = localStorage.getItem('contact-groups');
    if (savedGroups) {
      setGroups(JSON.parse(savedGroups));
    }
  }, []);

  // Save groups to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('contact-groups', JSON.stringify(groups));
  }, [groups]);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const getFilteredContacts = (contacts: Contact[], searchTerm: string, activeFilter: FilterType) => {
    let filteredResults = [...displayContacts];
    
    // Apply search filter
    if (searchTerm) {
      const searchTerms = searchTerm.toLowerCase().split(' ');
      filteredResults = filteredResults.filter(contact => 
        searchTerms.every(term =>
          contact.name.toLowerCase().includes(term) ||
          contact.email.toLowerCase().includes(term) ||
          (contact.company && contact.company.toLowerCase().includes(term)) ||
          contact.customFields?.some((field: CustomField) => 
            field.value.toLowerCase().includes(term)
          )
        )
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
      updateColumns(customFieldsData);
    }
  }, [customFieldsData, updateColumns]);

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
      queryClient.setQueryData(['contacts', session?.user?.email], (oldData: Contact[] | undefined) => {
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
    queryClient.setQueryData(['contacts', session?.user?.email], (oldData: Contact[] | undefined) => {
      if (!oldData) return newContacts;
      
      // Filter out any contacts that are marked as spam
      const nonSpamContacts = oldData.filter(contact => !(contact as any).isSpam);
      
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
          sessionStorage.setItem('contacts_loaded_from_cache', 'false');
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
        <p className="text-gray-600 dark:text-gray-400">{error.message}</p>
      </div>
    );
  }

  // Add these calculations before the return statement
  const calculateMetrics = () => {
    const needFollowUp = contacts.filter((contact: Contact) => 
      new Date(contact.lastContacted) < thirtyDaysAgo
    ).length;

    const activeContacts = contacts.filter((contact: Contact) => 
      new Date(contact.lastContacted) > thirtyDaysAgo
    ).length;

    const activeConnectionsPercentage = contacts.length 
      ? Math.round((activeContacts / contacts.length) * 100) 
      : 0;

    return {
      needFollowUp,
      activeConnectionsPercentage
    };
  };

  const { needFollowUp, activeConnectionsPercentage } = calculateMetrics();

  const handleCreateGroup = (name: string, members: Set<string>) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const newGroup = {
      id: Date.now().toString(),
      name,
      members: Array.from(members)
    };
    
    const updatedGroups = [...groups, newGroup];
    setGroups(updatedGroups);
    localStorage.setItem('contact-groups', JSON.stringify(updatedGroups));
    setShowGroupModal(false);
    setFilter(`group-${newGroup.id}`);
  };

  const handleDeleteGroup = (groupId: string) => {
    if (filter === `group-${groupId}`) setFilter('all');
    const updatedGroups = groups.filter(g => g.id !== groupId);
    setGroups(updatedGroups);
    localStorage.setItem('contact-groups', JSON.stringify(updatedGroups));
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
      localStorage.setItem('contact-groups', JSON.stringify(updatedGroups));
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
    
    queryClient.setQueryData(['contacts', session?.user?.email], updatedContacts);
    
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

  const quickFilters = [
    { id: 'all', label: 'All', icon: '👥', isGroup: false }
  ];

  return (
    <AppLayout>
      <div className="p-8 space-y-8">
        {/* Enhanced Header Section */}
        <div className="bg-gradient-to-r from-[#F4F4FF] to-[#FAFAFA] rounded-3xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-[#1E1E3F] mb-2">Your Network</h1>
              <p className="text-gray-600">Manage and organize your professional connections</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={refreshContacts}
                className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
                title="Refresh contacts"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={resetSessionOnly}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gray-100 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
                  title="Show cleanup assistant (testing only)"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Test Cleanup
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
                    sessionStorage.setItem('contacts_loaded_from_cache', 'false');
                    
                    toast.success('All session data cleared', {
                      duration: 2000,
                      style: { background: '#F4F4FF', color: '#1E1E3F' }
                    });
                    
                    // Reload the page to simulate a fresh visit
                    setTimeout(() => window.location.reload(), 500);
                  }}
                  className="flex items-center gap-2 px-6 py-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl hover:bg-red-100 transition-all"
                  title="Clear all session data (testing only)"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear Session
                </button>
              )}
              <button
                onClick={() => setShowGroupModal(true)}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#1E1E3F] to-[#2D2D5F] text-white rounded-xl hover:opacity-90 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Group
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Import CSV
              </button>
              <button
                onClick={() => setShowGroupExportModal(true)}
                className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {currentGroup ? 'Export Group' : 'Export Contacts'}
              </button>
            </div>
          </div>

          {/* Enhanced Filter Pills */}
          <div className="flex items-center gap-4">
            {[...quickFilters, ...groups.map(group => ({
              id: `group-${group.id}`,
              label: group.name,
              icon: '👥',
              isGroup: true,
              groupData: group
            }))].map((filterItem: {
              id: string;
              label: string;
              icon: string;
              isGroup: boolean;
              groupData?: {id: string, name: string, members: string[]};
            }) => (
              <div key={filterItem.id} className="relative group">
                <button
                  onClick={() => setFilter(filterItem.id as FilterType)}
                  className={`
                    px-4 py-2 rounded-full text-sm font-medium transition-all
                    ${filter === filterItem.id
                      ? 'bg-[#1E1E3F] text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                    }
                  `}
                >
                  {filterItem.icon} {filterItem.id.startsWith('group-') 
                    ? filterItem.label 
                    : filterItem.id.charAt(0).toUpperCase() + filterItem.id.slice(1).replace(/([A-Z])/g, ' $1')}
                </button>
                
                {filterItem.isGroup && (
                  <div className="absolute -top-2 -right-2 flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditGroup(filterItem.groupData!);
                      }}
                      className="w-5 h-5 bg-blue-500 text-white rounded-full 
                        opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      title="Edit group"
                    >
                      ✎
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteGroup(filterItem.id.replace('group-', ''));
                      }}
                      className="w-5 h-5 bg-red-500 text-white rounded-full 
                        opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      title="Delete group"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Search Bar */}
        <div className="bg-white rounded-3xl shadow-sm mb-4">
          <div className="p-4">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, company..."
                className="w-full px-4 py-3 pl-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E1E3F] focus:border-transparent transition-all"
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
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Table Section */}
        <div className="bg-white rounded-3xl shadow-sm">
          <div className="p-4 flex justify-end border-b border-gray-100">
            <ColumnCustomizer
              availableColumns={availableColumnsList}
              activeColumns={activeColumns}
              onColumnChange={(columns) => setActiveColumns(columns as ColumnKey[])}
              onAddColumn={handleAddColumn}
              onEditColumn={(key, newLabel) => {
                setCustomColumns(prev => prev.map(col => 
                  col.key === key ? { ...col, label: newLabel } : col
                ));
              }}
            />
          </div>

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
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredContacts.length / itemsPerPage)}
            onPageChange={(page) => setCurrentPage(page)}
            className="p-4 border-t border-gray-100"
          />
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
            queryClient.setQueryData(['contacts', session?.user?.email], updatedContacts);
            
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
            queryClient.setQueryData(['contacts', session?.user?.email], updatedContacts);
            
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