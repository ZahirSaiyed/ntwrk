export interface Contact {
  id: string;
  name: string;
  email: string;
  lastContacted: string;
  lastContactedRaw?: string; // For sorting
  company?: string;
  industry?: string;
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
  provider?: 'google' | 'microsoft-entra-id';
  enrichedBy?: 'ai';
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