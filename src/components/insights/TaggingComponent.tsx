import React from 'react';
import { Contact } from '@/types';

interface TaggingComponentProps {
  contacts: Contact[];
  tags: { [email: string]: string };
  onTagChange: (email: string, tag: string) => void;
}

export default function TaggingComponent({ contacts, tags, onTagChange }: TaggingComponentProps) {
  const tagOptions = ['Work', 'Personal', 'Family', 'Other'];

  return (
    <div className="space-y-4">
      {contacts.map((contact) => (
        <div key={contact.email} className="flex items-center justify-between p-3 border rounded">
          <span>{contact.name}</span>
          <select
            value={tags[contact.email] || ''}
            onChange={(e) => onTagChange(contact.email, e.target.value)}
            className="border rounded p-1"
          >
            <option value="">Select tag...</option>
            {tagOptions.map((tag) => (
              <option key={tag} value={tag.toLowerCase()}>
                {tag}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
} 