import { Contact } from '@/types';

/**
 * Adapts a contact with the new data structure (sentDates) to ensure it's compatible
 * with code that expects the old structure (interactions).
 * 
 * @param contact A contact object that may have sentDates instead of interactions
 * @returns A contact object with a properly formatted interactions array
 */
export function adaptContact(contact: Contact): Contact {
  // If the contact already has an interactions array, return it as is
  if (contact.interactions && contact.interactions.length > 0) {
    return contact;
  }
  
  // If the contact has sentDates, convert them to interactions
  if (contact.sentDates && contact.sentDates.length > 0) {
    return {
      ...contact,
      interactions: contact.sentDates.map(date => ({
        date,
        channel: 'email',
        type: 'sent' as const,
      }))
    };
  }
  
  // If neither exists, return with an empty interactions array
  return {
    ...contact,
    interactions: []
  };
}

/**
 * Adapts an array of contacts with the new data structure to be compatible
 * with code that expects the old structure.
 * 
 * @param contacts An array of contact objects
 * @returns An array of contact objects with properly formatted interactions arrays
 */
export function adaptContacts(contacts: Contact[]): Contact[] {
  return contacts.map(adaptContact);
} 