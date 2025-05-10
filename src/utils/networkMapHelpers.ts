import * as d3 from 'd3';
import { Contact } from '@/types';

export function calculateNodeSize(contact: Contact): number {
  const interactionCount = contact.interactions?.length || 0;
  return Math.max(5, Math.min(15, 5 + Math.sqrt(interactionCount)));
}

export function inferContactGroup(contact: Contact): string {
  const domain = contact.email.split('@')[1];
  return domain.split('.')[0];
}

export function generateNetworkLinks(contacts: Contact[]): any[] {
  const links: any[] = [];
  const domainMap = new Map<string, Contact[]>();

  // Group contacts by domain
  contacts.forEach(contact => {
    const domain = contact.email.split('@')[1];
    if (!domainMap.has(domain)) {
      domainMap.set(domain, []);
    }
    domainMap.get(domain)!.push(contact);
  });

  // Create links between contacts in the same domain
  domainMap.forEach(domainContacts => {
    for (let i = 0; i < domainContacts.length; i++) {
      for (let j = i + 1; j < domainContacts.length; j++) {
        links.push({
          source: domainContacts[i].email,
          target: domainContacts[j].email,
          value: 1
        });
      }
    }
  });

  // Add links based on interaction patterns
  contacts.forEach(contact => {
    if (!contact.interactions) return;
    
    const recentInteractions = contact.interactions
      .filter(i => new Date(i.date) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000));
    
    if (recentInteractions.length > 0) {
      const relatedContacts = contacts.filter(c => 
        recentInteractions.some(i => i.participants?.includes(c.email))
      );

      relatedContacts.forEach(related => {
        if (related.email !== contact.email) {
          links.push({
            source: contact.email,
            target: related.email,
            value: 2
          });
        }
      });
    }
  });

  return links;
}

export function getNodeColor(trend?: 'rising' | 'stable' | 'falling'): string {
  switch (trend) {
    case 'rising': return '#22C55E';
    case 'stable': return '#3B82F6';
    case 'falling': return '#EAB308';
    default: return '#94A3B8';
  }
}

export function drag(simulation: any) {
  function dragstarted(event: any) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  function dragged(event: any) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  function dragended(event: any) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }

  return d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);
}
