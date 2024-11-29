import { Contact } from '@/types';
import { format } from 'date-fns';

interface ContactTableProps {
  contacts: Contact[];
  columns: Column[];
  className?: string;
  onContactClick?: (contact: Contact) => void;
  sortConfig?: {
    key: keyof Contact | null;
    direction: 'asc' | 'desc';
  };
  onSort?: (key: keyof Contact) => void;
  currentPage: number;
  itemsPerPage: number;
}

interface Column {
  key: keyof Contact | 'relationshipStrength' | string;
  label: string;
  render: (contact: Contact) => React.ReactNode;
  isCustom?: boolean;
}

export default function ContactTable({ 
  contacts,
  columns,
  onContactClick,
  sortConfig,
  onSort,
  currentPage,
  itemsPerPage,
  className
}: ContactTableProps) {
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
                className="px-6 py-4 text-left text-sm font-semibold text-[#1E1E3F]"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {paginatedContacts.map((contact, idx) => (
            <tr 
              key={contact.email}
              className={`
                hover:bg-gray-50 cursor-pointer transition-colors
                ${idx % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'}
              `}
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
