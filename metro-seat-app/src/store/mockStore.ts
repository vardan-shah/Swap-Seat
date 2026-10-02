import { create } from 'zustand';
import { SeatOpportunity, Match, User, Direction, MatchStatus } from '../types';
import { isLegValid } from '../domain/route';
import { handoffExpiry, trainsRunningNow, Train } from '../domain/trains';
import trainsData from '../data/trains.json';
import { Language } from '../i18n';
import { randomUUID } from 'expo-crypto';

interface AppState {
  // Config
  language: Language;
  setLanguage: (lang: Language) => void;

  // Auth
  isAuthenticated: boolean;
  login: (name: string) => void;
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
  users: Record<string, User>;

  // Actions
  offerSeat: (
    direction: Direction,
    currentStationId: string,
    handoffStationId: string,
    price: number | undefined,
    trainId: string,
  ) => { ok: boolean; reason?: 'ALREADY_OFFERING' | 'INVALID_STATIONS' };
  cancelOpportunity: (opportunityId: string) => boolean;
  requestSeat: (
    opportunityId: string,
    seekerId: string,
  ) => {
    ok: boolean;
    reason?: 'DUPLICATE' | 'OWN_OFFER' | 'NOT_ACTIVE' | 'NOT_FOUND';
  };
  transition: (matchId: string, actorId: string, to: import('../types').MatchStatus) => boolean;
  acceptMatch: (matchId: string) => boolean;
  rejectMatch: (matchId: string) => boolean;
  cancelMatch: (matchId: string) => boolean;
  completeMatch: (matchId: string) => boolean;
  expireOpportunity: (oppId: string) => void;

  // Queries
  getCompatibleOpportunities: (
    currentStationId: string,
    destinationStationId: string,
    direction: Direction,
  ) => SeatOpportunity[];
  getActiveMatchesForUser: (userId: string) => Match[];
  getMyOpportunity: (userId: string) => SeatOpportunity | undefined;
}

// Seed user
const MOCK_USER: User = {
  id: 'u1',
  displayName: 'Current User',
  reputation: 4.8,
};

const INITIAL_DATA = {
  isAuthenticated: false,
  currentUser: MOCK_USER,
  upiId: null,
  upiQrUri: null,
  opportunities: [],
  matches: [],
  users: {
    u1: { id: 'u1', displayName: 'Mock Giver', reputation: 4.8 },
    mock_seeker_2: { id: 'mock_seeker_2', displayName: 'Mock Seeker', reputation: 4.5 },
  },
};

const TRANSITIONS: Record<MatchStatus, MatchStatus[]> = {
  PENDING: ['ACCEPTED', 'REJECTED', 'CANCELLED'],
  ACCEPTED: ['COMPLETED', 'CANCELLED'],
  REJECTED: [],
  COMPLETED: [],
  CANCELLED: [],
};

