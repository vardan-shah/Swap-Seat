import { create } from 'zustand';
import { SeatOpportunity, Match, User, Direction, MatchStatus, Result, SeatType } from '../types';
import { isLegValid } from '../domain/route';
import { checkOffer, servesLeg, boardingStillAhead } from '../domain/trains';
import { reconcile } from '../domain/offers';
import { now as clockNow } from '../utils/clock';
import { trains as trainsData } from '../data/trains';
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
    seatType: SeatType,
    coach: number,
  ) => Result;
  cancelOpportunity: (opportunityId: string) => Result;
  reconcile: () => void;
  requestSeat: (opportunityId: string, seekerId: string, seekerBoardingStationId: string) => Result;
  transition: (matchId: string, actorId: string, to: MatchStatus) => Result;
  acceptMatch: (matchId: string) => Result;
  rejectMatch: (matchId: string) => Result;
  cancelMatch: (matchId: string) => Result;
  completeMatch: (matchId: string) => Result;
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

export const COACHES_PER_TRAIN = 3;

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

  offerSeat: (
    direction,
    currentStationId,
    handoffStationId,
    price,
    trainId,
    seatType,
    coach,
  ): Result => {
    let result: Result = { ok: true };
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
      if (seatType === 'PRIORITY') {
        result = { ok: false, reason: 'PRIORITY_SEAT' };
        return state;
      }
      if (coach < 1 || coach > COACHES_PER_TRAIN) {
        result = { ok: false, reason: 'INVALID_COACH' };
        return state;
      }

      const now = clockNow();
      const allTrains = trainsData;

      const validation = checkOffer(
        trainId,
        direction,
        currentStationId,
        handoffStationId,
        now,
        allTrains,
      );
      if (!validation.ok) {
        result = { ok: false, reason: validation.reason };
        return state;
      }

      const newOpp: SeatOpportunity = {
        id: randomUUID(),
        giverId: state.currentUser.id,
        direction,
        currentStationId,
        handoffStationId,
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now,
        expiresAt: validation.expiresAt,
        price,
        trainId,
        seatType,
        coach,
      };
      result = { ok: true };
      return { opportunities: [...state.opportunities, newOpp] };
    });
    return result;
  },

  reconcile: () => {
    set((state) => {
      const res = reconcile(state.opportunities, state.matches, clockNow());
      if (res.opportunities !== state.opportunities) {
        return { opportunities: res.opportunities, matches: res.matches };
      }
      return {};
    });
  },
  cancelOpportunity: (opportunityId): Result => {
    let result: Result = { ok: true };
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
      if (opp.giverId !== state.currentUser.id) {
        result = { ok: false, reason: 'NOT_ALLOWED' };
        return state;
      }

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
    return result;
  },

  requestSeat: (opportunityId, seekerId, seekerBoardingStationId): Result => {
    let result: Result = { ok: false, reason: 'NOT_FOUND' };

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
      if (clockNow() > opp.expiresAt) {
        result = { ok: false, reason: 'EXPIRED' };
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
        seekerBoardingStationId,
        status: 'PENDING',
        createdAt: clockNow(),
      };

      return { matches: [...state.matches, newMatch] };
    });
    return result;
  },

  transition: (matchId: string, actorId: string, to: MatchStatus): Result => {
    const state = get();
    const m = state.matches.find((x) => x.id === matchId);

    if (!m) return { ok: false, reason: 'NOT_FOUND' };
    if (!TRANSITIONS[m.status].includes(to)) return { ok: false, reason: 'ILLEGAL_TRANSITION' };

    const isGiver = actorId === m.giverId;
    const isSeeker = actorId === m.seekerId;

    const allowed =
      to === 'ACCEPTED' || to === 'REJECTED'
        ? isGiver
        : to === 'CANCELLED'
          ? isGiver || isSeeker
          : isGiver; // COMPLETED: decided by giver for MVP

    if (!allowed) return { ok: false, reason: 'NOT_ALLOWED' };

    const opp = state.opportunities.find((o) => o.id === m.opportunityId);
    if (to === 'ACCEPTED' && opp && clockNow() > opp.expiresAt) {
      return { ok: false, reason: 'EXPIRED' };
    }

    set((s) => ({
      matches: s.matches.map((x) =>
        x.id === matchId
          ? {
              ...x,
              status: to,
              ...(to === 'CANCELLED' ? { cancelledBy: actorId } : {}),
              ...(to === 'ACCEPTED'
                ? { handoffCode: Math.floor(1000 + Math.random() * 9000).toString() }
                : {}),
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
              status: clockNow() > o.expiresAt ? 'EXPIRED' : 'ACTIVE',
            };
          }
        }
        return o;
      }),
    }));
    return { ok: true };
  },

  acceptMatch: (matchId): Result => get().transition(matchId, get().currentUser.id, 'ACCEPTED'),
  rejectMatch: (matchId): Result => get().transition(matchId, get().currentUser.id, 'REJECTED'),
  cancelMatch: (matchId): Result => get().transition(matchId, get().currentUser.id, 'CANCELLED'),
  completeMatch: (matchId): Result => get().transition(matchId, get().currentUser.id, 'COMPLETED'),

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
    const now = clockNow();
    const allTrains = trainsData;

    return state.opportunities.filter((opp) => {
      if (opp.status !== 'ACTIVE') return false;
      if (opp.direction !== direction) return false;
      if (opp.giverId === state.currentUser.id) return false;
      if (now > opp.expiresAt) return false;
      const train = allTrains.find((t) => t.id === opp.trainId);
      if (!train) return false;
      if (!servesLeg(train, currentStationId, destinationStationId)) return false;
      if (!boardingStillAhead(train, currentStationId, now)) return false;

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
