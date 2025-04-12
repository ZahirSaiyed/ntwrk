import { Contact } from '@/types';
import { useState, useRef, useEffect } from 'react';
import { format, isValid, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useHotkeys } from 'react-hotkeys-hook';
import { useUndo } from '../hooks/useUndo';
import Pagination from './Pagination';

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
          border border-transparent
          rounded-md shadow-sm
          transition-all duration-200
          focus:ring-2 focus:ring-[#1E1E3F]/20 focus:border-[#1E1E3F]/30 focus:bg-white
          hover:bg-white
        `}
      />
    </motion.div>
  );
};

interface TableState {
  selectedCells: Set<string>; // Format: "rowId:columnKey"
  copiedCells: Map<string, any>;
}

// ProTip component aligned with design system
function ProTipBadge({ visible, onDismiss }: { visible: boolean; onDismiss: () => void }) {
  if (!visible) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#F4F4FF] border border-[#1E1E3F]/10 rounded-full text-xs text-[#1E1E3F] shadow-sm"
    >
      <span className="font-medium">Pro Tip</span>
      <span>Use keyboard to navigate</span>
      <button 
        onClick={onDismiss}
        className="ml-1 p-0.5 hover:bg-[#1E1E3F]/10 rounded-full transition-colors duration-200"
        aria-label="Dismiss pro tip"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </motion.div>
  );
}

// ShortcutsGuide component aligned with design system
function ShortcutsGuide({ visible, isKeyboardActive }: { visible: boolean, isKeyboardActive: boolean }) {
  if (!visible) return null;
  
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ 
            type: "spring", 
            stiffness: 400, 
            damping: 30 
          }}
          className="fixed bottom-4 right-4 max-w-sm bg-[#1E1E3F] shadow-lg rounded-lg overflow-hidden z-50"
        >
          <div className="px-4 py-3 bg-[#1E1E3F] text-white flex justify-between items-center border-b border-white/10">
            <h3 className="text-sm font-medium">Keyboard shortcuts</h3>
            <button
              onClick={() => {
                // Close logic (should be passed as prop)
                const event = new CustomEvent('toggleShortcutsGuide', { detail: { visible: false } });
                document.dispatchEvent(event);
              }}
              className="text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors duration-200"
              aria-label="Close shortcuts guide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          <div className="px-4 py-3 bg-[#1E1E3F] text-white space-y-3">
            {/* Primary shortcuts - always visible */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Select row</span>
                <div className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-[#1E1E3F]/80 border border-white/20 rounded text-xs">Click</kbd>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Edit cell</span>
                <div className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-[#1E1E3F]/80 border border-white/20 rounded text-xs">Double-click</kbd>
                </div>
              </div>
            </div>
            
            {/* Navigation shortcuts - only visible when keyboard is active */}
            <AnimatePresence>
              {isKeyboardActive && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="pt-2 border-t border-white/10 space-y-2"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span>Navigate rows</span>
                    <div className="flex items-center gap-1">
                      <kbd className="px-2 py-1 bg-[#1E1E3F]/80 border border-white/20 rounded text-xs">↑</kbd>
                      <kbd className="px-2 py-1 bg-[#1E1E3F]/80 border border-white/20 rounded text-xs">↓</kbd>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Navigate pages</span>
                    <div className="flex items-center gap-1">
                      <kbd className="px-2 py-1 bg-[#1E1E3F]/80 border border-white/20 rounded text-xs">PgUp</kbd>
                      <kbd className="px-2 py-1 bg-[#1E1E3F]/80 border border-white/20 rounded text-xs">PgDn</kbd>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>First/Last page</span>
                    <div className="flex items-center gap-1">
                      <kbd className="px-2 py-1 bg-[#1E1E3F]/80 border border-white/20 rounded text-xs">Home</kbd>
                      <kbd className="px-2 py-1 bg-[#1E1E3F]/80 border border-white/20 rounded text-xs">End</kbd>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="px-4 py-2 bg-[#1E1E3F]/90 border-t border-white/10 flex justify-between items-center">
            <span className="text-xs text-white/70">Press any key to see more shortcuts</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const PageSizeControl = ({ 
  pageSize, 
  onPageSizeChange,
  showKeyboardTip = true,
  onDismissTip
}: { 
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  showKeyboardTip?: boolean;
  onDismissTip: () => void;
}) => {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center">
        <span className="text-sm text-gray-500 mr-2">Items per page</span>
        <select
          className="block w-16 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#1E1E3F]"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          aria-label="Items per page"
        >
          {[10, 25, 50, 100].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
      
      {showKeyboardTip && (
        <AnimatePresence>
          <ProTipBadge visible={showKeyboardTip} onDismiss={onDismissTip} />
        </AnimatePresence>
      )}
    </div>
  );
};

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

  const [showKeyboardTip, setShowKeyboardTip] = useState(() => {
    return !localStorage.getItem('hasSeenTableKeyboardTip');
  });
  
  const [isKeyboardActive, setIsKeyboardActive] = useState(false);
  const [showShortcutsGuide, setShowShortcutsGuide] = useState(false);
  
  // Auto-dismiss the Pro Tip after 5 seconds
  useEffect(() => {
    if (showKeyboardTip) {
      const timer = setTimeout(() => {
        dismissKeyboardTip();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showKeyboardTip]);
  
  // Toggle shortcuts guide when keyboard navigation is active
  useEffect(() => {
    if (isKeyboardActive) {
      setShowShortcutsGuide(true);
    } else {
      // Hide shortcuts guide after a delay when keyboard nav is inactive
      const timer = setTimeout(() => {
        setShowShortcutsGuide(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isKeyboardActive]);
  
  const dismissKeyboardTip = () => {
    setShowKeyboardTip(false);
    localStorage.setItem('hasSeenTableKeyboardTip', 'true');
  };

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
    // Mark keyboard as active when navigation keys are used
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
      setIsKeyboardActive(true);
    }
    
    const columnIndex = safeColumns.findIndex(col => col.key === field);
    const contactIndex = paginatedContacts.findIndex(c => c.email === contact.email);
    
    // Handle keyboard navigation based on key press
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        // Move to previous row in the same column
        if (contactIndex > 0) {
          const prevContact = paginatedContacts[contactIndex - 1];
          setFocusedCell({
            contactId: prevContact.email,
            field
          });
        }
        // If at first row and not first page, go to previous page
        else if (currentPage > 1 && contactIndex === 0) {
          onPageChange(currentPage - 1);
          // Focus will be set on the last row after page change
          setTimeout(() => {
            // We can't access the new page's contacts immediately, so we'll focus on the first item
            // on the next render cycle
            setFocusedCell(null);
            tableRef.current?.focus();
          }, 100);
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        // Move to next row in the same column
        if (contactIndex < paginatedContacts.length - 1) {
          const nextContact = paginatedContacts[contactIndex + 1];
          setFocusedCell({
            contactId: nextContact.email,
            field
          });
        } 
        // If at last row and not last page, go to next page
        else if (currentPage < Math.ceil(totalContacts / itemsPerPage) && contactIndex === paginatedContacts.length - 1) {
          onPageChange(currentPage + 1);
          // Focus will be set on the first row after page change
          setTimeout(() => {
            // We can't access the new page's contacts immediately, so we'll focus on the first item
            // on the next render cycle
            setFocusedCell(null);
            tableRef.current?.focus();
          }, 100);
        }
        break;

      case 'ArrowLeft':
        e.preventDefault();
        // Move to previous column in the same row
        if (columnIndex > 0) {
          setFocusedCell({
            contactId: contact.email,
            field: safeColumns[columnIndex - 1].key
          });
        }
        break;

      case 'ArrowRight':
        e.preventDefault();
        // Move to next column in the same row
        if (columnIndex < safeColumns.length - 1) {
          setFocusedCell({
            contactId: contact.email,
            field: safeColumns[columnIndex + 1].key
          });
        }
        break;

      case 'Home':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          // Go to first page, first row, first column
          if (currentPage !== 1) {
            onPageChange(1);
            // Focus will be handled after page change
          } else if (paginatedContacts.length > 0) {
            // Already on first page, just focus first item
            setFocusedCell({
              contactId: paginatedContacts[0].email,
              field: safeColumns[0].key
            });
          }
        } else {
          e.preventDefault();
          // Go to first column of current row
          setFocusedCell({
            contactId: contact.email,
            field: safeColumns[0].key
          });
        }
        break;
        
      case 'End':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          // Go to last page, last row, last column
          const lastPage = Math.ceil(totalContacts / itemsPerPage);
          if (currentPage !== lastPage) {
            onPageChange(lastPage);
            // Focus will be handled after page change
          } else if (paginatedContacts.length > 0) {
            // Already on last page, just focus last item
            setFocusedCell({
              contactId: paginatedContacts[paginatedContacts.length - 1].email,
              field: safeColumns[safeColumns.length - 1].key
            });
          }
        } else {
          e.preventDefault();
          // Go to last column of current row
          setFocusedCell({
            contactId: contact.email,
            field: safeColumns[safeColumns.length - 1].key
          });
        }
        break;

      case 'Enter':
        e.preventDefault();
        // Edit the current cell
        handleDoubleClick(contact, field);
        break;

      case 'Escape':
        e.preventDefault();
        // Clear focus
        setFocusedCell(null);
        tableRef.current?.focus();
        break;

      // Handle copy-paste shortcuts
      case 'c':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          handleCopy();
        }
        break;

      case 'v':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          handlePaste();
        }
        break;

      // Rest of the key handlers...
      // ... existing code ...
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
    const currentRowIndex = paginatedContacts.findIndex(c => c.email === contact.email);
    const currentColIndex = safeColumns.findIndex(col => col.key === editingCell?.field);

    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (e.shiftKey) {
          // Move up
          handleSaveEdit();
          if (currentRowIndex > 0) {
            const prevContact = paginatedContacts[currentRowIndex - 1];
            setFocusedCell({ contactId: prevContact.email, field: editingCell?.field || '' });
            handleDoubleClick(prevContact, editingCell?.field || '');
          }
        } else {
          // Move down
          handleSaveEdit();
          if (currentRowIndex < paginatedContacts.length - 1) {
            const nextContact = paginatedContacts[currentRowIndex + 1];
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
            const prevContact = paginatedContacts[currentRowIndex - 1];
            setFocusedCell({ contactId: prevContact.email, field: safeColumns[safeColumns.length - 1].key });
            handleDoubleClick(prevContact, safeColumns[safeColumns.length - 1].key);
          }
        } else {
          // Move right
          if (currentColIndex < safeColumns.length - 1) {
            setFocusedCell({ contactId: contact.email, field: safeColumns[currentColIndex + 1].key });
            handleDoubleClick(contact, safeColumns[currentColIndex + 1].key);
          } else if (currentRowIndex < paginatedContacts.length - 1) {
            // Move to start of next row
            const nextContact = paginatedContacts[currentRowIndex + 1];
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
      ...paginatedContacts.find(c => c.email === editingCell.contactId)!,
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
      const startIndex = paginatedContacts.findIndex(c => c.email === lastSelectedRow);
      const endIndex = paginatedContacts.findIndex(c => c.email === contact.email);
      const range = paginatedContacts.slice(
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
      const contact = paginatedContacts.find(c => c.email === contactId);
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
          ...paginatedContacts.find(c => c.email === update.contactId)!,
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

  // Detect mouse interaction to toggle keyboard mode off
  const handleMouseInteraction = () => {
    setIsKeyboardActive(false);
  };

  return (
    <div className="relative" onClick={handleMouseInteraction}>
      <div 
        ref={tableRef}
        className="relative overflow-x-auto outline-none focus:ring-2 focus:ring-[#1E1E3F]/20 rounded-lg"
        tabIndex={0}
        onKeyDown={(e) => {
          // Activate keyboard mode on tab or arrow keys
          if (['Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            setIsKeyboardActive(true);
          }
          
          // Global table keyboard handlers
          if (e.key === 'Tab' && !e.shiftKey) {
            if (!focusedCell && paginatedContacts.length > 0) {
              e.preventDefault();
              // Set focus on the first cell if nothing is focused
              setFocusedCell({
                contactId: paginatedContacts[0].email,
                field: safeColumns[0].key
              });
            }
          }
          
          // Always handle keyboard navigation if we have a focused cell
          if (focusedCell) {
            const contact = paginatedContacts.find(c => c.email === focusedCell.contactId);
            if (contact) {
              if (editingCell) {
                handleEditKeyDown(e, contact);
              } else {
                handleTableKeyDown(e, contact, focusedCell.field);
              }
            }
          }
        }}
        aria-label="Contacts table"
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
                whileHover={{ backgroundColor: 'rgba(244, 244, 255, 0.3)' }}
                className={`
                  transition-colors duration-150 min-h-[44px]
                  ${selectedRows.has(contact.email) ? 'bg-[#F4F4FF]/50' : ''}
                `}
              >
                {safeColumns.map((column) => (
                  <td
                    key={column.key}
                    className={`
                      px-6 py-3 text-sm text-gray-600
                      group relative cursor-text
                      transition-all duration-150
                      ${editingCell?.contactId === contact.email && editingCell?.field === column.key 
                        ? 'z-10' 
                        : ''}
                      ${focusedCell?.contactId === contact.email && focusedCell?.field === column.key 
                        ? 'ring-2 ring-[#1E1E3F]/20 bg-[#F4F4FF]/20' 
                        : ''}
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
      </div>
      
      {/* Add Pagination component at the bottom */}
      <Pagination 
        currentPage={currentPage}
        totalPages={Math.ceil(totalContacts / itemsPerPage)}
        onPageChange={onPageChange}
        itemsPerPage={itemsPerPage}
        totalItems={totalContacts}
        onPageSizeChange={onPageSizeChange}
        showKeyboardHint={showKeyboardTip}
        className="border-t border-gray-100"
      />
      
      {/* Keyboard shortcuts guide - only visible when keyboard navigation is active */}
      <ShortcutsGuide visible={showShortcutsGuide} isKeyboardActive={isKeyboardActive} />
    </div>
  );
}
