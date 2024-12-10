import { Contact } from '@/types';
import { useState, useRef, useEffect } from 'react';
import { format, isValid, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import { useHotkeys } from 'react-hotkeys-hook';
import { useUndo } from '../hooks/useUndo';

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
  totalContacts: number;
  className?: string;
  sortConfig: {
    key: keyof Contact | `custom_${string}` | null;
    direction: 'asc' | 'desc';
  };
  onSort: (key: keyof Contact | `custom_${string}`) => void;
  onContactUpdate: (contact: Contact) => Promise<void>;
  showToast: (message: string, type: 'success' | 'error') => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

type Column = {
  key: string;
  label: string;
  render: (contact: Contact) => React.ReactNode;
};

const formatDate = (dateString: string) => {
  try {
    const date = parseISO(dateString);
    return isValid(date) ? format(date, 'MMM d, yyyy') : '-';
  } catch {
    return '-';
  }
};

interface EditableCellProps {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  type?: 'text' | 'email' | 'date';
}

const EditableCell = ({ value, onChange, onBlur, onKeyDown, type = 'text' }: EditableCellProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
    if (type !== 'date') {
      inputRef.current?.select();
    }
  }, [type]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative"
    >
      <input
        ref={inputRef}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur();
        }}
        onFocus={() => setIsFocused(true)}
        onKeyDown={onKeyDown}
        className={`
          w-full px-2 py-1 
          bg-white/50 backdrop-blur-sm
          border-2 border-transparent
          rounded-md shadow-sm
          transition-all duration-200
          focus:border-[#1E1E3F]/30 focus:bg-white
          hover:bg-white
          ${isFocused ? 'ring-2 ring-[#1E1E3F]/10' : ''}
        `}
      />
    </motion.div>
  );
};

interface TableState {
  selectedCells: Set<string>; // Format: "rowId:columnKey"
  copiedCells: Map<string, any>;
}

const ShortcutsGuide = () => (
  <div 
    className="mx-4 inline-flex
      bg-white/90 backdrop-blur-sm 
      px-4 py-2.5 rounded-lg
      items-center gap-4
      text-xs text-gray-600
      border border-gray-200
      whitespace-nowrap
      hover:bg-white
      transition-colors duration-150"
  >
    <div className="flex items-center gap-4 divide-x divide-gray-200">
      <div className="flex items-center gap-2">
        <kbd className="px-1.5 py-0.5 rounded bg-gray-100 font-mono">↵</kbd>
        <span>Edit</span>
      </div>
      <div className="flex items-center gap-2 pl-4">
        <kbd className="px-1.5 py-0.5 rounded bg-gray-100 font-mono">Esc</kbd>
        <span>Cancel</span>
      </div>
      <div className="flex items-center gap-2 pl-4">
        <div className="flex gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-gray-100 font-mono">←</kbd>
          <kbd className="px-1.5 py-0.5 rounded bg-gray-100 font-mono">→</kbd>
        </div>
        <span>Navigate</span>
      </div>
      <div className="flex items-center gap-2 pl-4">
        <div className="flex gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-gray-100 font-mono">⌘[</kbd>
          <kbd className="px-1.5 py-0.5 rounded bg-gray-100 font-mono">⌘]</kbd>
        </div>
        <span>Pages</span>
      </div>
    </div>
  </div>
);

const PageSizeControl = ({ 
  pageSize, 
  onPageSizeChange 
}: { 
  pageSize: number;
  onPageSizeChange: (size: number) => void;
}) => (
  <div className="flex items-center gap-3 text-sm text-gray-600">
    <span>Show</span>
    <select
      value={pageSize}
      onChange={(e) => onPageSizeChange(Number(e.target.value))}
      className={`
        px-3 py-1.5 
        bg-white/95 backdrop-blur-sm
        border border-gray-200/80
        rounded-lg shadow-sm 
        focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200
        hover:border-blue-200/50 hover:bg-white
        transition-all duration-200
        appearance-none
        bg-no-repeat
        bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2212%22%20height%3D%2212%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M3%205h6L6%209z%22%20fill%3D%22%236B7280%22%2F%3E%3C%2Fsvg%3E')] 
        bg-[position:right_8px_center]
        bg-[length:16px_16px]
        pr-8
      `}
    >
      <option value={5}>5</option>
      <option value={10}>10</option>
      <option value={25}>25</option>
      <option value={50}>50</option>
    </select>
    <span>rows per page</span>
  </div>
);

