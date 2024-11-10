import { Contact } from "@/types";
import { analyzeInteractions } from './interactionTracking';

interface Interaction {
  date: string;
  type: 'sent' | 'received';
}

export function calculateVelocityScore(contact: Contact) {
  // Basic implementation
  const recentInteractions = contact.interactions.slice(-30); // Last 30 interactions
  const score = recentInteractions.length * 10; // Simple scoring
  const trend = score > 50 ? 'rising' : 'falling';
  
  return {
    score,
    trend: trend as 'rising' | 'falling'
  };
}
