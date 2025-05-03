import { Contact } from '@/types';
import { useState, useRef, useEffect, useCallback } from 'react';
import { format, parseISO } from 'date-fns';

interface ExportButtonProps {
  contacts: Contact[];
  className?: string;
  groupName?: string;
}

export default function ExportButton({ contacts, className = '', groupName }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatContactsForCSV = (contacts: Contact[]) => {
    const headers = ['Name', 'Email', 'Company', 'Last Emailed', 'Relationship Score', 'Response Rate'];
    
    const rows = contacts.map(contact => [
      contact.name,
      contact.email,
      contact.company || '',
      format(parseISO(contact.lastContacted), 'yyyy-MM-dd'),
      contact.relationshipStrength?.score ? `${contact.relationshipStrength.score}/100` : 'N/A',
      contact.velocity?.interactionMetrics?.responseRate ? 
        `${Math.round(contact.velocity.interactionMetrics.responseRate * 100)}%` : 'N/A'
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
  };

  const formatContactsForJSON = (contacts: Contact[]) => {
    return JSON.stringify(contacts, null, 2);
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  const handleExportCSV = () => {
    const csvContent = formatContactsForCSV(contacts);
    downloadFile(csvContent, `${groupName || 'Contacts'}-${format(new Date(), 'yyyy-MM-dd')}.csv`, 'text/csv');
  };

  const handleExportJSON = () => {
    const jsonContent = formatContactsForJSON(contacts);
    downloadFile(jsonContent, 'contacts.json', 'application/json');
  };

  const handleExport = useCallback(() => {
    if (!contacts || contacts.length === 0) return;

    const headers = ['Name', 'Email', 'Company', 'Last Emailed', 'Relationship Score', 'Response Rate'];

    const data = contacts.map(contact => {
      // Format the data row
      return [
        contact.name,
        contact.email,
        contact.company || '',
        format(parseISO(contact.lastContacted), 'yyyy-MM-dd'), // Format date as ISO string
        contact.relationshipStrength?.score ? `${contact.relationshipStrength.score}/100` : 'N/A',
        contact.velocity?.interactionMetrics?.responseRate ? 
          `${Math.round(contact.velocity.interactionMetrics.responseRate * 100)}%` : 'N/A'
      ];
    });

    // Add headers as the first row
    const csvContent = [headers, ...data].map(e => e.join(',')).join('\n');

    // Create a CSV file and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${groupName || 'Contacts'}-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [contacts, groupName]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E1E3F] ${className}`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Export
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="py-1" role="menu">
            <button
              onClick={handleExportCSV}
              className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              Export as CSV
            </button>
            <button
              onClick={handleExportJSON}
              className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              Export as JSON
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
