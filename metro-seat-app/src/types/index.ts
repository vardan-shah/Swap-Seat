export type Station = {
  id: string;
  name: string;
  sequence: number; // mapped from service_pattern RY-MM
  status: string;
};

export type Direction = 'Northbound' | 'Southbound';

export type OpportunityStatus = 'ACTIVE' | 'MATCHED' | 'EXPIRED' | 'CANCELLED' | 'COMPLETED';
export type MatchStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';

export type SeatOpportunity = {
  id: string;
  giverId: string;
  direction: Direction;
  currentStationId: string;
  handoffStationId: string;
  status: OpportunityStatus;
  createdAt: number;
  expectedTimeMins?: number; // Estimated minutes until handoff
  price?: number; // Optional price if monetization is enabled
};

export type Match = {
  id: string;
  opportunityId: string;
  seekerId: string;
  giverId: string;
  status: MatchStatus;
  createdAt: number;
};

export type User = {
  id: string;
  displayName: string;
  reputation: number;
};