export const useAppStore = create<AppState>((set, get) => ({
  // Config
  language: 'en',
  setLanguage: (lang) => set({ language: lang }),

  ...INITIAL_DATA,

  login: (name: string) =>
    set((state) => {
      const me: User = { id: 'u_me', displayName: name, reputation: 0 };
      return {
        isAuthenticated: true,
        currentUser: me,
        users: { ...state.users, [me.id]: me },
      };
    }),
  logout: () => set(INITIAL_DATA),
  // User Profile
  setUpiId: (id) => set({ upiId: id }),
  setUpiQrUri: (uri) => set({ upiQrUri: uri }),

  offerSeat: (direction, currentStationId, handoffStationId, price, trainId) => {
    let result: {
      ok: boolean;
      reason?: 'ALREADY_OFFERING' | 'INVALID_STATIONS';
    } = { ok: false };
    set((state) => {
      const existingOffer = state.opportunities.find(
        (o) =>
          o.giverId === state.currentUser.id && (o.status === 'ACTIVE' || o.status === 'MATCHED'),
      );
      if (existingOffer) {
        result = { ok: false, reason: 'ALREADY_OFFERING' };
        return state;
      }
      if (!isLegValid(currentStationId, handoffStationId, direction)) {
        result = { ok: false, reason: 'INVALID_STATIONS' };
        return state;
      }

      const now = Date.now();
      const allTrains = trainsData as unknown as Train[];
      const train = allTrains.find(t => t.id === trainId);
      const expiry = train ? handoffExpiry(train, handoffStationId, now) : (now + 3600000);
      
      const newOpp: SeatOpportunity = {
        id: randomUUID(),
        giverId: state.currentUser.id,
        direction,
        currentStationId,
        handoffStationId,
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now,
        expiresAt: expiry || (now + 3600000),
        price,
        trainId,
      };
      result = { ok: true };
      return { opportunities: [...state.opportunities, newOpp] };
    });
    return result;
  },

  cancelOpportunity: (opportunityId) => {
    let success = false;
    set((state) => {
      const opp = state.opportunities.find((o) => o.id === opportunityId);
      if (!opp || opp.giverId !== state.currentUser.id || opp.status !== 'ACTIVE') return state;

      success = true;
      return {
        opportunities: state.opportunities.map((o) =>
          o.id === opportunityId ? { ...o, status: 'CANCELLED' } : o,
        ),
        matches: state.matches.map((m) =>
          m.opportunityId === opportunityId && (m.status === 'PENDING' || m.status === 'ACCEPTED')
            ? { ...m, status: 'CANCELLED', cancelledBy: state.currentUser.id }
            : m,
        ),
      };
    });
    return success;
  },

  requestSeat: (opportunityId, seekerId) => {
    let result: {
      ok: boolean;
      reason?: 'DUPLICATE' | 'OWN_OFFER' | 'NOT_ACTIVE' | 'NOT_FOUND';
    } = { ok: false, reason: 'NOT_FOUND' };

    set((state) => {
      const opp = state.opportunities.find((o) => o.id === opportunityId);
      if (!opp) {
        result = { ok: false, reason: 'NOT_FOUND' };
        return state;
      }
      if (opp.status !== 'ACTIVE') {
        result = { ok: false, reason: 'NOT_ACTIVE' };
        return state;
      }
      if (opp.giverId === seekerId) {
        result = { ok: false, reason: 'OWN_OFFER' };
        return state;
      }

      const existingPending = state.matches.find(
        (m) =>
          m.opportunityId === opportunityId && m.seekerId === seekerId && m.status === 'PENDING',
      );
      if (existingPending) {
        result = { ok: false, reason: 'DUPLICATE' };
        return state;
      }

      result = { ok: true };
      const newMatch: Match = {
        id: randomUUID(),
        opportunityId,
        seekerId,
        giverId: opp.giverId,
        status: 'PENDING',
        createdAt: Date.now(),
      };

      return { matches: [...state.matches, newMatch] };
    });
    return result;
  },

  transition: (matchId: string, actorId: string, to: MatchStatus): boolean => {
    const state = get();
    const m = state.matches.find((x) => x.id === matchId);

    if (!m || !TRANSITIONS[m.status].includes(to)) return false;

    const isGiver = actorId === m.giverId;
    const isSeeker = actorId === m.seekerId;

    const allowed =
      to === 'ACCEPTED' || to === 'REJECTED'
        ? isGiver
        : to === 'CANCELLED'
          ? isGiver || isSeeker
          : isGiver; // COMPLETED: decided by giver for MVP

    if (!allowed) return false;

    set((s) => ({
      matches: s.matches.map((x) =>
        x.id === matchId
          ? {
              ...x,
              status: to,
              ...(to === 'CANCELLED' ? { cancelledBy: actorId } : {}),
            }
          : to === 'ACCEPTED' && x.opportunityId === m.opportunityId && x.status === 'PENDING'
            ? { ...x, status: 'REJECTED' }
            : x,
      ),
      opportunities: s.opportunities.map((o) => {
        if (o.id !== m.opportunityId) return o;
        if (to === 'ACCEPTED') return { ...o, status: 'MATCHED' };
        if (to === 'COMPLETED') return { ...o, status: 'COMPLETED' };
        if (to === 'CANCELLED' && m.status === 'ACCEPTED') {
          if (actorId === m.giverId) {
            return { ...o, status: 'CANCELLED' };
          } else {
            return {
              ...o,
              status: Date.now() > o.expiresAt ? 'EXPIRED' : 'ACTIVE',
            };
          }
        }
        return o;
      }),
    }));
    return true;
  },

  acceptMatch: (matchId) => get().transition(matchId, get().currentUser.id, 'ACCEPTED'),
  rejectMatch: (matchId) => get().transition(matchId, get().currentUser.id, 'REJECTED'),
  cancelMatch: (matchId) => get().transition(matchId, get().currentUser.id, 'CANCELLED'),
  completeMatch: (matchId) => get().transition(matchId, get().currentUser.id, 'COMPLETED'),

  expireOpportunity: (oppId) =>
    set((state) => {
      return {
        opportunities: state.opportunities.map((o) =>
          o.id === oppId ? { ...o, status: 'EXPIRED' } : o,
        ),
      };
    }),

  getCompatibleOpportunities: (currentStationId, destinationStationId, direction) => {
    const state = get();
    const now = Date.now();
    const activeTrains = trainsRunningNow(direction, currentStationId, destinationStationId, now, trainsData as unknown as Train[]);
    const activeTrainIds = new Set(activeTrains.map(t => t.id));

    return state.opportunities.filter((opp) => {
      if (opp.status !== 'ACTIVE') return false;
      if (opp.direction !== direction) return false;
      if (opp.giverId === state.currentUser.id) return false;
      if (now > opp.expiresAt) return false;
      if (!activeTrainIds.has(opp.trainId)) return false;

      // Handoff station must be AFTER seeker's current station (or same)
      const handoffAfterCurrent =
        opp.handoffStationId === currentStationId ||
        isLegValid(currentStationId, opp.handoffStationId, direction);

      // Handoff station must be strictly BEFORE seeker's destination
      const handoffBeforeDest = isLegValid(opp.handoffStationId, destinationStationId, direction);

      return handoffAfterCurrent && handoffBeforeDest;
    });
  },

  getActiveMatchesForUser: (userId) => {
    const state = get();
    return state.matches.filter(
      (m) =>
        (m.seekerId === userId || m.giverId === userId) &&
        (m.status === 'PENDING' || m.status === 'ACCEPTED'),
    );
  },

  getMyOpportunity: (userId) => {
    const state = get();
    return state.opportunities.find(
      (o) => o.giverId === userId && (o.status === 'ACTIVE' || o.status === 'MATCHED'),
    );
  },
}));
