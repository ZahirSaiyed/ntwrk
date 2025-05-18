import { enrichViaAI } from './enrichViaAI';
import pLimit from 'p-limit';

type Contact = {
  id: string;
  email: string;
};

type EnrichedContact = Contact & {
  company: string | null;
  industry: string | null;
  enrichedBy: 'ai';
};

// Mask email for logging
const maskEmail = (email: string) => {
  const [name, domain] = email.split('@');
  return `${name.charAt(0)}***@${domain}`;
};

// Known domain mappings for fallback
const KNOWN_DOMAINS = new Map<string, { company: string; industry: string }>([
  ['fcps.edu', { company: 'Fairfax County Public Schools', industry: 'Education' }],
  // Add more known domains as needed
]);

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

// Helper function to get user-specific enrichment cache key
const getEnrichmentCacheKey = (userEmail: string): string => {
  if (!userEmail) {
    throw new Error('User email is required for enrichment cache key');
  }
  return `enrichment-cache_${userEmail}`;
};

export async function enrichBatchViaAI(
  contacts: Contact[],
  {
    delayMs = 200,
    maxRetries = 2,
    cacheByDomain = true,
    concurrency = 3,
    userEmail = undefined,
  }: {
    delayMs?: number;
    maxRetries?: number;
    cacheByDomain?: boolean;
    concurrency?: number;
    userEmail?: string | null;
  } = {}
): Promise<EnrichedContact[]> {
  const results: EnrichedContact[] = [];
  const domainCache = new Map<string, { company: string | null; industry: string | null }>();
  const limit = pLimit(concurrency);

  // Load persistent cache if userEmail is provided
  if (userEmail && cacheByDomain && typeof window !== 'undefined') {
    try {
      const cacheKey = getEnrichmentCacheKey(userEmail);
      const savedCache = sessionStorage.getItem(cacheKey);
      if (savedCache) {
        const parsedCache = JSON.parse(savedCache);
        Object.entries(parsedCache).forEach(([domain, data]) => {
          domainCache.set(domain, data as { company: string | null; industry: string | null });
        });
        console.log('Loaded enrichment cache from sessionStorage');
      }
    } catch (error) {
      console.error('Error loading enrichment cache:', error);
    }
  }

  // Group contacts by domain for batch processing
  const contactsByDomain = new Map<string, Contact[]>();
  contacts.forEach(contact => {
    const domain = contact.email.split('@')[1]?.toLowerCase() ?? '';
    if (!contactsByDomain.has(domain)) {
      contactsByDomain.set(domain, []);
    }
    contactsByDomain.get(domain)!.push(contact);
  });

  // Process each domain group
  const promises = Array.from(contactsByDomain.entries()).map(([domain, domainContacts]) =>
    limit(async () => {
      let enrichment: { company: string | null; industry: string | null } = { company: null, industry: null };

      // Check known domains first
      if (KNOWN_DOMAINS.has(domain)) {
        enrichment = KNOWN_DOMAINS.get(domain)!;
        console.log(`Using cached data for domain: ${domain}`);
      }
      // Then check runtime cache
      else if (cacheByDomain && domainCache.has(domain)) {
        enrichment = domainCache.get(domain)!;
        console.log(`Using runtime cache for domain: ${domain}`);
      }
      // Finally, call API
      else {
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
          try {
            // Use first contact's email for domain enrichment
            enrichment = await enrichViaAI(domainContacts[0].email);
            if (cacheByDomain) {
              domainCache.set(domain, enrichment);
              // Save to persistent cache if userEmail is provided
              if (userEmail && typeof window !== 'undefined') {
                try {
                  const cacheKey = getEnrichmentCacheKey(userEmail);
                  const cacheData = Object.fromEntries(domainCache);
                  sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
                } catch (error) {
                  console.error('Error saving enrichment cache:', error);
                }
              }
            }
            break;
          } catch (err) {
            console.error(`Failed to enrich domain ${domain} (attempt ${attempt + 1}/${maxRetries + 1})`);
            if (attempt === maxRetries) {
              console.error(`Failed to enrich domain ${domain} after ${maxRetries + 1} attempts`);
              enrichment = { company: null, industry: null };
            } else {
              await sleep(2 ** attempt * 300); // Exponential backoff
            }
          }
        }
      }

      // Apply enrichment to all contacts in this domain
      domainContacts.forEach(contact => {
        results.push({
          ...contact,
          company: enrichment.company,
          industry: enrichment.industry,
          enrichedBy: 'ai',
        });
      });

      await sleep(delayMs);
    })
  );

  await Promise.all(promises);
  return results;
} 