import { Contact } from '@/types';
import { useState } from 'react';

interface CustomField {
  id: string;
  label: string;
  value: string;
}

interface Props {
  contact: Contact;
  onClose: () => void;
  onSave: (updatedContact: Contact) => void;
}

export default function ContactDetail({ contact, onClose, onSave }: Props) {
  const [editedContact, setEditedContact] = useState<Contact>(contact);
  const [customFields, setCustomFields] = useState<CustomField[]>(
    contact.customFields || []
  );

  const handleInputChange = (field: keyof Contact, value: string) => {
    setEditedContact(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCustomFieldChange = (id: string, field: 'label' | 'value', value: string) => {
    setCustomFields(prev => prev.map(f => 
      f.id === id ? { ...f, [field]: value } : f
    ));
  };

  const handleSave = () => {
    onSave({
      ...editedContact,
      customFields
    });
  };

  const addCustomField = () => {
    setCustomFields(prev => [...prev, {
      id: Date.now().toString(),
      label: 'New Field',
      value: ''
    }]);
  };

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-[#1E1E3F]">Contact Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        {/* Standard Fields */}
        <div className="space-y-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input 
              type="text" 
              value={editedContact.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1E1E3F] focus:ring-[#1E1E3F]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input 
              type="email" 
              value={editedContact.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1E1E3F] focus:ring-[#1E1E3F]"
            />
          </div>
        </div>

        {/* Custom Fields */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-700">Custom Fields</h3>
            <button 
              onClick={addCustomField}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              + Add Field
            </button>
          </div>
          
          {customFields.map(field => (
            <div key={field.id} className="flex gap-4">
              <input 
                type="text"
                placeholder="Field Label"
                value={field.label}
                onChange={(e) => handleCustomFieldChange(field.id, 'label', e.target.value)}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-[#1E1E3F] focus:ring-[#1E1E3F]"
              />
              <input 
                type="text"
                placeholder="Value"
                value={field.value}
                onChange={(e) => handleCustomFieldChange(field.id, 'value', e.target.value)}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-[#1E1E3F] focus:ring-[#1E1E3F]"
              />
            </div>
          ))}
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-[#1E1E3F] text-white rounded-lg hover:bg-[#2D2D5F] transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
