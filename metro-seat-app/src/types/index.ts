export type Station = {
  id: string;
  name: string;
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

export type Reason =
  | 'EXPIRED'
  | 'OWN_OFFER'
  | 'ILLEGAL_TRANSITION'
  | 'NOT_ACTIVE'
  | 'DUPLICATE'
  | 'ALREADY_OFFERING'
  | 'INVALID_STATIONS'
  | 'UNKNOWN_TRAIN'
  | 'TRAIN_NOT_ON_LEG'
  | 'TRAIN_NOT_RUNNING'
  | 'NOT_FOUND'
  | 'NOT_ALLOWED';
export type Result = { ok: true } | { ok: false; reason: Reason };
