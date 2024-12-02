import { Contact } from '@/types';

export interface SpamDetectionResult {
  isSpam: boolean;
  reasons: string[];
  confidence: number;
}

export function analyzeContact(contact: Contact): SpamDetectionResult {
  const reasons: string[] = [];
  let spamScore = 0;
  
  // 1. Email Pattern Analysis
  const emailPatterns = {
    noreply: ['noreply', 'no-reply', 'no.reply', 'donotreply'],
    marketing: ['newsletter', 'marketing', 'notifications', 'updates', 'promotions', 'offers'],
    automation: ['mailer.', 'mailchimp', 'sendgrid', 'campaign-', 'automated', 'autoresponder'],
    suspicious: ['temp', 'spam', 'disposable', 'temporary']
  };

  // Check email patterns
  Object.entries(emailPatterns).forEach(([category, patterns]) => {
    if (patterns.some(pattern => contact.email.toLowerCase().includes(pattern))) {
      reasons.push(`Detected ${category} email pattern`);
      spamScore += 25;
    }
  });

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