interface NetworkMetrics {
  score: {
    value: number;
    explanation: string;
  };
  activeRelationships: {
    count: number;
    explanation: string;
  };
  avgResponseTime: {
    hours: number;
    explanation: string;
  };
  networkReach: {
    value: number;
    explanation: string;
  };
}

interface RelationshipHealth {
  status: {
    label: 'Very Active' | 'Active' | 'Needs Attention' | 'Reconnect Needed';
    explanation: string;
  };
  trend: {
    direction: '↗️ Rising' | '→ Stable' | '↘️ Falling';
    explanation: string;
  };
  activityMetrics: {
    recentActivity: {
      count: number;
      explanation: string;
    };
    responseRate: {
      percentage: number;
      explanation: string;
    };
  };
}

export const getNetworkMetricsExplanation = (metrics: any): NetworkMetrics => ({
  score: {
    value: metrics.score,
    explanation: "Your overall network health score (0-100). Based on how frequently you interact, response times, and relationship strength."
  },
  activeRelationships: {
    count: metrics.activeRelationships,
    explanation: "Contacts you've interacted with in the last 30 days."
  },
  avgResponseTime: {
    hours: metrics.avgResponseTime,
    explanation: "Average time it takes to respond to messages."
  },
  networkReach: {
    value: metrics.networkReach,
    explanation: "Total number of people in your network."
  }
});

export const getRelationshipHealth = (contact: any): RelationshipHealth => {
  const daysSinceContact = (new Date().getTime() - new Date(contact.lastContacted).getTime()) / (1000 * 60 * 60 * 24);
  
  return {
    status: getStatusWithExplanation(daysSinceContact),
    trend: getTrendWithExplanation(contact),
    activityMetrics: {
      recentActivity: {
        count: contact.interactions.filter((i: { date: string | number | Date }) => 
          new Date(i.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ).length,
        explanation: "Number of interactions in the last 30 days. More frequent interaction = stronger relationship!"
      },
      responseRate: {
        percentage: calculateResponseRate(contact),
        explanation: "How often you respond to each other's messages. Higher rates indicate an engaged relationship."
      }
    }
  };
};

function getStatusWithExplanation(days: number) {
  if (days < 7) return {
    label: 'Very Active' as const,
    explanation: 'Regular communication in the last week - great job!'
  };
  if (days < 30) return {
    label: 'Active' as const,
    explanation: 'Consistent contact within the last month'
  };
  if (days < 90) return {
    label: 'Needs Attention' as const,
    explanation: 'It\'s been a while - consider reaching out soon'
  };
  return {
    label: 'Reconnect Needed' as const,
    explanation: 'Time to revive this relationship with a friendly message'
  };
}

function getTrendWithExplanation(contact: any) {
  const recentInteractions = contact.interactions.filter((i: { date: string | number | Date }) => 
    new Date(i.date) > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
  ).length;

  if (recentInteractions > 3) return {
    direction: '↗️ Rising' as const,
    explanation: 'Strong recent activity!'
  };
  if (recentInteractions > 0) return {
    direction: '→ Stable' as const,
    explanation: 'Maintaining regular contact'
  };
  return {
    direction: '↘️ Falling' as const,
    explanation: 'Activity has decreased recently'
  };
}

function calculateResponseRate(contact: any) {
  return contact.interactions.length > 0 
    ? (contact.interactions.filter((i: { type: string }) => i.type === 'sent').length / contact.interactions.length) * 100
    : 0;
}
