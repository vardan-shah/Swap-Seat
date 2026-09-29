import { create } from 'zustand';
import { SeatOpportunity, Match, User, Direction } from '../types';
import { STATIONS, isStationAfter, getStationById } from '../data/stations';

interface AppState {
  currentUser: User;
  opportunities: SeatOpportunity[];
  matches: Match[];
  
  // Actions
  offerSeat: (direction: Direction, currentStationId: string, handoffStationId: string, price?: number, trainId?: string) => void;
  requestSeat: (opportunityId: string, seekerId: string) => void;
  acceptMatch: (matchId: string) => void;
  rejectMatch: (matchId: string) => void;
  completeMatch: (matchId: string) => void;
  expireOpportunity: (oppId: string) => void;
  
  // Queries
  getCompatibleOpportunities: (currentStationId: string, destinationStationId: string, direction: Direction) => SeatOpportunity[];
  getActiveMatchForUser: (userId: string) => Match | undefined;
  getMyOpportunity: (userId: string) => SeatOpportunity | undefined;
}

// Seed user
const MOCK_USER: User = {
  id: 'u1',
  displayName: 'Current User',
  reputation: 4.8,
};

// Seed opportunities
const SEED_OPPORTUNITIES: SeatOpportunity[] = [
  {
    id: 'opp1',
    giverId: 'u2',
    direction: 'Northbound',
    currentStationId: 'motera-stadium', // Motera
    handoffStationId: 'gnlu', // GNLU
    status: 'ACTIVE',
    createdAt: Date.now(),
    expectedTimeMins: 15,
  },
  {
    id: 'opp2',
    giverId: 'u3',
    direction: 'Northbound',
    currentStationId: 'narmada-canal', // Narmada
    handoffStationId: 'sachivalaya', // Sachivalaya
    status: 'ACTIVE',
    createdAt: Date.now(),
    expectedTimeMins: 20,
    price: 30, // Mocked price for testing monetization
  }
];

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: MOCK_USER,
  opportunities: SEED_OPPORTUNITIES,
  matches: [],
  
  offerSeat: (direction, currentStationId, handoffStationId, price, trainId) => set((state) => {
    const newOpp: SeatOpportunity = {
      id: Math.random().toString(36).substring(7),
      giverId: state.currentUser.id,
      direction,
      currentStationId,
      handoffStationId,
      status: 'ACTIVE',
      createdAt: Date.now(),
      expectedTimeMins: Math.floor(Math.random() * 15) + 5, // Mock timing
      price,
      trainId,
    };
    return { opportunities: [...state.opportunities, newOpp] };
  }),

  requestSeat: (opportunityId, seekerId) => set((state) => {
    const newMatch: Match = {
      id: Math.random().toString(36).substring(7),
      opportunityId,
      seekerId,
      giverId: state.opportunities.find(o => o.id === opportunityId)?.giverId || '',
      status: 'PENDING',
      createdAt: Date.now(),
    };
    
    return {
      matches: [...state.matches, newMatch]
    };
  }),

  acceptMatch: (matchId) => set((state) => {
    const match = state.matches.find(m => m.id === matchId);
    if (!match) return state;

    return {
      matches: state.matches.map(m => m.id === matchId ? { ...m, status: 'ACCEPTED' } : m),
      opportunities: state.opportunities.map(o => o.id === match.opportunityId ? { ...o, status: 'MATCHED' } : o)
    };
  }),

  rejectMatch: (matchId) => set((state) => {
    return {
      matches: state.matches.map(m => m.id === matchId ? { ...m, status: 'REJECTED' } : m),
    };
  }),

  completeMatch: (matchId) => set((state) => {
    const match = state.matches.find(m => m.id === matchId);
    if (!match) return state;
    return {
      matches: state.matches.map(m => m.id === matchId ? { ...m, status: 'COMPLETED' } : m),
      opportunities: state.opportunities.map(o => o.id === match.opportunityId ? { ...o, status: 'COMPLETED' } : o)
    };
  }),

  expireOpportunity: (oppId) => set((state) => {
    return {
      opportunities: state.opportunities.map(o => o.id === oppId ? { ...o, status: 'EXPIRED' } : o)
    };
  }),

  getCompatibleOpportunities: (currentStationId, destinationStationId, direction) => {
    const state = get();
    return state.opportunities.filter(opp => {
      if (opp.status !== 'ACTIVE') return false;
      if (opp.direction !== direction) return false;
      
      // Handoff station must be AFTER seeker's current station (or same)
      const handoffAfterCurrent = opp.handoffStationId === currentStationId || 
        isStationAfter(opp.handoffStationId, currentStationId, direction);
      
      // Handoff station must be BEFORE or AT seeker's destination
      const handoffBeforeDest = opp.handoffStationId === destinationStationId || 
        isStationAfter(destinationStationId, opp.handoffStationId, direction);

      return handoffAfterCurrent && handoffBeforeDest;
    });
  },

  getActiveMatchForUser: (userId) => {
    const state = get();
    return state.matches.find(m => 
      (m.seekerId === userId || m.giverId === userId) && 
      (m.status === 'PENDING' || m.status === 'ACCEPTED')
    );
  },

  getMyOpportunity: (userId) => {
     const state = get();
     return state.opportunities.find(o => 
       o.giverId === userId && (o.status === 'ACTIVE' || o.status === 'MATCHED')
     );
  }
}));
