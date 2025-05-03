export interface Contact {
  name: string;
  email: string;
  lastContacted: string;
  company?: string;
  relationshipStrength?: {
    score: number;
    trend: 'rising' | 'stable' | 'falling';
  };
  interactions?: {
    date: string;
    channel: 'email' | 'message' | 'call';
    type: 'sent' | 'received';
    participants?: string[];
  }[];
  sentDates?: string[];
  velocity?: {
    score: number;
    trend: 'rising' | 'stable' | 'falling';
    interactionMetrics: {
      last30Days: number;
      last90Days: number;
      responseRate: number;
      averageResponseTime: number;
    };
  };
  customFields?: CustomField[];
  tags?: string[];
  notes?: string;
}

export type Group = {
  id: string;
  name: string;
  members: Set<string>;
};

export interface CustomField {
  id: string;
  label: string;
  value: string;
}