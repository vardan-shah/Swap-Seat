import { useAppStore } from '../mockStore';
import { SeatOpportunity, Match, User } from '../../types';

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

describe('mockStore', () => {
  describe('login', () => {
    it('sets currentUser and adds them to users map with 0 reputation', () => {
      useAppStore.getState().login('New User');
      const state = useAppStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.currentUser.displayName).toBe('New User');
      expect(state.currentUser.reputation).toBe(0);
      expect(state.users['u_me']).toBeDefined();
      expect(state.users['u_me'].displayName).toBe('New User');
      expect(state.users['u_me'].reputation).toBe(0);
    });
  });

  const initialState = useAppStore.getState();

  afterEach(() => {
    jest.useRealTimers();
  });

  // Set T0 to midnight IST of whatever today is
  const T0 = new Date();
  T0.setUTCHours(18, 30, 0, 0); // 18:30 UTC = 00:00 IST the next day, close enough for a fixed base
  const ist = (hhmm: string) => {
    const [h, m] = hhmm.split(':').map(Number);
    return T0.getTime() + (h * 60 + m) * 60000;
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(ist('12:00')); // default to noon
  });

  beforeEach(() => {
    useAppStore.setState(initialState, true);
    useAppStore.setState({
      opportunities: [],
      matches: [],
      currentUser: { id: 'u1', displayName: 'TestUser', reputation: 5.0 },
    });
  });

  describe('offerSeat', () => {
    beforeEach(() => {
      // 06:15 IST = 45 * 60000 = 2700000 UTC
      jest.setSystemTime(ist('06:48'));
    });
    afterEach(() => {
      jest.useRealTimers();
    });

    it('creates a valid Northbound offer', () => {
      const res = useAppStore
        .getState()
        .offerSeat('Northbound', 'sabarmati', 'motera-stadium', undefined, 'NB-0620-RYMM');
      expect(res.ok).toBe(true);
      expect(useAppStore.getState().opportunities[0]).toMatchObject({
        currentStationId: 'sabarmati',
        handoffStationId: 'motera-stadium',
        direction: 'Northbound',
        status: 'ACTIVE',
        trainId: 'NB-0620-RYMM',
      });
    });

    it('creates a valid Southbound offer', () => {
      // For Southbound, let's use 06:40 IST = 70 * 60000 = 4200000 UTC for SB-0640-RYMM
      jest.setSystemTime(ist('07:30'));
      const res = useAppStore
        .getState()
        .offerSeat('Southbound', 'motera-stadium', 'sabarmati', undefined, 'SB-0640-RYMM');
      expect(res.ok).toBe(true);
      expect(useAppStore.getState().opportunities[0]).toMatchObject({
        currentStationId: 'motera-stadium',
        handoffStationId: 'sabarmati',
        direction: 'Southbound',
        status: 'ACTIVE',
        trainId: 'SB-0640-RYMM',
      });
    });

    it('rejects INVALID_STATIONS when handoff is before current', () => {
      const res = useAppStore
        .getState()
        .offerSeat('Northbound', 'motera-stadium', 'sabarmati', undefined, 'NB-0620-RYMM');
      expect(res.ok).toBe(false);
      if (!res.ok) expect(res.reason).toBe('INVALID_STATIONS');
    });

    it('rejects UNKNOWN_TRAIN when train does not exist', () => {
      const res = useAppStore
        .getState()
        .offerSeat('Northbound', 'sabarmati', 'motera-stadium', undefined, 'train1');
      expect(res.ok).toBe(false);
      if (!res.ok) expect(res.reason).toBe('UNKNOWN_TRAIN');
    });

    it('rejects ALREADY_OFFERING and leaves state unchanged', () => {
      useAppStore.setState({
        opportunities: [
          {
            id: 'opp1',
            giverId: 'u1',
            direction: 'Northbound',
            status: 'ACTIVE',
          } as SeatOpportunity,
        ],
      });
      const res = useAppStore
        .getState()
        .offerSeat('Northbound', 'sabarmati', 'motera-stadium', undefined, 'NB-0620-RYMM');
      expect(res.ok).toBe(false);
      if (!res.ok) expect(res.reason).toBe('ALREADY_OFFERING');
      expect(useAppStore.getState().opportunities).toHaveLength(1);
    });
  });

  describe('getCompatibleOpportunities', () => {
    const seeker = { id: 'u3', displayName: 'Me', reputation: 0 };
    const opp = (o: Partial<SeatOpportunity>) =>
      ({
        id: 'opp1',
        giverId: 'u2',
        status: 'ACTIVE',
        direction: 'Northbound',
        ...o,
      }) as SeatOpportunity;
    const find = (from: string, to: string) =>
      useAppStore.getState().getCompatibleOpportunities(from, to, 'Northbound');

    afterEach(() => {
      jest.useRealTimers();
    });

    it('matches valid Northbound offer', () => {
      jest.setSystemTime(ist('06:28'));
      useAppStore.setState({
        currentUser: seeker,
        opportunities: [
          opp({
            trainId: 'NB-0620-RYMM',
            currentStationId: 'vadaj',
            handoffStationId: 'sabarmati',
            expiresAt: ist('06:54'),
          }),
        ],
      });
      expect(find('ranip', 'motera-stadium')).toHaveLength(1);
    });

    it('own offer excluded', () => {
      jest.setSystemTime(ist('06:28'));
      useAppStore.setState({
        currentUser: seeker,
        opportunities: [
          opp({
            giverId: 'u3',
            trainId: 'NB-0620-RYMM',
            currentStationId: 'vadaj',
            handoffStationId: 'sabarmati',
            expiresAt: ist('06:54'),
          }),
        ],
      });
      expect(find('ranip', 'motera-stadium')).toHaveLength(0);
    });

    it('expired offer excluded', () => {
      jest.setSystemTime(ist('06:28'));
      useAppStore.setState({
        currentUser: seeker,
        opportunities: [
          opp({
            trainId: 'NB-0620-RYMM',
            currentStationId: 'vadaj',
            handoffStationId: 'sabarmati',
            expiresAt: ist('06:20'),
          }),
        ],
      }); // Expired at 06:20 (past), but train at 06:28 has not reached boarding yet (so boardingStillAhead is true)
      expect(find('ranip', 'motera-stadium')).toHaveLength(0);
    });

    it('no match when handoff is after destination', () => {
      jest.setSystemTime(ist('06:28'));
      useAppStore.setState({
        currentUser: seeker,
        opportunities: [
          opp({
            trainId: 'NB-0620-RYMM',
            currentStationId: 'vadaj',
            handoffStationId: 'sabarmati',
            expiresAt: ist('06:54'),
          }),
        ],
      });
      expect(find('usmanpura', 'ranip')).toHaveLength(0); // only the destination rule can exclude this
    });

    it('no match when handoff is before boarding', () => {
      jest.setSystemTime(ist('06:28'));
      useAppStore.setState({
        currentUser: seeker,
        opportunities: [
          opp({
            trainId: 'NB-0620-RYMM',
            currentStationId: 'vadaj',
            handoffStationId: 'sabarmati',
            expiresAt: ist('06:54'),
          }),
        ],
      });
      expect(find('motera-stadium', 'koteshwar-road')).toHaveLength(0);
    });

    it('matches when handoff equals boarding station (boundary)', () => {
      jest.setSystemTime(ist('06:48'));
      useAppStore.setState({
        currentUser: seeker,
        opportunities: [
          opp({
            trainId: 'NB-0620-RYMM',
            currentStationId: 'vadaj',
            handoffStationId: 'sabarmati',
            expiresAt: ist('06:54'),
          }),
        ],
      });
      expect(find('sabarmati', 'motera-stadium')).toHaveLength(1);
    });

    it('no match when handoff equals destination', () => {
      jest.setSystemTime(ist('06:28'));
      useAppStore.setState({
        currentUser: seeker,
        opportunities: [
          opp({
            trainId: 'NB-0620-RYMM',
            currentStationId: 'vadaj',
            handoffStationId: 'sabarmati',
            expiresAt: ist('06:54'),
          }),
        ],
      });
      expect(find('ranip', 'sabarmati')).toHaveLength(0);
    });

    it("excludes an offer once its train has passed the seeker's boarding station", () => {
      useAppStore.setState({
        currentUser: seeker,
        opportunities: [
          opp({
            trainId: 'NB-0620-RYMM',
            currentStationId: 'vadaj',
            handoffStationId: 'motera-stadium',
            expiresAt: ist('06:54'),
          }),
        ],
      });
      jest.setSystemTime(ist('06:46')); // Ranip window closes 06:47
      expect(find('ranip', 'koteshwar-road')).toHaveLength(1);
      jest.setSystemTime(ist('06:48'));
      expect(find('ranip', 'koteshwar-road')).toHaveLength(0);
    });

    it.each([
      ['NB-0658-RYMM', 1, ist('07:50')], // control: stops at both GNLU and Raysan
      ['NB-0645-RYVGIFT', 0, ist('07:38')], // GIFT train never stops at Raysan
    ])('seeker gnlu→raysan with %s gives %i match(es)', (trainId, expected, expiresAt) => {
      jest.setSystemTime(ist('07:30'));
      useAppStore.setState({
        currentUser: seeker,
        opportunities: [
          opp({
            trainId,
            currentStationId: 'koba-gam',
            handoffStationId: 'gnlu',
            expiresAt,
          }),
        ],
      });
      expect(find('gnlu', 'raysan')).toHaveLength(expected);
    });

    it('matches valid Southbound offer', () => {
      jest.setSystemTime(ist('07:30'));
      useAppStore.setState({
        currentUser: seeker,
        opportunities: [
          opp({
            direction: 'Southbound',
            trainId: 'SB-0640-RYMM',
            currentStationId: 'aec',
            handoffStationId: 'vadaj',
            expiresAt: ist('07:44'),
          }),
        ],
      });
      const matches = useAppStore
        .getState()
        .getCompatibleOpportunities('aec', 'usmanpura', 'Southbound');
      expect(matches).toHaveLength(1);
    });
  });

  describe('requestSeat', () => {
    it('rejects request for an EXPIRED opportunity', () => {
      const o: SeatOpportunity = {
        id: 'o1',
        giverId: 'u1',
        status: 'ACTIVE',
        direction: 'Northbound',
        trainId: 't1',
        currentStationId: 's1',
        handoffStationId: 's2',
        expiresAt: ist('06:30'),
        createdAt: ist('06:00'),
        updatedAt: ist('06:00'),
      };
      useAppStore.setState({
        opportunities: [o],
        currentUser: { id: 'u2', displayName: 'Seeker', reputation: 4.8 } as User,
        matches: [],
      });
      jest.setSystemTime(ist('06:31'));

      const { requestSeat } = useAppStore.getState();
      const res = requestSeat('o1', 'u2');
      expect(res).toEqual({ ok: false, reason: 'EXPIRED' });
      expect(useAppStore.getState().matches).toHaveLength(0);
    });

    it('creates a PENDING match when requesting an ACTIVE opportunity', () => {
      useAppStore.setState({
        opportunities: [
          {
            id: 'opp1',
            giverId: 'giver1',
            status: 'ACTIVE',
            trainId: 'NB-0620-RYMM',
            expiresAt: ist('20:00'),
          } as SeatOpportunity,
        ],
      });
      const res = useAppStore.getState().requestSeat('opp1', 'seeker1');
      expect(res.ok).toBe(true);
      const matches = useAppStore.getState().matches;
      expect(matches.length).toBe(1);
      expect(matches[0].status).toBe('PENDING');
    });

    it('rejects duplicate requests', () => {
      useAppStore.setState({
        opportunities: [
          {
            id: 'opp1',
            giverId: 'giver1',
            status: 'ACTIVE',
            trainId: 'NB-0620-RYMM',
            expiresAt: ist('20:00'),
          } as SeatOpportunity,
        ],
        matches: [
          {
            id: 'm1',
            opportunityId: 'opp1',
            seekerId: 'seeker1',
            giverId: 'giver1',
            status: 'PENDING',
          } as Match,
        ],
      });
      const res = useAppStore.getState().requestSeat('opp1', 'seeker1');
      expect(res.ok).toBe(false);
      if (!res.ok) expect(res.reason).toBe('DUPLICATE');
    });

    it('rejects request for own offer', () => {
      useAppStore.setState({
        opportunities: [
          {
            id: 'opp1',
            giverId: 'seeker1',
            status: 'ACTIVE',
            trainId: 'NB-0620-RYMM',
            expiresAt: ist('20:00'),
          } as SeatOpportunity,
        ],
      });
      const res = useAppStore.getState().requestSeat('opp1', 'seeker1');
      expect(res.ok).toBe(false);
      if (!res.ok) expect(res.reason).toBe('OWN_OFFER');
    });

    it('rejects request for non-ACTIVE opportunity', () => {
      useAppStore.setState({
        opportunities: [
          {
            id: 'opp1',
            giverId: 'giver1',
            status: 'MATCHED',
          } as SeatOpportunity,
        ],
      });
      const res = useAppStore.getState().requestSeat('opp1', 'seeker1');
      expect(res.ok).toBe(false);
      if (!res.ok) expect(res.reason).toBe('NOT_ACTIVE');
    });
    it('rejects request for unknown opportunity', () => {
      useAppStore.setState({ opportunities: [] });
      const res = useAppStore.getState().requestSeat('opp99', 'seeker1');
      expect(res.ok).toBe(false);
      if (!res.ok) expect(res.reason).toBe('NOT_FOUND');
    });
  });

  describe('cancelOpportunity', () => {
    it('cascades cancellation to PENDING matches and sets cancelledBy', () => {
      useAppStore.setState({
        currentUser: { id: 'giver1', displayName: 'Giver', reputation: 5.0 },
        opportunities: [
          {
            id: 'opp1',
            giverId: 'giver1',
            status: 'ACTIVE',
            trainId: 'NB-0620-RYMM',
            expiresAt: ist('20:00'),
          } as SeatOpportunity,
        ],
        matches: [
          {
            id: 'm1',
            opportunityId: 'opp1',
            giverId: 'giver1',
            seekerId: 's1',
            status: 'PENDING',
          } as Match,
          {
            id: 'm3',
            opportunityId: 'opp1',
            giverId: 'giver1',
            seekerId: 's3',
            status: 'REJECTED',
          } as Match,
        ],
      });
      const success = useAppStore.getState().cancelOpportunity('opp1');
      expect(success).toEqual({ ok: true });
      const state = useAppStore.getState();
      expect(state.opportunities[0].status).toBe('CANCELLED');

      const m1 = state.matches.find((m) => m.id === 'm1')!;
      expect(m1.status).toBe('CANCELLED');
      expect(m1.cancelledBy).toBe('giver1');

      const m3 = state.matches.find((m) => m.id === 'm3')!;
      expect(m3.status).toBe('REJECTED'); // Unaffected
    });

    it('allows withdrawing when no one has requested', () => {
      useAppStore.setState({
        currentUser: { id: 'giver1', displayName: 'Giver', reputation: 5.0 },
        opportunities: [
          {
            id: 'opp1',
            giverId: 'giver1',
            status: 'ACTIVE',
            trainId: 'NB-0620-RYMM',
            expiresAt: ist('20:00'),
          } as SeatOpportunity,
        ],
        matches: [],
      });
      const success = useAppStore.getState().cancelOpportunity('opp1');
      expect(success).toEqual({ ok: true });
      expect(useAppStore.getState().opportunities[0].status).toBe('CANCELLED');
    });

    it('prevents withdrawing by non-owner', () => {
      useAppStore.setState({
        currentUser: {
          id: 'some_other_guy',
          displayName: 'Other',
          reputation: 5.0,
        },
        opportunities: [
          {
            id: 'opp1',
            giverId: 'giver1',
            status: 'ACTIVE',
            trainId: 'NB-0620-RYMM',
            expiresAt: ist('20:00'),
          } as SeatOpportunity,
        ],
        matches: [],
      });
      const success = useAppStore.getState().cancelOpportunity('opp1');
      expect(success.ok).toBe(false);
      expect(useAppStore.getState().opportunities[0].status).toBe('ACTIVE');
    });

    it('prevents withdrawing non-ACTIVE offer', () => {
      useAppStore.setState({
        currentUser: { id: 'giver1', displayName: 'Giver', reputation: 5.0 },
        opportunities: [
          {
            id: 'opp1',
            giverId: 'giver1',
            status: 'COMPLETED',
          } as SeatOpportunity,
        ],
        matches: [],
      });
      const success = useAppStore.getState().cancelOpportunity('opp1');
      expect(success.ok).toBe(false);
      expect(useAppStore.getState().opportunities[0].status).toBe('COMPLETED');
    });
  });

  describe('transition', () => {
    it('rejects ACCEPT for an expired opportunity', () => {
      const o: SeatOpportunity = {
        id: 'o1',
        giverId: 'u1',
        status: 'ACTIVE',
        direction: 'Northbound',
        trainId: 't1',
        currentStationId: 's1',
        handoffStationId: 's2',
        expiresAt: ist('06:30'),
        createdAt: ist('06:00'),
        updatedAt: ist('06:00'),
      };
      const m: Match = {
        id: 'm1',
        opportunityId: 'o1',
        giverId: 'u1',
        seekerId: 'u2',
        status: 'PENDING',
        createdAt: ist('06:29'),
      };
      useAppStore.setState({
        opportunities: [o],
        matches: [m],
        currentUser: { id: 'u1', displayName: 'Giver', reputation: 4.8 } as User,
      });
      jest.setSystemTime(ist('06:31'));

      const { transition } = useAppStore.getState();
      const res = transition('m1', 'u1', 'ACCEPTED');
      expect(res).toEqual({ ok: false, reason: 'EXPIRED' });
      expect(useAppStore.getState().matches[0].status).toBe('PENDING'); // no change
    });

    it('allows giver to ACCEPT and auto-rejects siblings', () => {
      useAppStore.setState({
        currentUser: { id: 'giver1', displayName: 'Giver', reputation: 5.0 },
        opportunities: [
          {
            id: 'opp1',
            giverId: 'giver1',
            status: 'ACTIVE',
            trainId: 'NB-0620-RYMM',
            expiresAt: ist('20:00'),
          } as SeatOpportunity,
        ],
        matches: [
          {
            id: 'm1',
            opportunityId: 'opp1',
            giverId: 'giver1',
            seekerId: 's1',
            status: 'PENDING',
          } as Match,
          {
            id: 'm2',
            opportunityId: 'opp1',
            giverId: 'giver1',
            seekerId: 's2',
            status: 'PENDING',
          } as Match,
        ],
      });
      const success = useAppStore.getState().acceptMatch('m1');
      expect(success).toEqual({ ok: true });
      const state = useAppStore.getState();
      expect(state.opportunities[0].status).toBe('MATCHED');
      expect(state.matches.find((m) => m.id === 'm1')?.status).toBe('ACCEPTED');
      expect(state.matches.find((m) => m.id === 'm2')?.status).toBe('REJECTED');
    });

    it('allows giver to REJECT a match', () => {
      useAppStore.setState({
        currentUser: { id: 'giver1', displayName: 'Giver', reputation: 5.0 },
        opportunities: [
          {
            id: 'opp1',
            giverId: 'giver1',
            status: 'ACTIVE',
            trainId: 'NB-0620-RYMM',
            expiresAt: ist('20:00'),
          } as SeatOpportunity,
        ],
        matches: [
          {
            id: 'm1',
            opportunityId: 'opp1',
            giverId: 'giver1',
            seekerId: 's1',
            status: 'PENDING',
          } as Match,
        ],
      });
      const success = useAppStore.getState().rejectMatch('m1');
      expect(success).toEqual({ ok: true });
      expect(useAppStore.getState().matches[0].status).toBe('REJECTED');
      expect(useAppStore.getState().opportunities[0].status).toBe('ACTIVE'); // Remains active
    });

    it('prevents seeker from ACCEPTING a match', () => {
      useAppStore.setState({
        opportunities: [
          {
            id: 'opp1',
            giverId: 'giver1',
            status: 'ACTIVE',
            trainId: 'NB-0620-RYMM',
            expiresAt: ist('20:00'),
          } as SeatOpportunity,
        ],
        matches: [
          {
            id: 'm1',
            opportunityId: 'opp1',
            giverId: 'giver1',
            seekerId: 's1',
            status: 'PENDING',
          } as Match,
        ],
      });
      const success = useAppStore.getState().transition('m1', 's1', 'ACCEPTED');
      expect(success.ok).toBe(false);
      expect(useAppStore.getState().matches[0].status).toBe('PENDING'); // Unchanged
    });

    it('reopens the seat when an ACCEPTED match is CANCELLED by seeker and seat is not expired', () => {
      useAppStore.setState({
        opportunities: [
          {
            id: 'opp1',
            giverId: 'giver1',
            status: 'MATCHED',
            expiresAt: Date.now() + 10000,
          } as SeatOpportunity,
        ],
        matches: [
          {
            id: 'm1',
            opportunityId: 'opp1',
            giverId: 'giver1',
            seekerId: 's1',
            status: 'ACCEPTED',
          } as Match,
        ],
      });
      const success = useAppStore.getState().transition('m1', 's1', 'CANCELLED');
      expect(success).toEqual({ ok: true });
      expect(useAppStore.getState().opportunities[0].status).toBe('ACTIVE');
    });

    it('expires the seat when an ACCEPTED match is CANCELLED by seeker and seat is expired', () => {
      const now = Date.now();

      useAppStore.setState({
        opportunities: [
          {
            id: 'opp1',
            giverId: 'giver1',
            status: 'MATCHED',
            expiresAt: now - 10000,
          } as SeatOpportunity,
        ],
        matches: [
          {
            id: 'm1',
            opportunityId: 'opp1',
            giverId: 'giver1',
            seekerId: 's1',
            status: 'ACCEPTED',
          } as Match,
        ],
      });

      jest.setSystemTime(now);
      const success = useAppStore.getState().transition('m1', 's1', 'CANCELLED');
      expect(success).toEqual({ ok: true });
      expect(useAppStore.getState().opportunities[0].status).toBe('EXPIRED');
    });

    it('cancels the seat when an ACCEPTED match is CANCELLED by giver', () => {
      useAppStore.setState({
        opportunities: [
          {
            id: 'opp1',
            giverId: 'giver1',
            status: 'MATCHED',
          } as SeatOpportunity,
        ],
        matches: [
          {
            id: 'm1',
            opportunityId: 'opp1',
            giverId: 'giver1',
            seekerId: 's1',
            status: 'ACCEPTED',
          } as Match,
        ],
      });
      const success = useAppStore.getState().transition('m1', 'giver1', 'CANCELLED');
      expect(success).toEqual({ ok: true });
      expect(useAppStore.getState().opportunities[0].status).toBe('CANCELLED');
    });

    it('prevents seeker from completing a match', () => {
      useAppStore.setState({
        opportunities: [
          {
            id: 'opp1',
            giverId: 'giver1',
            status: 'MATCHED',
          } as SeatOpportunity,
        ],
        matches: [
          {
            id: 'm1',
            opportunityId: 'opp1',
            giverId: 'giver1',
            seekerId: 's1',
            status: 'ACCEPTED',
          } as Match,
        ],
      });
      const success = useAppStore.getState().transition('m1', 's1', 'COMPLETED');
      expect(success.ok).toBe(false);
      expect(useAppStore.getState().matches[0].status).toBe('ACCEPTED'); // Unchanged
    });

    it('allows giver to complete a match and completes opportunity', () => {
      useAppStore.setState({
        currentUser: { id: 'giver1', displayName: 'Giver', reputation: 5.0 },
        opportunities: [
          {
            id: 'opp1',
            giverId: 'giver1',
            status: 'MATCHED',
          } as SeatOpportunity,
        ],
        matches: [
          {
            id: 'm1',
            opportunityId: 'opp1',
            giverId: 'giver1',
            seekerId: 's1',
            status: 'ACCEPTED',
          } as Match,
        ],
      });
      const success = useAppStore.getState().transition('m1', 'giver1', 'COMPLETED');
      expect(success).toEqual({ ok: true });
      expect(useAppStore.getState().matches[0].status).toBe('COMPLETED');
      expect(useAppStore.getState().opportunities[0].status).toBe('COMPLETED');
    });

    it('prevents non-participant from cancelling a match', () => {
      useAppStore.setState({
        opportunities: [
          {
            id: 'opp1',
            giverId: 'giver1',
            status: 'MATCHED',
          } as SeatOpportunity,
        ],
        matches: [
          {
            id: 'm1',
            opportunityId: 'opp1',
            giverId: 'giver1',
            seekerId: 's1',
            status: 'ACCEPTED',
          } as Match,
        ],
      });
      const success = useAppStore.getState().transition('m1', 'random_guy', 'CANCELLED');
      expect(success.ok).toBe(false);
      expect(useAppStore.getState().matches[0].status).toBe('ACCEPTED'); // Unchanged
    });
  });

  describe('reconcile', () => {
    it('exactly expiresAt -> still ACTIVE (no cancel)', () => {
      const exp = ist('06:30');
      const opp = {
        id: 'o1',
        giverId: 'u1',
        status: 'ACTIVE',
        direction: 'Northbound',
        trainId: 't1',
        currentStationId: 's1',
        handoffStationId: 's2',
        expiresAt: exp,
        createdAt: exp - 1000,
        updatedAt: exp - 1000,
      } as SeatOpportunity;
      useAppStore.setState({ opportunities: [opp], matches: [] });
      jest.setSystemTime(exp);
      useAppStore.getState().reconcile();
      expect(useAppStore.getState().opportunities[0].status).toBe('ACTIVE');
    });

    it('exactly expiresAt + 1 min -> EXPIRED', () => {
      const exp = ist('06:30');
      const opp = {
        id: 'o1',
        giverId: 'u1',
        status: 'ACTIVE',
        direction: 'Northbound',
        trainId: 't1',
        currentStationId: 's1',
        handoffStationId: 's2',
        expiresAt: exp,
        createdAt: exp - 1000,
        updatedAt: exp - 1000,
      } as SeatOpportunity;
      useAppStore.setState({ opportunities: [opp], matches: [] });
      jest.setSystemTime(exp + 60000); // 1 min past
      useAppStore.getState().reconcile();
      expect(useAppStore.getState().opportunities[0].status).toBe('EXPIRED');
    });

    it('exactly expiresAt + 10 min -> still MATCHED (no cancel)', () => {
      const exp = ist('06:30');
      const opp = {
        id: 'o1',
        giverId: 'u1',
        status: 'MATCHED',
        direction: 'Northbound',
        trainId: 't1',
        currentStationId: 's1',
        handoffStationId: 's2',
        expiresAt: exp,
        createdAt: exp - 1000,
        updatedAt: exp - 1000,
      } as SeatOpportunity;
      const m: Match = {
        id: 'm1',
        opportunityId: 'o1',
        giverId: 'u1',
        seekerId: 'u2',
        status: 'ACCEPTED',
        createdAt: exp - 1000,
      };
      useAppStore.setState({ opportunities: [opp], matches: [m] });
      jest.setSystemTime(exp + 10 * 60000);
      useAppStore.getState().reconcile();
      expect(useAppStore.getState().opportunities[0].status).toBe('MATCHED');
      expect(useAppStore.getState().matches[0].status).toBe('ACCEPTED');
    });

    it('exactly expiresAt + 10 min + 1 sec -> EXPIRED and CANCELLED', () => {
      const exp = ist('06:30');
      const opp = {
        id: 'o1',
        giverId: 'u1',
        status: 'MATCHED',
        direction: 'Northbound',
        trainId: 't1',
        currentStationId: 's1',
        handoffStationId: 's2',
        expiresAt: exp,
        createdAt: exp - 1000,
        updatedAt: exp - 1000,
      } as SeatOpportunity;
      const m: Match = {
        id: 'm1',
        opportunityId: 'o1',
        giverId: 'u1',
        seekerId: 'u2',
        status: 'ACCEPTED',
        createdAt: exp - 1000,
      };
      useAppStore.setState({ opportunities: [opp], matches: [m] });
      jest.setSystemTime(exp + 10 * 60000 + 1000);
      useAppStore.getState().reconcile();
      expect(useAppStore.getState().opportunities[0].status).toBe('EXPIRED');
      expect(useAppStore.getState().matches[0].status).toBe('CANCELLED');
    });
  });

  describe('logout', () => {
    it('resets the state but keeps action functions', () => {
      useAppStore.setState({
        isAuthenticated: true,
        upiId: 'test@upi',
        opportunities: [{ id: '1' } as unknown as import('../../types').SeatOpportunity],
      });
      useAppStore.getState().logout();
      const state = useAppStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.upiId).toBe(null);
      expect(state.opportunities.length).toBe(0);
      expect(typeof state.login).toBe('function'); // Actions are preserved
    });
  });
});
