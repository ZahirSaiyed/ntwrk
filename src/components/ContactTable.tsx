import { Contact } from '@/types';
import { format } from 'date-fns';

interface ContactTableProps {
  contacts: Contact[];
  columns: Column[];
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
  itemsPerPage
}: ContactTableProps) {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedContacts = contacts.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map(column => (
              <th 
                key={column.key}
                onClick={() => {
                  if (!column.isCustom && onSort) {
                    onSort(column.key as keyof Contact);
                  }
                }}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 
                         uppercase tracking-wider cursor-pointer"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {paginatedContacts.map((contact) => (
            <tr 
              key={contact.email}
              onClick={() => onContactClick?.(contact)}
              className="hover:bg-gray-50 cursor-pointer"
            >
              {columns.map(column => (
                <td key={column.key} className="px-6 py-4 whitespace-nowrap">
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
