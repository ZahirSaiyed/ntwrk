import { useState } from 'react';
import { Contact } from '@/types';

interface Props {
  availableColumns: Array<{
    key: string;
    label: string;
    description?: string;
    isCustom?: boolean;
  }>;
  activeColumns: string[];
  onColumnChange: (columns: string[]) => void;
  onAddColumn: (column: { 
    key: string; 
    label: string; 
    isCustom?: boolean; 
    render: (contact: Contact) => React.ReactNode 
  }) => void;
  onEditColumn?: (key: string, newLabel: string) => void;
}

export default function ColumnCustomizer({ 
  availableColumns, 
  activeColumns, 
  onColumnChange, 
  onAddColumn,
  onEditColumn 
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [showNewColumnModal, setShowNewColumnModal] = useState(false);
  const [newColumn, setNewColumn] = useState({ key: '', label: '' });
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');

  const handleAddColumn = () => {
    if (!newColumn.key || !newColumn.label) return;
    
    onAddColumn({
      key: newColumn.key,
      label: newColumn.label,
      isCustom: true,
      render: (contact: Contact) => {
        return contact.customFields?.find(f => f.label === newColumn.label)?.value || '-';
      }
    });
    
    setNewColumn({ key: '', label: '' });
    setShowNewColumnModal(false);
  };

  const startEditing = (column: { key: string; label: string }) => {
    setEditingKey(column.key);
    setEditLabel(column.label);
  };

  const handleEditSave = () => {
    if (editingKey && onEditColumn) {
      onEditColumn(editingKey, editLabel);
      setEditingKey(null);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2 rounded-lg hover:bg-gray-50 transition-all"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        Customize Columns
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Table Columns</h3>
              <button
                onClick={() => setShowNewColumnModal(true)}
                className="text-sm bg-[#1E1E3F] text-white px-3 py-1.5 rounded-lg hover:bg-[#2D2D5F] transition-colors"
              >
                + Add Column
              </button>
            </div>
          </div>
          
          <div className="max-h-[60vh] overflow-y-auto">
            <div className="p-4 space-y-3">
              {availableColumns.map(column => (
                <div key={column.key} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg group">
                  <input
                    type="checkbox"
                    checked={activeColumns.includes(column.key)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onColumnChange([...activeColumns, column.key]);
                      } else {
                        onColumnChange(activeColumns.filter(key => key !== column.key));
                      }
                    }}
                    className="mt-1 rounded border-gray-300 text-[#1E1E3F] focus:ring-[#1E1E3F]"
                  />
                  <div className="flex-1">
                    {editingKey === column.key ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editLabel}
                          onChange={(e) => setEditLabel(e.target.value)}
                          className="flex-1 text-sm border rounded px-2 py-1"
                          autoFocus
                        />
                        <button
                          onClick={handleEditSave}
                          className="text-sm text-green-600 hover:text-green-700"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{column.label}</div>
                          {column.description && (
                            <div className="text-xs text-gray-500">{column.description}</div>
                          )}
                        </div>
                        {column.isCustom && (
                          <button
                            onClick={() => startEditing(column)}
                            className="opacity-0 group-hover:opacity-100 text-sm text-blue-600 hover:text-blue-700"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showNewColumnModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[400px] shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Add New Column</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Column Label</label>
                <input
                  type="text"
                  value={newColumn.label}
                  onChange={(e) => setNewColumn(prev => ({ 
                    ...prev, 
                    label: e.target.value,
                    key: e.target.value.toLowerCase().replace(/\s+/g, '_')
                  }))}
                  className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-[#1E1E3F] focus:border-transparent"
                  placeholder="e.g., LinkedIn Profile"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowNewColumnModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddColumn}
                  disabled={!newColumn.label.trim()}
                  className="px-4 py-2 text-sm bg-[#1E1E3F] text-white rounded-lg hover:bg-[#2D2D5F] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Column
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
