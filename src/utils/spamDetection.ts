import { Contact } from '@/types';
import { EMAIL_PATTERNS } from '../components/insights/InboxCleanupAssistant';

export interface SpamDetectionResult {
  isSpam: boolean;
  reasons: string[];
  confidence: number;
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