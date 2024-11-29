import { Contact } from '@/types';
import { useState, useEffect } from 'react';

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
  const [editedContact, setEditedContact] = useState<Contact>({
    ...contact,
    customFields: contact.customFields || []
  });
  const [customFields, setCustomFields] = useState<CustomField[]>(
    contact.customFields || []
  );

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

  const handleSave = () => {
    onSave({
      ...editedContact,
      customFields
    });
    onClose();
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
          <div>
            <label className="block text-sm font-medium text-gray-700">Company</label>
            <input 
              type="text" 
              value={editedContact.company || ''}
              onChange={(e) => handleInputChange('company', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1E1E3F] focus:ring-[#1E1E3F]"
            />
          </div>
        </div>

        {/* Custom Fields */}
        <div className="space-y-4 mt-6">
          <h3 className="text-sm font-medium text-gray-700">Custom Fields</h3>
          {customFields.map(field => (
            <div key={field.id}>
              <label className="block text-sm font-medium text-gray-700">
                {field.label}
              </label>
              <input
                type="text"
                value={field.value}
                onChange={(e) => handleCustomFieldChange(field.label, e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1E1E3F] focus:ring-[#1E1E3F]"
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
