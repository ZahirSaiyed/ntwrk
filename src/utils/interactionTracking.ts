interface Interaction {
    date: string;
    type: 'sent' | 'received';
    threadId?: string;
  }
  
  export function analyzeInteractions(interactions: Interaction[]) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    
    return {
      last30Days: interactions.filter(i => new Date(i.date) > thirtyDaysAgo).length,
      last90Days: interactions.filter(i => new Date(i.date) > ninetyDaysAgo).length,
      responseRate: calculateResponseRate(interactions),
      averageResponseTime: calculateAverageResponseTime(interactions)
    };
  }
  
  function calculateResponseRate(interactions: Interaction[]): number {
    // Implementation details for response rate calculation
    return 0;
  }
  
  function calculateAverageResponseTime(interactions: Interaction[]): number {
    // Implementation details for response time calculation
    return 0;
  }