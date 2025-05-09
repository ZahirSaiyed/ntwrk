import { Contact } from '@/types';
import { adaptContact } from './contactAdapter';

export interface VelocityScore {
  score: number;
  trend: 'rising' | 'stable' | 'falling';
}

export function calculateVelocityScore(contact: Contact): VelocityScore {
  // Use our adapter to ensure backward compatibility
  const adaptedContact = adaptContact(contact);
  
  // Skip if no interactions
  if (!adaptedContact.interactions || adaptedContact.interactions.length === 0) {
    return { score: 0, trend: 'stable' };
  }
  
  // Recently contacted score (higher if contacted more recently)
  const lastContactDate = new Date(adaptedContact.lastContacted);
  const daysSinceLastContact = (Date.now() - lastContactDate.getTime()) / (1000 * 60 * 60 * 24);
  const recencyScore = Math.max(0, 100 - daysSinceLastContact); // 0-100 score, higher for more recent
  
  // Frequency score - based on interaction count
  const recentInteractions = adaptedContact.interactions.slice(-30); // Last 30 interactions
  const frequencyScore = recentInteractions.length * 10; // Simple scoring
  
  // Consistency score - based on regularity of interactions
  const datesSorted = recentInteractions
    .map(i => new Date(i.date).getTime())
    .sort((a, b) => a - b);
  
  let consistencyScore = 0;
  if (datesSorted.length > 1) {
    const intervals = [];
    for (let i = 1; i < datesSorted.length; i++) {
      intervals.push(datesSorted[i] - datesSorted[i-1]);
    }
    
    // Calculate standard deviation
    const avg = intervals.reduce((sum, i) => sum + i, 0) / intervals.length;
    const stdDev = Math.sqrt(
      intervals.reduce((sum, i) => sum + Math.pow(i - avg, 2), 0) / intervals.length
    );
    
    // Lower standard deviation = more consistent intervals = higher score
    consistencyScore = Math.max(0, 100 - (stdDev / (24 * 60 * 60 * 1000))); // Normalize by days
  }
  
  // Final score - weighted average
  const finalScore = (recencyScore * 0.4) + (frequencyScore * 0.4) + (consistencyScore * 0.2);
  const score = Math.min(100, Math.round(finalScore)); // Cap at 100
  
  // Determine trend based on recent activity
  let trend: 'rising' | 'stable' | 'falling' = 'stable';
  
  // Calculate trend based on interactions in the last 90 days vs prior period
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  
  const oneeEightyDaysAgo = new Date();
  oneeEightyDaysAgo.setDate(oneeEightyDaysAgo.getDate() - 180);
  
  const recentCount = adaptedContact.interactions.filter(
    i => new Date(i.date) > ninetyDaysAgo
  ).length;
  
  const priorCount = adaptedContact.interactions.filter(
    i => new Date(i.date) > oneeEightyDaysAgo && new Date(i.date) <= ninetyDaysAgo
  ).length;
  
  if (recentCount > priorCount * 1.2) {
    trend = 'rising';
  } else if (recentCount < priorCount * 0.8) {
    trend = 'falling';
  }
  
  return { score, trend };
}