export default function ContactTable({
  contacts,
  columns,
  onContactClick,
  currentPage,
  itemsPerPage,
  className,
  sortConfig,
  onSort,
  onContactUpdate,
  showToast,
  onPageChange,
  onPageSizeChange,
  totalContacts,
}: ContactTableProps) {
  const safeColumns = columns?.length > 0 ? columns : [
    {
      key: 'name',
      label: 'Name',
      render: (contact: Contact) => contact.name || '-'
    }
  ];

  const [editingCell, setEditingCell] = useState<{
    contactId: string;
    field: string;
    value: string;
  } | null>(null);
  
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [lastSelectedRow, setLastSelectedRow] = useState<string | null>(null);
  const [focusedCell, setFocusedCell] = useState<{
    contactId: string;
    field: string;
  } | null>(null);

  const [state, setState] = useState<TableState>({
    selectedCells: new Set(),
    copiedCells: new Map()
  });
  
  const { past, present, future, undo, redo, saveState } = useUndo(contacts);

  // Hotkey setup for common actions
  useHotkeys('ctrl+c', () => handleCopy(), { enableOnFormTags: true });
  useHotkeys('ctrl+v', () => handlePaste(), { enableOnFormTags: true });
  useHotkeys('ctrl+z', () => undo(), { enableOnFormTags: true });
  useHotkeys('ctrl+y', () => redo(), { enableOnFormTags: true });
  useHotkeys('shift+space', () => handleSelectRow(), { enableOnFormTags: true });

  const handleDoubleClick = (contact: Contact, field: string) => {
    const value = contact[field as keyof Contact];
    
    let editValue = '';
    if (field === 'lastContacted') {
      const date = new Date(contact.lastContacted);
      editValue = date.toISOString().split('T')[0];
    } else if (field === 'email') {
      editValue = contact.email;
    } else {
      editValue = value?.toString() || '';
    }

    setEditingCell({
      contactId: contact.email,
      field,
      value: editValue
    });
  };

  const handleCellKeyDown = (e: React.KeyboardEvent, contact: Contact, field: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleDoubleClick(contact, field);
    }
  };

  const handleTableKeyDown = (e: React.KeyboardEvent, contact: Contact, field: string) => {
    if (!editingCell) {
      const currentRowIndex = contacts.findIndex(c => c.email === contact.email);
      const currentColIndex = safeColumns.findIndex(col => col.key === field);

      // Add page navigation shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'PageUp':
          case '[':
            e.preventDefault();
            if (currentPage > 1) {
              onPageChange(currentPage - 1);
            }
            break;
          case 'PageDown':
          case ']':
            e.preventDefault();
            if (currentPage * itemsPerPage < totalContacts) {
              onPageChange(currentPage + 1);
            }
            break;
        }
        return;
      }

      // Existing arrow key navigation...
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (currentRowIndex > 0) {
            const prevContact = contacts[currentRowIndex - 1];
            setFocusedCell({ contactId: prevContact.email, field });
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (currentRowIndex < contacts.length - 1) {
            const nextContact = contacts[currentRowIndex + 1];
            setFocusedCell({ contactId: nextContact.email, field });
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (currentColIndex > 0) {
            setFocusedCell({ contactId: contact.email, field: safeColumns[currentColIndex - 1].key });
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (currentColIndex < safeColumns.length - 1) {
            setFocusedCell({ contactId: contact.email, field: safeColumns[currentColIndex + 1].key });
          }
          break;
        case 'Enter':
          e.preventDefault();
          handleDoubleClick(contact, field);
          break;
      }
    }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent, contact: Contact) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      // Exit edit mode but maintain focus and cell selection
      setEditingCell(null);
      setFocusedCell({
        contactId: contact.email,
        field: editingCell?.field || ''
      });
      tableRef.current?.focus();
    }
    const currentRowIndex = contacts.findIndex(c => c.email === contact.email);
    const currentColIndex = safeColumns.findIndex(col => col.key === editingCell?.field);

    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (e.shiftKey) {
          // Move up
          handleSaveEdit();
          if (currentRowIndex > 0) {
            const prevContact = contacts[currentRowIndex - 1];
            setFocusedCell({ contactId: prevContact.email, field: editingCell?.field || '' });
            handleDoubleClick(prevContact, editingCell?.field || '');
          }
        } else {
          // Move down
          handleSaveEdit();
          if (currentRowIndex < contacts.length - 1) {
            const nextContact = contacts[currentRowIndex + 1];
            setFocusedCell({ contactId: nextContact.email, field: editingCell?.field || '' });
            handleDoubleClick(nextContact, editingCell?.field || '');
          }
        }
        break;
      case 'Tab':
        e.preventDefault();
        handleSaveEdit();
        if (e.shiftKey) {
          // Move left
          if (currentColIndex > 0) {
            setFocusedCell({ contactId: contact.email, field: safeColumns[currentColIndex - 1].key });
            handleDoubleClick(contact, safeColumns[currentColIndex - 1].key);
          } else if (currentRowIndex > 0) {
            // Move to end of previous row
            const prevContact = contacts[currentRowIndex - 1];
            setFocusedCell({ contactId: prevContact.email, field: safeColumns[safeColumns.length - 1].key });
            handleDoubleClick(prevContact, safeColumns[safeColumns.length - 1].key);
          }
        } else {
          // Move right
          if (currentColIndex < safeColumns.length - 1) {
            setFocusedCell({ contactId: contact.email, field: safeColumns[currentColIndex + 1].key });
            handleDoubleClick(contact, safeColumns[currentColIndex + 1].key);
          } else if (currentRowIndex < contacts.length - 1) {
            // Move to start of next row
            const nextContact = contacts[currentRowIndex + 1];
            setFocusedCell({ contactId: nextContact.email, field: safeColumns[0].key });
            handleDoubleClick(nextContact, safeColumns[0].key);
          }
        }
        break;
    }
  };

  const handleSaveEdit = async () => {
    if (!editingCell) return;
    
    const updatedContact = {
      ...contacts.find(c => c.email === editingCell.contactId)!,
      [editingCell.field]: editingCell.value
    };
    
    try {
      await onContactUpdate(updatedContact);
      
      // Just return to the same cell, maintaining focus
      setEditingCell(null);
      setFocusedCell({
        contactId: updatedContact.email,
        field: editingCell.field
      });
      tableRef.current?.focus();
    } catch (error) {
      showToast('Failed to update contact', 'error');
    }
  };

  const handleRowClick = (e: React.MouseEvent, contact: Contact) => {
    if (e.shiftKey && lastSelectedRow) {
      // Range selection
      const startIndex = contacts.findIndex(c => c.email === lastSelectedRow);
      const endIndex = contacts.findIndex(c => c.email === contact.email);
      const range = contacts.slice(
        Math.min(startIndex, endIndex),
        Math.max(startIndex, endIndex) + 1
      );
      setSelectedRows(new Set([...selectedRows, ...range.map(c => c.email)]));
    } else if (e.ctrlKey || e.metaKey) {
      // Toggle selection
      const newSelected = new Set(selectedRows);
      if (newSelected.has(contact.email)) {
        newSelected.delete(contact.email);
      } else {
        newSelected.add(contact.email);
      }
      setSelectedRows(newSelected);
    } else {
      // Single selection
      setSelectedRows(new Set([contact.email]));
    }
    setLastSelectedRow(contact.email);
  };

  // Calculate pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedContacts = contacts.slice(startIndex, startIndex + itemsPerPage);

  const renderCell = (contact: Contact, column: Column) => {
    if (column.key === 'lastContacted') {
      return formatDate(contact.lastContacted);
    }
    return column.render(contact);
  };

  // Add this to track focus state
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-focus the table on mount
    tableRef.current?.focus();
  }, []);

  const handleCopy = () => {
    const newCopiedCells = new Map();
    state.selectedCells.forEach(cellId => {
      const [contactId, field] = cellId.split(':');
      const contact = contacts.find(c => c.email === contactId);
      if (contact) {
        newCopiedCells.set(cellId, contact[field as keyof Contact]);
      }
    });
    setState(prev => ({ ...prev, copiedCells: newCopiedCells }));
    showToast('Copied to clipboard', 'success');
  };

  const handlePaste = async () => {
    if (state.copiedCells.size === 0) return;
    
    const updates = Array.from(state.selectedCells).map(cellId => {
      const [contactId, field] = cellId.split(':');
      const value = state.copiedCells.values().next().value;
      return {
        contactId,
        field,
        value
      };
    });

    try {
      // Batch update all changes
      await Promise.all(updates.map(update => 
        onContactUpdate({
          ...contacts.find(c => c.email === update.contactId)!,
          [update.field]: update.value
        })
      ));
      showToast('Changes applied', 'success');
    } catch (error) {
      showToast('Failed to apply changes', 'error');
    }
  };

  const handleSelectRow = () => {
    if (!focusedCell) return;
    
    const newSelected = new Set(state.selectedCells);
    safeColumns.forEach(column => {
      newSelected.add(`${focusedCell.contactId}:${column.key}`);
    });
    
    setState(prev => ({
      ...prev,
      selectedCells: newSelected
    }));
  };

  return (
    <div>
      <div className="flex justify-between items-center px-6 py-3 border-b bg-gray-50/50">
        <PageSizeControl 
          pageSize={itemsPerPage} 
          onPageSizeChange={onPageSizeChange} 
        />
        <div className="text-sm text-gray-600 flex items-center gap-2">
          <span>
            {`${startIndex + 1}-${Math.min(startIndex + itemsPerPage, totalContacts)} of ${totalContacts}`}
          </span>
        </div>
      </div>
      <div 
        ref={tableRef}
        className="relative overflow-x-auto outline-none focus:ring-2 focus:ring-blue-100 rounded-lg"
        tabIndex={0}
        onKeyDown={(e) => {
          // Always handle keyboard navigation if we have a focused cell
          if (focusedCell) {
            const contact = contacts.find(c => c.email === focusedCell.contactId);
            if (contact) {
              if (editingCell) {
                handleEditKeyDown(e, contact);
              } else {
                handleTableKeyDown(e, contact, focusedCell.field);
              }
            }
          }
        }}
      >
        <table className={`w-full ${className}`}>
          <thead>
            <tr className="bg-[#F4F4FF]">
              {safeColumns.map((column) => (
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
          <tbody>
            {paginatedContacts.map((contact) => (
              <motion.tr
                key={contact.email}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`hover:bg-gray-50 transition-colors
                  ${state.selectedCells.has(`${contact.email}:${safeColumns[0].key}`) ? 'bg-[#F4F4FF]' : ''}
                `}
              >
                {safeColumns.map((column) => (
                  <td
                    key={column.key}
                    className={`
                      px-6 py-4 text-sm text-gray-600
                      group relative cursor-text
                      transition-all duration-150
                      ${editingCell?.contactId === contact.email && editingCell?.field === column.key 
                        ? 'z-10' 
                        : ''}
                      ${focusedCell?.contactId === contact.email && focusedCell?.field === column.key 
                        ? 'outline outline-[1.5px] outline-blue-400/40 bg-blue-50/30' 
                        : 'hover:bg-gray-50'}
                    `}
                    onClick={(e) => {
                      e.preventDefault();
                      setFocusedCell({ contactId: contact.email, field: column.key });
                      tableRef.current?.focus();
                    }}
                    onDoubleClick={(e) => {
                      e.preventDefault();
                      handleDoubleClick(contact, column.key);
                    }}
                  >
                    {editingCell?.contactId === contact.email && editingCell?.field === column.key ? (
                      <motion.div
                        initial={{ scale: 0.98 }}
                        animate={{ scale: 1 }}
                        className="relative"
                      >
                        <EditableCell
                          value={editingCell.value}
                          onChange={(value) => setEditingCell({ ...editingCell, value })}
                          onBlur={handleSaveEdit}
                          onKeyDown={(e) => handleEditKeyDown(e, contact)}
                          type={column.key === 'lastContacted' ? 'date' : 'text'}
                        />
                      </motion.div>
                    ) : (
                      <div className="group/cell relative">
                        <span>{column.render(contact)}</span>
                      </div>
                    )}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>

        <ShortcutsGuide />
      </div>
    </div>
  );
}
