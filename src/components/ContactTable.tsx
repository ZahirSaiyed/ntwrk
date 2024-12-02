import { Contact } from '@/types';
import { useState } from 'react';

interface ContactTableProps {
  contacts: Contact[];
  columns: {
    key: string;
    label: string;
    render: (contact: Contact) => React.ReactNode;
  }[];
  onContactClick?: (contact: Contact) => void;
  currentPage: number;
  itemsPerPage: number;
  className?: string;
  sortConfig: {
    key: keyof Contact | `custom_${string}` | null;
    direction: 'asc' | 'desc';
  };
  onSort: (key: keyof Contact | `custom_${string}`) => void;
}

export default function ContactTable({
  contacts,
  columns,
  onContactClick,
  currentPage,
  itemsPerPage,
  className,
  sortConfig,
  onSort,
}: ContactTableProps) {
  // Calculate pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedContacts = contacts.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="overflow-x-auto">
      <table className={`w-full ${className}`}>
        <thead>
          <tr className="bg-[#F4F4FF]">
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-6 py-4 text-left text-sm font-medium text-gray-900 cursor-pointer group"
                onClick={() => onSort(column.key as keyof Contact | `custom_${string}`)}
              >
                <div className="flex items-center gap-2">
                  {column.label}
                  <span className="text-[#1E1E3F]">
                    {sortConfig.key === column.key ? (
                      sortConfig.direction === 'asc' ? '↑' : '↓'
                    ) : (
                      <span className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                        ↕
                      </span>
                    )}
                  </span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {paginatedContacts.map((contact) => (
            <tr
              key={contact.email}
              className="hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onContactClick?.(contact)}
            >
              {columns.map((column) => (
                <td key={column.key} className="px-6 py-4 text-sm text-gray-600">
                  {column.render(contact)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
