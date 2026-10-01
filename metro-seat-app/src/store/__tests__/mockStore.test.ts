import { useAppStore } from '../mockStore';
import { SeatOpportunity, Match } from '../../types';
import { describe, it, expect, beforeEach } from '@jest/globals';

describe('mockStore', () => {
  const initialState = useAppStore.getState();

  beforeEach(() => {
    useAppStore.setState(initialState, true);
    useAppStore.setState({
      opportunities: [],
      matches: [],
      currentUser: { id: 'u1', displayName: 'TestUser', reputation: 5.0 },
    });
  });

  describe('requestSeat', () => {
    it('creates a PENDING match when requesting an ACTIVE opportunity', () => {
      useAppStore.setState({ opportunities: [{ id: 'opp1', giverId: 'giver1', status: 'ACTIVE' } as SeatOpportunity] });
      const res = useAppStore.getState().requestSeat('opp1', 'seeker1');
      expect(res.ok).toBe(true);
      const matches = useAppStore.getState().matches;
      expect(matches.length).toBe(1);
      expect(matches[0].status).toBe('PENDING');
    });

    it('rejects duplicate requests', () => {
      useAppStore.setState({
        opportunities: [{ id: 'opp1', giverId: 'giver1', status: 'ACTIVE' } as SeatOpportunity],
        matches: [{ id: 'm1', opportunityId: 'opp1', seekerId: 'seeker1', giverId: 'giver1', status: 'PENDING' } as Match]
      });
      const res = useAppStore.getState().requestSeat('opp1', 'seeker1');
      expect(res.ok).toBe(false);
      expect(res.reason).toBe('DUPLICATE');
    });

    it('rejects request for own offer', () => {
      useAppStore.setState({ opportunities: [{ id: 'opp1', giverId: 'seeker1', status: 'ACTIVE' } as SeatOpportunity] });
      const res = useAppStore.getState().requestSeat('opp1', 'seeker1');
      expect(res.ok).toBe(false);
      expect(res.reason).toBe('OWN_OFFER');
    });

    it('rejects request for non-ACTIVE opportunity', () => {
      useAppStore.setState({ opportunities: [{ id: 'opp1', giverId: 'giver1', status: 'MATCHED' } as SeatOpportunity] });
      const res = useAppStore.getState().requestSeat('opp1', 'seeker1');
      expect(res.ok).toBe(false);
      expect(res.reason).toBe('NOT_ACTIVE');
    });
    it('rejects request for unknown opportunity', () => {
      useAppStore.setState({ opportunities: [] });
      const res = useAppStore.getState().requestSeat('opp99', 'seeker1');
      expect(res.ok).toBe(false);
      expect(res.reason).toBe('NOT_FOUND');
    });
  });

  describe('cancelOpportunity', () => {
    it('cascades cancellation to PENDING and ACCEPTED matches and sets cancelledBy', () => {
      useAppStore.setState({
        currentUser: { id: 'giver1', displayName: 'Giver', reputation: 5.0 },
        opportunities: [{ id: 'opp1', giverId: 'giver1', status: 'ACTIVE' } as SeatOpportunity],
        matches: [
          { id: 'm1', opportunityId: 'opp1', giverId: 'giver1', seekerId: 's1', status: 'PENDING' } as Match,
          { id: 'm2', opportunityId: 'opp1', giverId: 'giver1', seekerId: 's2', status: 'ACCEPTED' } as Match,
          { id: 'm3', opportunityId: 'opp1', giverId: 'giver1', seekerId: 's3', status: 'REJECTED' } as Match,
        ]
      });
      const success = useAppStore.getState().cancelOpportunity('opp1');
      expect(success).toBe(true);
      const state = useAppStore.getState();
      expect(state.opportunities[0].status).toBe('CANCELLED');
      
      const m1 = state.matches.find(m => m.id === 'm1')!;
      expect(m1.status).toBe('CANCELLED');
      expect(m1.cancelledBy).toBe('giver1');

      const m2 = state.matches.find(m => m.id === 'm2')!;
      expect(m2.status).toBe('CANCELLED');
      expect(m2.cancelledBy).toBe('giver1');

      const m3 = state.matches.find(m => m.id === 'm3')!;
      expect(m3.status).toBe('REJECTED'); // Unaffected
    });

    it('allows withdrawing when no one has requested', () => {
      useAppStore.setState({
        currentUser: { id: 'giver1', displayName: 'Giver', reputation: 5.0 },
        opportunities: [{ id: 'opp1', giverId: 'giver1', status: 'ACTIVE' } as SeatOpportunity],
        matches: []
      });
      const success = useAppStore.getState().cancelOpportunity('opp1');
      expect(success).toBe(true);
      expect(useAppStore.getState().opportunities[0].status).toBe('CANCELLED');
    });
  });

  describe('transition', () => {
    it('allows giver to ACCEPT and auto-rejects siblings', () => {
      useAppStore.setState({
        currentUser: { id: 'giver1', displayName: 'Giver', reputation: 5.0 },
        opportunities: [{ id: 'opp1', giverId: 'giver1', status: 'ACTIVE' } as SeatOpportunity],
        matches: [
          { id: 'm1', opportunityId: 'opp1', giverId: 'giver1', seekerId: 's1', status: 'PENDING' } as Match,
          { id: 'm2', opportunityId: 'opp1', giverId: 'giver1', seekerId: 's2', status: 'PENDING' } as Match
        ]
      });
      const success = useAppStore.getState().acceptMatch('m1');
      expect(success).toBe(true);
      const state = useAppStore.getState();
      expect(state.opportunities[0].status).toBe('MATCHED');
      expect(state.matches.find(m => m.id === 'm1')?.status).toBe('ACCEPTED');
      expect(state.matches.find(m => m.id === 'm2')?.status).toBe('REJECTED');
    });

    it('allows giver to REJECT a match', () => {
      useAppStore.setState({
        currentUser: { id: 'giver1', displayName: 'Giver', reputation: 5.0 },
        opportunities: [{ id: 'opp1', giverId: 'giver1', status: 'ACTIVE' } as SeatOpportunity],
        matches: [{ id: 'm1', opportunityId: 'opp1', giverId: 'giver1', seekerId: 's1', status: 'PENDING' } as Match]
      });
      const success = useAppStore.getState().rejectMatch('m1');
      expect(success).toBe(true);
      expect(useAppStore.getState().matches[0].status).toBe('REJECTED');
      expect(useAppStore.getState().opportunities[0].status).toBe('ACTIVE'); // Remains active
    });

    it('prevents seeker from ACCEPTING a match', () => {
      useAppStore.setState({
        opportunities: [{ id: 'opp1', giverId: 'giver1', status: 'ACTIVE' } as SeatOpportunity],
        matches: [{ id: 'm1', opportunityId: 'opp1', giverId: 'giver1', seekerId: 's1', status: 'PENDING' } as Match]
      });
      const success = useAppStore.getState().transition('m1', 's1', 'ACCEPTED');
      expect(success).toBe(false);
      expect(useAppStore.getState().matches[0].status).toBe('PENDING'); // Unchanged
    });

    it('reopens the seat when an ACCEPTED match is CANCELLED', () => {
      useAppStore.setState({
        currentUser: { id: 'giver1', displayName: 'Giver', reputation: 5.0 },
        opportunities: [{ id: 'opp1', giverId: 'giver1', status: 'MATCHED' } as SeatOpportunity],
        matches: [{ id: 'm1', opportunityId: 'opp1', giverId: 'giver1', seekerId: 's1', status: 'ACCEPTED' } as Match]
      });
      const success = useAppStore.getState().cancelMatch('m1');
      expect(success).toBe(true);
      expect(useAppStore.getState().opportunities[0].status).toBe('ACTIVE');
    });

    it('prevents seeker from completing a match', () => {
      useAppStore.setState({
        opportunities: [{ id: 'opp1', giverId: 'giver1', status: 'MATCHED' } as SeatOpportunity],
        matches: [{ id: 'm1', opportunityId: 'opp1', giverId: 'giver1', seekerId: 's1', status: 'ACCEPTED' } as Match]
      });
      const success = useAppStore.getState().transition('m1', 's1', 'COMPLETED');
      expect(success).toBe(false);
      expect(useAppStore.getState().matches[0].status).toBe('ACCEPTED'); // Unchanged
    });

    it('allows giver to complete a match and completes opportunity', () => {
      useAppStore.setState({
        currentUser: { id: 'giver1', displayName: 'Giver', reputation: 5.0 },
        opportunities: [{ id: 'opp1', giverId: 'giver1', status: 'MATCHED' } as SeatOpportunity],
        matches: [{ id: 'm1', opportunityId: 'opp1', giverId: 'giver1', seekerId: 's1', status: 'ACCEPTED' } as Match]
      });
      const success = useAppStore.getState().transition('m1', 'giver1', 'COMPLETED');
      expect(success).toBe(true);
      expect(useAppStore.getState().matches[0].status).toBe('COMPLETED');
      expect(useAppStore.getState().opportunities[0].status).toBe('COMPLETED');
    });

    it('prevents non-participant from cancelling a match', () => {
      useAppStore.setState({
        opportunities: [{ id: 'opp1', giverId: 'giver1', status: 'MATCHED' } as SeatOpportunity],
        matches: [{ id: 'm1', opportunityId: 'opp1', giverId: 'giver1', seekerId: 's1', status: 'ACCEPTED' } as Match]
      });
      const success = useAppStore.getState().transition('m1', 'random_guy', 'CANCELLED');
      expect(success).toBe(false);
      expect(useAppStore.getState().matches[0].status).toBe('ACCEPTED'); // Unchanged
    });
  });

  describe('logout', () => {
    it('resets the state but keeps action functions', () => {
      useAppStore.setState({ isAuthenticated: true, upiId: 'test@upi', opportunities: [{ id: '1' } as any] });
      useAppStore.getState().logout();
      const state = useAppStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.upiId).toBe(null);
      expect(state.opportunities.length).toBe(0);
      expect(typeof state.login).toBe('function'); // Actions are preserved
    });
  });
});
