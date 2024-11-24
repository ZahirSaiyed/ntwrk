'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import ViewToggle from "@/components/ViewToggle";
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

type ColumnKey = keyof Contact | 'relationshipStrength';

type Column = {
  key: ColumnKey;
  label: string;
  description: string;
  render: (contact: Contact) => React.ReactNode;
};

export default function ContactsPage() {
  const { data: session } = useSession();
  const [view, setView] = useState<'grid' | 'table'>('grid');
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
  const [activeColumns, setActiveColumns] = useState([
    'name',
    'email',
    'lastContacted'
  ]);
  const [customColumns, setCustomColumns] = useState<Column[]>([]);

  const availableColumns = [
    {
      key: 'name',
      label: 'Name',
      description: 'Contact\'s full name',
      render: (contact: Contact) => contact.name
    },
    {
      key: 'email',
      label: 'Email',
      description: 'Primary email address',
      render: (contact: Contact) => contact.email
    },
    {
      key: 'lastContacted',
      label: 'Last Contacted',
      description: 'Most recent interaction date',
      render: (contact: Contact) => format(new Date(contact.lastContacted), 'MMM d, yyyy')
    },
    {
      key: 'company',
      label: 'Company',
      description: 'Current organization',
      render: (contact: Contact) => contact.company || '-'
    },
    {
      key: 'relationshipStrength',
      label: 'Relationship',
      description: 'Connection strength based on interaction frequency',
      render: (contact: Contact) => {
        const score = calculateVelocityScore(contact);
        return (
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              score.score > 80 ? 'bg-green-500' :
              score.score > 50 ? 'bg-blue-500' :
              'bg-yellow-500'
            }`} />
            {score.score > 80 ? 'Strong' :
             score.score > 50 ? 'Stable' :
             'Needs Attention'}
          </div>
        );
      }
    }
  ];

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

  const getFilteredContacts = (contacts: Contact[], searchTerm: string, activeFilter: FilterType) => {
    const sortedContacts = [...contacts].sort((a, b) => 
      new Date(b.lastContacted).getTime() - new Date(a.lastContacted).getTime()
    );
    
    return sortedContacts.filter(contact => {
      const matchesSearch = 
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      </div>
    );
  };

  const quickFilters = [
    { id: 'all', label: 'All', icon: '👥' },
    { id: 'active', label: 'Active', icon: '🔥' },
    { id: 'needsAttention', label: 'Needs Attention', icon: '⚡️' },
    { id: 'noReply', label: 'No Reply', icon: '🔕' }
  ];

  const handleAddColumn = (newColumn: { 
    key: string;
    label: string;
    render: (contact: Contact) => React.ReactNode;
    isCustom?: boolean;
  }) => {
    const customColumn: Column = {
      key: newColumn.key as ColumnKey,
      label: newColumn.label,
      description: `Custom column: ${newColumn.label}`,
      render: newColumn.render
    };
    setCustomColumns(prev => [...prev, customColumn]);
    setActiveColumns(prev => [...prev, newColumn.key as ColumnKey]);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#1E1E3F]">Your Network</h1>
            <p className="text-gray-600 mt-1">Manage and grow your professional relationships</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative w-full max-w-md">
              <SearchInput value={search} onChange={setSearch} />
            </div>
            <ExportButton contacts={contacts} />
          </div>
        </div>

        {/* Controls and Quick Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <ViewToggle view={view} onViewChange={setView} />
              <button 
                onClick={() => setShowGroupModal(true)}
                className="px-4 py-2 bg-[#1E1E3F] text-white rounded-full hover:bg-[#2D2D5F] transition-all flex items-center gap-2 shadow-sm hover:shadow-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Create Group</span>
              </button>
            </div>
            
            {/* Navigation to Smart Insights */}
            <Link 
              href="/insights"
              className="flex items-center gap-2 text-[#1E1E3F] hover:text-[#2D2D5F] transition-colors"
            >
              <span>Smart Insights</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Custom Group Filters */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {quickFilters.map(({ id, label, icon }) => (
                <button
                  key={id}
                  onClick={() => setFilter(id as FilterType)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-colors ${
                    filter === id
                      ? 'bg-[#1E1E3F] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {icon} {label}
                </button>
              ))}
            </div>

            {/* Groups Section */}
            <div className="flex flex-wrap items-center gap-2">
              {groups.map(group => (
                <div key={group.id} className="relative group">
                  <button
                    onClick={() => setFilter(`group-${group.id}`)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-colors ${
                      filter === `group-${group.id}`
                        ? 'bg-[#1E1E3F] text-white'
                        : 'bg-[#F4F4FF] text-[#1E1E3F] hover:bg-[#E4E4FF]'
                    }`}
                  >
                    👥 {group.name} ({group.members.length})
                  </button>
                  
                  {/* Action buttons container */}
                  <div className="absolute -top-2 -right-2 hidden group-hover:flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditGroup(group);
                      }}
                      className="h-5 w-5 flex items-center justify-center bg-[#1E1E3F] text-white rounded-full text-xs hover:bg-[#2D2D5F] shadow-sm"
                    >
                      ✎
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteGroup(group.id);
                      }}
                      className="h-5 w-5 flex items-center justify-center bg-red-500 text-white rounded-full text-xs hover:bg-red-600 shadow-sm"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Views */}
        <div className="bg-[#FAFAFA] rounded-3xl">
          {view === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {filteredContacts.map((contact) => (
                <div 
                  key={contact.email}
                  className="group bg-white rounded-2xl p-6 transition-all 
                            shadow-[0_2px_8px_0_rgba(0,0,0,0.04)] 
                            hover:shadow-[0_4px_16px_0_rgba(0,0,0,0.08)]
                            border border-gray-100/50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-lg text-[#1E1E3F] truncate">{contact.name}</h3>
                      <p className="text-gray-500 truncate">{contact.email}</p>
                      <div className="mt-3 flex items-center text-sm text-gray-400">
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Last contacted: {format(new Date(contact.lastContacted), 'MMM d, yyyy')}
                      </div>
                    </div>
                    <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-gray-50 rounded-full">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <div className="flex justify-end mb-4">
                <ColumnCustomizer
                  availableColumns={[...availableColumns, ...customColumns]}
                  activeColumns={activeColumns}
                  onColumnChange={setActiveColumns}
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
                onContactClick={(contact: Contact) => setSelectedContact(contact)}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                columns={[...availableColumns, ...customColumns].filter(col => activeColumns.includes(col.key))}
              />
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(filteredContacts.length / itemsPerPage)}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          )}
        </div>

        {selectedContact && (
          <ContactDetail
            contact={selectedContact}
            onClose={() => setSelectedContact(null)}
            onSave={(updatedContact) => {
              // Handle saving updated contact
              setSelectedContact(null);
            }}
          />
        )}
      </div>

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
    </div>
  );
}