import { Contact } from '@/types';
import { adaptContact } from './contactAdapter';

interface Interaction {
    date: string;
    type: 'sent' | 'received';
    threadId?: string;
  }
  
  export function analyzeInteractions(contact: Contact) {
    // Adapt contact to ensure it has proper interactions structure
    const adaptedContact = adaptContact(contact);
    const interactions = adaptedContact.interactions || [];
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    return {
      last30Days: interactions.filter(i => new Date(i.date) > thirtyDaysAgo).length,
      last90Days: interactions.filter(i => new Date(i.date) > ninetyDaysAgo).length,
      responseRate: calculateResponseRate(interactions),
      averageResponseTime: calculateAverageResponseTime(interactions)
    };
  }
  
  function calculateResponseRate(interactions: Interaction[]): number {
    if (interactions.length === 0) return 0;
    
    const sent = interactions.filter(i => i.type === 'sent').length;
    return sent / interactions.length;
  }
  
  function calculateAverageResponseTime(interactions: Interaction[]): number {
    // Simple implementation for now
    return 24; // Hours
  }