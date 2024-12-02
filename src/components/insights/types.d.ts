export interface FlaggedContact {
  contact: {
    name: string;
    email: string;
  };
  analysis: {
    reasons: string[];
    confidence: number;
  };
} 