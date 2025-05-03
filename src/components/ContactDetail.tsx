import { Contact } from '@/types';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

interface CustomField {
  id: string;
  label: string;
  value: string;
}

interface Props {
  contact: Contact;
  onClose: () => void;
  onSave: (updatedContact: Contact) => void;
  onAddColumn?: (column: { 
    key: string; 
    label: string; 
    render: (contact: Contact) => React.ReactNode 
  }) => void;
}

export default function ContactDetail({ contact, onClose, onSave, onAddColumn }: Props) {
  const [editedContact, setEditedContact] = useState<Contact>({
    ...contact,
    customFields: contact.customFields || []
  });
  const [customFields, setCustomFields] = useState<CustomField[]>(
    contact.customFields || []
  );
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [showNewField, setShowNewField] = useState(false);

  useEffect(() => {
    setEditedContact({
      ...contact,
      customFields: contact.customFields || []
    });
    setCustomFields(contact.customFields || []);
  }, [contact]);

  const handleInputChange = (field: keyof Contact, value: string) => {
    setEditedContact(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCustomFieldChange = (label: string, value: string) => {
    setCustomFields(prev => {
      const existingField = prev.find(f => f.label === label);
      if (existingField) {
        return prev.map(f => f.label === label ? { ...f, value } : f);
      }
      return [...prev, { id: `custom_${label.toLowerCase().replace(/\s+/g, '_')}`, label, value }];
    });
  };

  const handleAddCustomField = () => {
    if (newFieldLabel.trim()) {
      const fieldId = `custom_${newFieldLabel.toLowerCase().replace(/\s+/g, '_')}`;
      
      // Add to custom fields
      setCustomFields(prev => [
        ...prev,
        { id: fieldId, label: newFieldLabel, value: '' }
      ]);

      // Add to column customization if callback exists
      if (onAddColumn) {
        onAddColumn({
          key: fieldId,
          label: newFieldLabel,
          render: (contact: Contact) => {
            const customField = contact.customFields?.find(f => 
              f.label.toLowerCase().replace(/\s+/g, '_') === newFieldLabel.toLowerCase().replace(/\s+/g, '_')
            );
            return customField?.value || '-';
          }
        });
      }

      setNewFieldLabel('');
      setShowNewField(false);
    }
  };

  const handleRemoveCustomField = (id: string) => {
    setCustomFields(prev => prev.filter(field => field.id !== id));
  };

  const handleSave = () => {
    onSave({
      ...editedContact,
      customFields
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 400 }}
          className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-8">
            <motion.h2 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-2xl font-semibold bg-gradient-to-r from-[#1E1E3F] to-[#2D2D5F] bg-clip-text text-transparent"
            >
              Contact Details
            </motion.h2>
            <motion.button
              whileHover={{ rotate: 90 }}
              transition={{ type: "spring", stiffness: 300 }}
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          </div>

          {/* Standard Fields */}
          <div className="space-y-6 mb-8">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="group"
            >
              <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-[#1E1E3F] transition-colors">
                Name
              </label>
              <input 
                type="text" 
                value={editedContact.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1E1E3F] focus:ring focus:ring-[#1E1E3F]/20 transition-all"
                placeholder="Enter name..."
              />
            </motion.div>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="group"
            >
              <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-[#1E1E3F] transition-colors">
                Email
              </label>
              <input 
                type="email" 
                value={editedContact.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1E1E3F] focus:ring focus:ring-[#1E1E3F]/20 transition-all"
                placeholder="Enter email..."
              />
            </motion.div>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="group"
            >
              <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-[#1E1E3F] transition-colors">
                Company
              </label>
              <input 
                type="text" 
                value={editedContact.company || ''}
                onChange={(e) => handleInputChange('company', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1E1E3F] focus:ring focus:ring-[#1E1E3F]/20 transition-all"
                placeholder="Enter company..."
              />
            </motion.div>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="group"
            >
              <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-[#1E1E3F] transition-colors">
                Last Emailed
              </label>
              <div className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700">
                {editedContact.lastContacted ? format(new Date(editedContact.lastContacted), 'MMMM d, yyyy') : 'No data'}
              </div>
            </motion.div>
          </div>

          {/* Custom Fields */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">Custom Fields</h3>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNewField(true)}
                className="text-sm text-[#1E1E3F] hover:text-[#2D2D5F] font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Field
              </motion.button>
            </div>

            <AnimatePresence>
              {showNewField && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex gap-3"
                >
                  <input
                    type="text"
                    value={newFieldLabel}
                    onChange={(e) => setNewFieldLabel(e.target.value)}
                    placeholder="Field name..."
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1E1E3F] focus:ring focus:ring-[#1E1E3F]/20 transition-all"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddCustomField}
                    className="px-4 py-2 bg-[#1E1E3F] text-white rounded-xl hover:bg-[#2D2D5F] transition-colors"
                  >
                    Add
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {customFields.map((field, index) => (
              <motion.div
                key={field.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="group relative"
              >
                <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-[#1E1E3F] transition-colors">
                  {field.label}
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={field.value}
                    onChange={(e) => handleCustomFieldChange(field.label, e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1E1E3F] focus:ring focus:ring-[#1E1E3F]/20 transition-all"
                    placeholder={`Enter ${field.label.toLowerCase()}...`}
                  />
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleRemoveCustomField(field.id)}
                    className="text-red-400 hover:text-red-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Action Buttons */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex justify-end gap-3"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="px-6 py-2.5 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              className="px-6 py-2.5 bg-gradient-to-r from-[#1E1E3F] to-[#2D2D5F] text-white rounded-xl hover:opacity-90 transition-opacity"
            >
              Save Changes
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
