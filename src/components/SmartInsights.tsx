import { Contact, Group } from "@/types";
import { useState } from "react";
import { calculateVelocityScore } from '@/utils/velocityTracking';
import GroupMembers from '@/components/GroupMembers';
import { formatDistanceToNow } from 'date-fns';

// Add this before the SmartInsights component
function inferRegionFromDomain(domain: string): string {
  if (domain.endsWith('.uk')) return 'UK';
  if (domain.endsWith('.eu')) return 'Europe';
  if (domain.endsWith('.au')) return 'Australia';
  if (domain.endsWith('.ca')) return 'Canada';
  // Add more regions as needed
  return 'Other'; // Default fallback
}

interface SmartInsightsProps {
  contacts: Contact[];
  onGroupCreate: (name: string, members: Set<string>) => void;
}

export default function SmartInsights({ contacts, onGroupCreate }: SmartInsightsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const generateInsights = () => {
    const now = new Date();
    
    interface DomainGroup {
      members: Set<string>;
      size: 'small' | 'medium' | 'large';
      industry: string;
      region: string;
    }
    
    const domainGroups = contacts.reduce<Record<string, DomainGroup>>((acc, contact) => {
      const domain = contact.email.split('@')[1];
      if (!acc[domain]) {
        acc[domain] = {
          members: new Set<string>(),
          size: 'small',
          industry: inferIndustry(domain),
          region: inferRegionFromDomain(domain)
        };
      }
      acc[domain].members.add(contact.email);
      if (acc[domain].members.size > 10) acc[domain].size = 'large';
      else if (acc[domain].members.size > 5) acc[domain].size = 'medium';
      return acc;
    }, {});

    // Enhanced interaction frequency grouping
    const frequencyGroups = {
      daily: {
        members: new Set<string>(),
        label: 'Daily Contacts',
        description: '3+ interactions per week',
        icon: '🔥'
      },
      weekly: {
        members: new Set<string>(),
        label: 'Weekly Contacts',
        description: '4+ interactions per month',
        icon: '📅'
      },
      monthly: {
        members: new Set<string>(),
        label: 'Monthly Contacts',
        description: '1+ interaction per month',
        icon: '📊'
      },
      quarterly: {
        members: new Set<string>(),
        label: 'Quarterly Contacts',
        description: 'Less frequent interactions',
        icon: '🕒'
      }
    };

    contacts.forEach(contact => {
      // Calculate total interactions in last 30 days
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const recentInteractions = contact.interactions?.filter(i => 
        new Date(i.date) > thirtyDaysAgo
      )?.length || 0;

      // Categorize based on monthly interaction rate
      if (recentInteractions >= 12) { // 3+ per week = daily
        frequencyGroups.daily.members.add(contact.email);
      } else if (recentInteractions >= 4) { // 1+ per week = weekly
        frequencyGroups.weekly.members.add(contact.email);
      } else if (recentInteractions >= 1) { // At least once a month
        frequencyGroups.monthly.members.add(contact.email);
      } else {
        frequencyGroups.quarterly.members.add(contact.email);
      }
    });

    // Add to the generateInsights function after frequencyGroups
    const noReplyGroups = {
      promotional: {
        members: new Set<string>(),
        label: 'Promotional Contacts',
        description: 'Likely marketing or automated emails',
        icon: '📢'
      },
      noResponse: {
        members: new Set<string>(),
        label: 'No Response Contacts',
        description: 'Never replied to your messages',
        icon: '🔕'
      },
      inactive: {
        members: new Set<string>(),
        label: 'Inactive Contacts',
        description: 'No recent two-way communication',
        icon: '💤'
      }
    };

    contacts.forEach(contact => {
      // Skip if no interactions
      if (!contact.interactions || contact.interactions.length === 0) {
        return;
      }
      
      // Check for promotional patterns
      const isLikelyPromotional = 
        // All messages are received (never sent by us)
        contact.interactions.every(i => i.type === 'received') &&
        (
          // High frequency of messages
          contact.interactions.length > 10 ||
          // Common promotional/no-reply keywords in email
          contact.email.toLowerCase().includes('noreply') || 
          contact.email.toLowerCase().includes('no-reply') ||
          contact.email.toLowerCase().includes('no.reply') ||
          contact.email.toLowerCase().includes('donotreply') ||
          contact.email.toLowerCase().includes('newsletter') ||
          contact.email.toLowerCase().includes('marketing') ||
          contact.email.toLowerCase().includes('notifications') ||
          contact.email.toLowerCase().includes('updates') ||
          // Common promotional domains
          contact.email.toLowerCase().includes('mailer.') ||
          contact.email.toLowerCase().includes('mailchimp') ||
          contact.email.toLowerCase().includes('sendgrid') ||
          contact.email.toLowerCase().includes('campaign-')
        );

      // Check for no-response patterns
      const hasNeverReplied = 
        contact.interactions.length > 3 &&
        contact.interactions.every(i => i.type === 'sent');

      // Check for inactive relationships
      const isInactive = 
        contact.interactions.length > 1 &&
        !contact.interactions.some(i => 
          i.type === 'received' && 
          new Date(i.date) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        );

      if (isLikelyPromotional) {
        noReplyGroups.promotional.members.add(contact.email);
      } else if (hasNeverReplied) {
        noReplyGroups.noResponse.members.add(contact.email);
      } else if (isInactive) {
        noReplyGroups.inactive.members.add(contact.email);
      }
    });

    return { 
      domainGroups, 
      frequencyGroups,
      noReplyGroups
    };
  };

  const insights = generateInsights();

  return (
    <div className="space-y-8">
      {/* Key Organizations */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#1E1E3F]">Key Organizations</h3>
        <div className="space-y-3">
          {Object.entries(insights.domainGroups)
            .filter(([_, data]) => data.members.size >= 3)
            .map(([domain, data]) => (
              <GroupMembers
                key={domain}
                title={domain.split('.')[0].toUpperCase()}
                members={data.members}
                contacts={contacts}
                description={data.industry}
                onCreateGroup={onGroupCreate}
              />
            ))}
        </div>
      </div>

      {/* Interaction Patterns */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#1E1E3F]">Interaction Patterns</h3>
        <div className="space-y-3">
          {Object.entries(insights.frequencyGroups).map(([key, group]) => (
            group.members.size > 0 && (
              <GroupMembers
                key={key}
                title={group.label}
                members={group.members}
                contacts={contacts}
                icon={group.icon}
                description={group.description}
                onCreateGroup={onGroupCreate}
              />
            )
          ))}
        </div>
      </div>

      {/* No Reply Patterns */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#1E1E3F]">Communication Gaps</h3>
        <div className="space-y-3">
          {Object.entries(insights.noReplyGroups).map(([key, group]) => (
            group.members.size > 0 && (
              <GroupMembers
                key={key}
                title={group.label}
                members={group.members}
                contacts={contacts}
                icon={group.icon}
                description={group.description}
                onCreateGroup={onGroupCreate}
              />
            )
          ))}
        </div>
      </div>
    </div>
  );
}

// Helper function to infer industry from domain
function inferIndustry(domain: string): string {
  const industryKeywords = {
    tech: ['tech', 'software', 'ai', 'cloud', 'digital'],
    finance: ['bank', 'capital', 'finance', 'invest'],
    healthcare: ['health', 'med', 'care', 'bio'],
    // Add more industries
  };

  const domainName = domain.toLowerCase();
  for (const [industry, keywords] of Object.entries(industryKeywords)) {
    if (keywords.some(keyword => domainName.includes(keyword))) {
      return industry.charAt(0).toUpperCase() + industry.slice(1);
    }
  }
  return 'Other';
}