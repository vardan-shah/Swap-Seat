export type Station = {
  id: string;
  name: string;
  sequence: number; // mapped from service_pattern RY-MM
  status: 'operational' | 'under_construction' | 'planned';
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
  updatedAt: number;
  expiresAt: number;
  price?: number; // Optional price if monetization is enabled
  trainId: string;
};

export type Match = {
  id: string;
  opportunityId: string;
  seekerId: string;
  giverId: string;
  status: MatchStatus;
  createdAt: number;
  cancelledBy?: string;
};

export type User = {
  id: string;
  displayName: string;
  reputation: number;
  upiId?: string;
};
