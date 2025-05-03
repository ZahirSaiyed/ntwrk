import { Contact } from '@/types';
import { EMAIL_PATTERNS } from '../components/insights/InboxCleanupAssistant';
import { adaptContact } from './contactAdapter';

export interface SpamDetectionResult {
  isSpam: boolean;
  reasons: string[];
  confidence: number;
}

export interface DetectionResult {
  isSpam: boolean;
  reason?: string;
}

export function analyzeContact(contact: Contact): SpamDetectionResult {
  const reasons: string[] = [];
  let spamScore = 0;
  
  // Use our comprehensive EMAIL_PATTERNS
  const matches = matchesEmailPatterns(contact.email);
  if (matches.length > 0) {
    reasons.push(`Matches patterns: ${matches.join(', ')}`);
    spamScore += 25 * matches.length; // Increase score for each matching category
  }

  // 2. Interaction Pattern Analysis
  if (contact.interactions) {
    // High frequency, one-way communication
    if (contact.interactions.length > 10 && 
        contact.interactions.every(i => i.type === 'received')) {
      reasons.push('High frequency one-way communication');
      spamScore += 30;
    }

    // No responses to sent messages
    if (contact.interactions.length > 3 && 
        contact.interactions.every(i => i.type === 'sent')) {
      reasons.push('No responses to multiple sent messages');
      spamScore += 20;
    }

    // Unusual timing patterns (e.g., exact same time every day)
    const timings = contact.interactions
      .map(i => new Date(i.date).getHours())
      .sort();
    const uniqueTimings = new Set(timings);
    if (timings.length > 5 && uniqueTimings.size === 1) {
      reasons.push('Suspicious message timing pattern');
      spamScore += 15;
    }
  }

  // 3. Domain Analysis
  const suspiciousTLDs = ['.xyz', '.top', '.work', '.click', '.link'];
  if (suspiciousTLDs.some(tld => contact.email.toLowerCase().endsWith(tld))) {
    reasons.push('Suspicious email domain');
    spamScore += 20;
  }

  // 4. Contact Information Quality
  if (!contact.name || contact.name.length < 2) {
    reasons.push('Missing or invalid contact name');
    spamScore += 10;
  }

  // Calculate confidence (0-100)
  const confidence = Math.min(spamScore, 100);

  return {
    isSpam: confidence >= 25,
    reasons,
    confidence
  };
} 

function matchesEmailPatterns(email: string): string[] {
  const matches: string[] = [];
  
  Object.entries(EMAIL_PATTERNS).forEach(([category, data]) => {
    const hasMatch = data.patterns.some(pattern => {
      const regex = new RegExp(pattern, 'i');
      return regex.test(email);
    });
    
    if (hasMatch) {
      matches.push(data.title);
    }
  });
  
  return matches;
} 

/**
 * Detects potential spam contacts based on interaction patterns
 */
export function detectSpamContacts(contact: Contact): DetectionResult {
  // Adapt contact to ensure it has proper interactions structure
  const adaptedContact = adaptContact(contact);
  
  // Skip contacts without interactions
  if (!adaptedContact.interactions || adaptedContact.interactions.length === 0) {
    return { isSpam: false };
  }

  // Check if this is a promotional/marketing email (always receives, never replies)
  if (adaptedContact.interactions) {
    // Emails that we ONLY received from, never sent to
    if (adaptedContact.interactions.length > 10 &&
        adaptedContact.interactions.every(i => i.type === 'received')) {
      return { 
        isSpam: true, 
        reason: 'Promotional (always received, never sent)'
      };
    }
    
    // Emails that we ONLY sent to, never received from
    if (adaptedContact.interactions.length > 3 &&
        adaptedContact.interactions.every(i => i.type === 'sent')) {
      return { 
        isSpam: false, // These are now our primary contacts from sent mail
        reason: 'Always sent, never received'
      };
    }

    // Check for automated/bulk email patterns
    const timings = adaptedContact.interactions
      .map(i => new Date(i.date).getTime())
      .sort((a, b) => a - b);

    // Check for regular interval patterns (a sign of automated emails)
    if (timings.length >= 3) {
      const intervals = [];
      for (let i = 1; i < timings.length; i++) {
        intervals.push(timings[i] - timings[i-1]);
      }
      
      const avgInterval = intervals.reduce((sum, int) => sum + int, 0) / intervals.length;
      
      // Calculate standard deviation of intervals
      const stdDev = Math.sqrt(
        intervals.reduce((sum, int) => sum + Math.pow(int - avgInterval, 2), 0) / intervals.length
      );
      
      // If intervals are very regular (low standard deviation relative to average)
      if (stdDev / avgInterval < 0.1 && adaptedContact.interactions.length > 5) {
        return { 
          isSpam: true, 
          reason: 'Regular timing pattern (likely automated)'
        };
      }
    }
  }
  
  return { isSpam: false };
} 