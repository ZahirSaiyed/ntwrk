'use client';

export const dynamic = 'force-dynamic'

import AppLayout from '@/components/Layout/AppLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession, signOut } from "next-auth/react";
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
import { useRouter } from 'next/navigation';
import OnboardingPrompt from '@/components/OnboardingPrompt';
import InboxCleanupAssistant from '@/components/insights/InboxCleanupAssistant';
import GroupExportModal from '@/components/GroupExportModal';
import NetworkScore from '@/components/insights/NetworkScore';
import ImportModal from '@/components/ImportModal';
import { toast } from 'react-hot-toast';
import { EmailCopyButton } from '@/components/EmailCopyButton';
import { useHotkeys } from 'react-hotkeys-hook';

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
  console.log('🚀 ContactsPage mounted');
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth');
    },
  });
  console.log('🔑 Session state:', {
    status,
    hasEmail: !!session?.user?.email,
    accessToken: !!session?.accessToken,
    email: session?.user?.email
  });
  const queryClient = useQueryClient();

  // Add effect to handle session changes
  useEffect(() => {
    console.log('👤 Session effect triggered:', {
      status,
      hasAccessToken: !!session?.accessToken
    });
    
    if (status === 'loading') {
      console.log('⏳ Session loading...');
      return;
    }
    
    // if (status === 'unauthenticated' as const) {
    //   console.log('🚫 User not authenticated, redirecting to auth...');
    //   router.push('/auth');
    //   return;
    // }
    
    if (status === 'authenticated' && session?.accessToken) {
      console.log('✅ User authenticated, invalidating queries...');
      queryClient.invalidateQueries({ queryKey: ['contacts', session.user?.email] });
    }
  }, [status, session, router, queryClient]);

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
    'industry',
    'lastContacted'
  ]);
  const [customColumns, setCustomColumns] = useState<Column[]>([]);
  const [availableColumnsList, setAvailableColumnsList] = useState<Column[]>([]);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showCleanupAssistant, setShowCleanupAssistant] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);
  const [spamEmails, setSpamEmails] = useState<Set<string>>(new Set());

  // Add state for industry loading
  const [loadingIndustries, setLoadingIndustries] = useState<Set<string>>(new Set());

  const importContactsMutation = useMutation({
    mutationFn: importContactsFunction,
    onSuccess: (data) => {
      setShowOnboarding(true);
    }
  });

  const { data: contacts = [], isLoading, error } = useQuery({
    queryKey: ['contacts', session?.user?.email],
    queryFn: async () => {
      console.log('🔍 Fetching contacts...');
      if (!session?.accessToken) {
        console.log('❌ No access token available');
        throw new Error('No access token available');
      }
      
      const response = await fetch('/api/contacts');
      const data = await response.json();
      console.log('📦 Fetch response:', {
        status: response.status,
        ok: response.ok,
        dataLength: Array.isArray(data) ? data.length : 'not an array',
        data: data
      });
      
      if (!response.ok) {
        if (data.code === 'AUTH_REQUIRED') {
          console.log('🔒 Auth required, redirecting...');
          signOut({ redirect: false });
          router.push('/auth');
          throw new Error('Authentication required');
        }
        throw new Error(data.error || 'Failed to fetch contacts');
      }
      return data;
    },
    enabled: status === 'authenticated' && !!session?.user?.email && !!session?.accessToken,
    retry: 1,
  });

  if (error) {
    console.error('ContactsPage - Query error:', error);
  }

  // Filter out spam contacts for display
  const displayContacts = useMemo(() => {
    const filtered = (contacts || []).filter((contact: Contact) => 
      !(contact as ContactWithSpam).isSpam && 
      !spamEmails.has(contact.email)
    );
    console.log('🎯 Display contacts:', {
      originalLength: contacts.length,
      filteredLength: filtered.length,
      spamCount: spamEmails.size
    });
    return filtered;
  }, [contacts, spamEmails]);

  // Listen for industry updates
  useEffect(() => {
    const channel = new BroadcastChannel('contact-updates');
    
    channel.onmessage = (event) => {
      if (event.data.type === 'INDUSTRY_UPDATE') {
        const { email, industry } = event.data;
        
        // Update the contact's industry
        queryClient.setQueryData(['contacts', session?.user?.email], (oldData: Contact[] | undefined) => {
          if (!oldData) return oldData;
          
          return oldData.map(contact => 
            contact.email === email 
              ? { ...contact, industry }
              : contact
          );
        });

        // Remove from loading state
        setLoadingIndustries(prev => {
          const next = new Set(prev);
          next.delete(email);
          return next;
        });
      }
    };

    return () => channel.close();
  }, [queryClient, session?.user?.email]);

  // Update the columns definition to show loading state
  useEffect(() => {
    if (contacts?.length) {
      const columns = [
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
        {
          key: 'industry' as ColumnKey,
          label: 'Industry',
          description: 'Company industry',
          render: (contact: Contact) => {
            if (loadingIndustries.has(contact.email)) {
              return (
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 border-2 border-gray-300 border-t-[#1E1E3F] rounded-full animate-spin"></div>
                  <span className="text-gray-400">Detecting...</span>
                </div>
              );
            }
            return contact.industry || '-';
          }
        },
      ];

      // Add custom fields if they exist
      const firstContactWithFields = contacts.find((contact: Contact) => 
        contact.customFields && contact.customFields.length > 0
      );

      if (firstContactWithFields?.customFields) {
        const customFields = firstContactWithFields.customFields.map((field: CustomField) => ({
          key: `custom_${field.label.toLowerCase().replace(/\s+/g, '_')}` as ColumnKey,
          label: field.label,
          description: `Custom field: ${field.label}`,
          render: (contact: Contact) => {
            const customField = contact.customFields?.find(f => 
              f.label.toLowerCase().replace(/\s+/g, '_') === field.label.toLowerCase().replace(/\s+/g, '_')
            );
            return customField?.value || '-';
          }
        }));
        
        columns.push(...customFields);
      }

      setAvailableColumnsList(columns);
    }
  }, [contacts, loadingIndustries]);

  useEffect(() => {
    if (contacts?.length) {
      const customFieldKeys = contacts[0]?.customFields?.map((field: CustomField) => 
        `custom_${field.label.toLowerCase().replace(/\s+/g, '_')}` as ColumnKey
      ) || [];

      if (customFieldKeys.length > 0) {
        setActiveColumns(prev => {
          const newFields = customFieldKeys.filter((key: ColumnKey) => !prev.includes(key));
          return newFields.length > 0 ? [...prev, ...newFields] : prev;
        });
      }
    }
  }, [contacts]);

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
    // Start with the passed contacts array
    let filteredResults = [...contacts];
    
    // Apply search filter
    if (searchTerm) {
      const searchTerms = searchTerm.toLowerCase().split(' ');
      filteredResults = filteredResults.filter((contact: Contact) => 
        searchTerms.every(term =>
          contact.name.toLowerCase().includes(term) ||
          contact.email.toLowerCase().includes(term) ||
          (contact.company && contact.company.toLowerCase().includes(term)) ||
          (contact.industry && contact.industry.toLowerCase().includes(term)) ||
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
      filteredResults = filteredResults.filter((contact: Contact) => 
        group?.members.includes(contact.email) ?? false
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      filteredResults.sort((a: Contact, b: Contact) => {
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

  const filteredContacts = useMemo(() => 
    getFilteredContacts(displayContacts, search, filter),
    [displayContacts, search, filter, groups, sortConfig]
  );

  // Get paginated contacts - simplified and fixed
  const paginatedContacts = useMemo(() => {
    console.log('🔢 Calculating pagination:', {
      totalContacts: contacts?.length || 0,
      filteredCount: filteredContacts.length,
      currentPage,
      itemsPerPage,
      startIndex: (currentPage - 1) * itemsPerPage,
      endIndex: currentPage * itemsPerPage,
    });

    // Ensure currentPage is valid
    const maxPage = Math.max(1, Math.ceil(filteredContacts.length / itemsPerPage));
    const validPage = Math.min(currentPage, maxPage);
    if (validPage !== currentPage) {
      console.log('📝 Correcting page number:', { from: currentPage, to: validPage });
      setCurrentPage(validPage);
      return [];
    }

    const start = (validPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const slicedContacts = filteredContacts.slice(start, end);

    console.log('📑 Pagination result:', {
      start,
      end,
      pageSize: slicedContacts.length,
      firstEmail: slicedContacts[0]?.email,
      lastEmail: slicedContacts[slicedContacts.length - 1]?.email
    });

    return slicedContacts;
  }, [filteredContacts, currentPage, itemsPerPage, contacts?.length]);

  const handleSort = (key: keyof Contact | CustomColumnKey) => {
    setSortConfig(prevConfig => {
      const isSameKey = prevConfig.key === key;
      return {
        key,
        direction: isSameKey && prevConfig.direction === 'asc' ? 'desc' : 'asc'
      };
    });
  };

  // Reset to first page when filter changes or contacts are marked as spam
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter, spamEmails]);

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
      
      return [...nonSpamContacts, ...uniqueNewContacts];
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

  // Add global keyboard shortcuts for page navigation
  useHotkeys('meta+[', (e) => {
    e.preventDefault();
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, { enableOnFormTags: true });

  useHotkeys('meta+]', (e) => {
    e.preventDefault();
    if (currentPage * itemsPerPage < filteredContacts.length) {
      setCurrentPage(currentPage + 1);
    }
  }, { enableOnFormTags: true });

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

  // Debug logs
  console.log('Pagination Debug:', {
    totalContacts: contacts.length,
    displayContactsLength: displayContacts.length,
    filteredContactsLength: filteredContacts.length,
    currentPage,
    itemsPerPage,
    paginatedContactsLength: paginatedContacts.length,
    spamEmailsCount: spamEmails.size,
    searchTerm: search,
    activeFilter: filter
  });

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
    setShowCleanupAssistant(true);
  };

  const handleSkipOnboarding = () => {
    setShowOnboarding(false);
    // Optionally, set a flag in localStorage or user settings to not show again
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
            contacts={paginatedContacts}
            currentGroup={currentGroup}
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
            onPageChange={setCurrentPage}
            onPageSizeChange={setItemsPerPage}
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
            // Update local spam state
            setSpamEmails(prev => new Set([...prev, ...emails]));
            
            // Update contacts in the cache
            const updatedContacts = contacts.map((contact: Contact) => ({
              ...contact,
              isSpam: emails.includes(contact.email)
            } as ContactWithSpam));
            queryClient.setQueryData(['contacts', session?.user?.email], updatedContacts);
          }}
          onUndo={(email) => {
            // Remove from spam emails set
            setSpamEmails(prev => {
              const next = new Set(prev);
              next.delete(email);
              return next;
            });
            
            // Update contact in cache
            const updatedContacts = contacts.map((contact: Contact) => ({
              ...contact,
              isSpam: contact.email === email ? false : (contact as ContactWithSpam).isSpam
            } as ContactWithSpam));
            queryClient.setQueryData(['contacts', session?.user?.email], updatedContacts);
          }}
          onExcludeFromAnalytics={(exclude) => {
            // Update analytics settings in user preferences
            fetch('/api/user/preferences', {
              method: 'PATCH',
              body: JSON.stringify({ excludeFromAnalytics: exclude })
            });
          }}
          onClose={() => setShowCleanupAssistant(false)}
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