'use client';

import AppLayout from '@/components/Layout/AppLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from "next-auth/react";
import { useEffect, useState, useMemo } from "react";
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

// interface Contact {
//   name: string;
//   email: string;
//   lastContacted: string;
// }

type FilterType = 'active' | 'noReply' | 'needsAttention' | 'all' | 'followup' | 'close' | `group-${string}`;

type SortConfig = {
  key: keyof Contact | null;
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
  label: string;
  value: string;
}

export default function ContactsPage() {
  const { data: session } = useSession();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groups, setGroups] = useState<Array<{id: string, name: string, members: string[]}>>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ 
    key: 'lastContacted', 
    direction: 'desc' 
  });
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [lastDeletedGroup, setLastDeletedGroup] = useState<{id: string, name: string, members: string[]} | null>(null);
  const [editingGroup, setEditingGroup] = useState<{id: string, name: string, members: string[]} | null>(null);
  const [activeColumns, setActiveColumns] = useState<ColumnKey[]>([
    'name',
    'email',
    'company',
    'lastContacted'
  ]);
  const [customColumns, setCustomColumns] = useState<Column[]>([]);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [availableColumnsList, setAvailableColumnsList] = useState<Column[]>([]);

  const { data: contacts = [], isLoading, error } = useQuery({
    queryKey: ['contacts', session?.user?.email],
    queryFn: async () => {
      const response = await fetch('/api/contacts');
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Contact fetch error:', errorData);
        throw new Error(errorData.error || 'Failed to fetch contacts');
      }
      return response.json();
    },
    enabled: !!session?.user?.email,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

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
    const sortedContacts = [...contacts].sort((a, b) => 
      new Date(b.lastContacted).getTime() - new Date(a.lastContacted).getTime()
    );
    
    return sortedContacts.filter(contact => {
      const matchesSearch = 
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase() === searchTerm.toLowerCase() ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;
      
      switch (activeFilter) {
        case 'active': {
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          const recentInteractions = contact.interactions.filter(i => 
            new Date(i.date) > thirtyDaysAgo
          ).length;
          return recentInteractions >= 4;
        }
        case 'needsAttention': {
          const velocity = calculateVelocityScore(contact);
          const lastInteraction = contact.interactions[contact.interactions.length - 1];
          return (
            (velocity?.trend === 'falling' && velocity.score < 40) ||
            (lastInteraction?.type === 'received' &&
             new Date(lastInteraction.date) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
          );
        }
        case 'noReply':
          return (
            contact.email.toLowerCase().includes('noreply') ||
            contact.email.toLowerCase().includes('no-reply') ||
            contact.email.toLowerCase().includes('no.reply') ||
            contact.email.toLowerCase().includes('donotreply') ||
            contact.email.toLowerCase().includes('newsletter') ||
            contact.email.toLowerCase().includes('marketing') ||
            contact.email.toLowerCase().includes('notifications') ||
            contact.email.toLowerCase().includes('updates') ||
            contact.email.toLowerCase().includes('mailer.') ||
            contact.email.toLowerCase().includes('mailchimp') ||
            contact.email.toLowerCase().includes('sendgrid') ||
            contact.email.toLowerCase().includes('campaign-') ||
            // All messages are received (never sent by us) and high frequency
            (contact.interactions.every(i => i.type === 'received') && 
             contact.interactions.length > 10)
          );
        default:
          if (activeFilter.startsWith('group-')) {
            const groupId = activeFilter.replace('group-', '');
            const group = groups.find(g => g.id === groupId);
            return group?.members.includes(contact.email) ?? false;
          }
          return true; // 'all' filter
      }
    });
  };

  const filteredContacts = getFilteredContacts(contacts, search, filter);

  const getSortedContacts = (contacts: Contact[]) => {
    if (!sortConfig.key) return contacts;
    
    return [...contacts].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];
      
      if (sortConfig.key === 'lastContacted') {
        const aDate = aValue as string;
        const bDate = bValue as string;
        return sortConfig.direction === 'asc' 
          ? new Date(aDate).getTime() - new Date(bDate).getTime()
          : new Date(bDate).getTime() - new Date(aDate).getTime();
      }
      
      return sortConfig.direction === 'asc'
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter]);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      router.push('/welcome');
    }
  }, [router]);

  useEffect(() => {
    if (contacts[0]?.customFields) {
      const customFieldKeys = contacts[0].customFields.map((field: CustomField) => 
        `custom_${field.label.toLowerCase().replace(/\s+/g, '_')}` as ColumnKey
      );
      
      // Only update if there are new fields not already in activeColumns
      const newFields = customFieldKeys.filter((key: string) => !activeColumns.includes(key as ColumnKey));
      if (newFields.length > 0) {
        setActiveColumns(prev => [...prev, ...(newFields as ColumnKey[])]);
      }
    }
  }, [contacts, activeColumns]);

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

  const QuickFilters = () => {
    const activeContacts = contacts.filter((contact: Contact) => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const recentInteractions = contact.interactions.filter(i => 
        new Date(i.date) > thirtyDaysAgo
      ).length;
      return recentInteractions >= 4;
    });

    const needsAttentionContacts = contacts.filter((contact: Contact) => {
      const velocity = calculateVelocityScore(contact);
      const lastInteraction = contact.interactions[contact.interactions.length - 1];
      return (
        (velocity?.trend === 'falling' && velocity.score < 40) ||
        (lastInteraction?.type === 'received' &&
         new Date(lastInteraction.date) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      );
    });

    const noReplyContacts = contacts.filter((contact: Contact) => {
      return (
        contact.interactions.length > 3 &&
        contact.interactions.every(i => i.type === 'sent') ||
        contact.email.toLowerCase().includes('noreply') ||
        contact.email.toLowerCase().includes('no-reply')
      );
    });

    return (
      <div className="flex flex-wrap gap-2">
        <button 
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            filter === 'active'
              ? 'bg-green-600 text-white'
              : 'bg-green-50 text-green-700 hover:bg-green-100'
          }`}
        >
          🔥 Active ({activeContacts.length})
        </button>
        <button 
          onClick={() => setFilter('needsAttention')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            filter === 'needsAttention'
              ? 'bg-yellow-600 text-white'
              : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
          }`}
        >
          ⚡️ Needs Attention ({needsAttentionContacts.length})
        </button>
        <button 
          onClick={() => setFilter('noReply')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            filter === 'noReply'
              ? 'bg-red-600 text-white'
              : 'bg-red-50 text-red-700 hover:bg-red-100'
          }`}
        >
          🔕 No Reply ({noReplyContacts.length})
        </button>
        {groups.map((group) => (
          <button 
            key={group.id}
            onClick={() => setFilter(`group-${group.id}`)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === `group-${group.id}`
                ? 'bg-[#1E1E3F] text-white'
                : 'bg-[#F4F4FF] text-[#1E1E3F] hover:bg-[#E4E4FF]'
            }`}
          >
            👥 {group.name}
          </button>
        ))}
      </div>
    );
  };

  const quickFilters = [
    { id: 'all', label: 'All', icon: '👥', isGroup: false },
    { id: 'active', label: 'Active', icon: '🔥', isGroup: false },
    { id: 'needsAttention', label: 'Needs Attention', icon: '⚡️', isGroup: false },
    { id: 'noReply', label: 'No Reply', icon: '🔕', isGroup: false }
  ];

  const handleAddColumn = (column: { 
    key: string; 
    label: string; 
    render: (contact: Contact) => React.ReactNode 
  }) => {
    const newColumn = {
      key: column.key as ColumnKey,
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
          id: column.key,
          label: column.label,
          value: ''
        }
      ]
    }));
    
    queryClient.setQueryData(['contacts', session?.user?.email], updatedContacts);
    
    setActiveColumns(prev => {
      if (prev.includes(column.key as ColumnKey)) return prev;
      return [...prev, column.key as ColumnKey];
    });
    
    setAvailableColumnsList(prev => {
      if (prev.some(col => col.key === column.key)) return prev;
      return [...prev, newColumn];
    });
  };

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
              <ExportButton contacts={contacts} />
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
            contacts={getSortedContacts(filteredContacts)}
            onContactClick={(contact: Contact) => setSelectedContact(contact)}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            columns={[...availableColumns, ...customColumns].filter(col => activeColumns.includes(col.key))}
            className="divide-y divide-gray-100"
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
    </AppLayout>
  );
}