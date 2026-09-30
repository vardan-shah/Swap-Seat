import { create } from 'zustand';
import { SeatOpportunity, Match, User, Direction } from '../types';
import { STATIONS, isStationAfter, getStationById } from '../data/stations';
import { Language } from '../i18n';

interface AppState {
  // Config
  language: Language;
  setLanguage: (lang: Language) => void;
  
  // Auth
  isAuthenticated: boolean;
  login: (phone: string) => void;
  logout: () => void;
  
  // User Profile
  currentUser: User;
  upiId: string | null;
  setUpiId: (id: string | null) => void;
  upiQrUri: string | null;
  setUpiQrUri: (uri: string | null) => void;
  
  // App Data
  opportunities: SeatOpportunity[];
  matches: Match[];
  
  // Actions
  offerSeat: (direction: Direction, currentStationId: string, handoffStationId: string, price?: number, trainId?: string) => void;
  requestSeat: (opportunityId: string, seekerId: string) => void;
  transition: (matchId: string, actorId: string, to: import('../types').MatchStatus) => boolean;
  acceptMatch: (matchId: string) => boolean;
  rejectMatch: (matchId: string) => boolean;
  cancelMatch: (matchId: string) => boolean;
  completeMatch: (matchId: string) => boolean;
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

export const useAppStore = create<AppState>((set, get) => ({
  // Config
  language: 'en',
  setLanguage: (lang) => set({ language: lang }),
  
  // Auth
  isAuthenticated: false,
  login: (phone) => set({ 
    isAuthenticated: true, 
    currentUser: { id: 'u_me', displayName: phone || 'Me', reputation: 5.0 } 
  }),
  logout: () => set({ isAuthenticated: false }),
  
  // User Profile
  currentUser: MOCK_USER,
  upiId: null,
  setUpiId: (id) => set({ upiId: id }),
  upiQrUri: null,
  setUpiQrUri: (uri) => set({ upiQrUri: uri }),
  
  // App Data
  opportunities: [],
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

  transition: (matchId: string, actorId: string, to: MatchStatus): boolean => {
    const state = get();
    const m = state.matches.find(x => x.id === matchId);
    
    const TRANSITIONS: Record<MatchStatus, MatchStatus[]> = {
      PENDING:   ['ACCEPTED', 'REJECTED', 'CANCELLED'],
      ACCEPTED:  ['COMPLETED', 'CANCELLED'],
      REJECTED:  [], COMPLETED: [], CANCELLED: [],
    };
    
    if (!m || !TRANSITIONS[m.status].includes(to)) return false;

    const isGiver = actorId === m.giverId;
    const isSeeker = actorId === m.seekerId;
    
    const allowed =
      to === 'ACCEPTED' || to === 'REJECTED' ? isGiver :
      to === 'CANCELLED' ? isGiver || isSeeker :
      isGiver; // COMPLETED: decided by giver for MVP
    
    if (!allowed) return false;

    set(s => ({
      matches: s.matches.map(x =>
        x.id === matchId ? { ...x, status: to }
        : to === 'ACCEPTED' && x.opportunityId === m.opportunityId && x.status === 'PENDING'
          ? { ...x, status: 'REJECTED' } : x),
      opportunities: s.opportunities.map(o => {
        if (o.id !== m.opportunityId) return o;
        if (to === 'ACCEPTED')  return { ...o, status: 'MATCHED' };
        if (to === 'COMPLETED') return { ...o, status: 'COMPLETED' };
        if (to === 'CANCELLED' && m.status === 'ACCEPTED')
          return { ...o, status: 'ACTIVE' }; // reopen the seat
        return o;
      }),
    }));
    return true;
  },

  acceptMatch: (matchId) => get().transition(matchId, get().currentUser.id, 'ACCEPTED'),
  rejectMatch: (matchId) => get().transition(matchId, get().currentUser.id, 'REJECTED'),
  cancelMatch: (matchId) => get().transition(matchId, get().currentUser.id, 'CANCELLED'),
  completeMatch: (matchId) => get().transition(matchId, get().currentUser.id, 'COMPLETED'),

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
