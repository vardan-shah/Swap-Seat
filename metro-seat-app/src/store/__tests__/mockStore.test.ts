import { useAppStore } from '../mockStore';
import { SeatOpportunity, Match } from '../../types';

describe('mockStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useAppStore.setState({
      opportunities: [],
      matches: [],
      currentUser: { id: 'u1', displayName: 'TestUser', reputation: 5.0 },
    });
  });

  describe('requestSeat', () => {
    it('creates a PENDING match when requesting an ACTIVE opportunity', () => {
      useAppStore.setState({
        opportunities: [
          { id: 'opp1', giverId: 'giver1', status: 'ACTIVE' } as SeatOpportunity
        ]
      });

      const success = useAppStore.getState().requestSeat('opp1', 'seeker1');
      expect(success).toBe(true);

      const matches = useAppStore.getState().matches;
      expect(matches.length).toBe(1);
      expect(matches[0].seekerId).toBe('seeker1');
      expect(matches[0].giverId).toBe('giver1');
      expect(matches[0].status).toBe('PENDING');
    });

    it('rejects duplicate requests from the same seeker for the same opportunity', () => {
      useAppStore.setState({
        opportunities: [
          { id: 'opp1', giverId: 'giver1', status: 'ACTIVE' } as SeatOpportunity
        ],
        matches: [
          { id: 'm1', opportunityId: 'opp1', seekerId: 'seeker1', giverId: 'giver1', status: 'PENDING' } as Match
        ]
      });

      const success = useAppStore.getState().requestSeat('opp1', 'seeker1');
      expect(success).toBe(false);
      expect(useAppStore.getState().matches.length).toBe(1); // Still just 1
    });

    it('rejects a request for an own offer', () => {
      useAppStore.setState({
        opportunities: [
          { id: 'opp1', giverId: 'seeker1', status: 'ACTIVE' } as SeatOpportunity
        ]
      });

      const success = useAppStore.getState().requestSeat('opp1', 'seeker1');
      expect(success).toBe(false);
      expect(useAppStore.getState().matches.length).toBe(0);
    });
  });

  describe('transition', () => {
    it('allows giver to ACCEPT a PENDING match and auto-rejects siblings', () => {
      useAppStore.setState({
        opportunities: [
          { id: 'opp1', giverId: 'giver1', status: 'ACTIVE' } as SeatOpportunity
        ],
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
      expect(state.matches.find(m => m.id === 'm2')?.status).toBe('REJECTED'); // Sibling rejected
    });

    it('prevents seeker from ACCEPTING a match', () => {
      useAppStore.setState({
        opportunities: [
          { id: 'opp1', giverId: 'giver1', status: 'ACTIVE' } as SeatOpportunity
        ],
        matches: [
          { id: 'm1', opportunityId: 'opp1', giverId: 'giver1', seekerId: 's1', status: 'PENDING' } as Match
        ]
      });

      // Attempt to transition as seeker
      const success = useAppStore.getState().transition('m1', 's1', 'ACCEPTED');
      expect(success).toBe(false);
      expect(useAppStore.getState().matches[0].status).toBe('PENDING');
    });

    it('reopens the seat when an ACCEPTED match is CANCELLED', () => {
      useAppStore.setState({
        opportunities: [
          { id: 'opp1', giverId: 'giver1', status: 'MATCHED' } as SeatOpportunity
        ],
        matches: [
          { id: 'm1', opportunityId: 'opp1', giverId: 'giver1', seekerId: 's1', status: 'ACCEPTED' } as Match
        ]
      });

      const success = useAppStore.getState().cancelMatch('m1');
      expect(success).toBe(true);

      const state = useAppStore.getState();
      expect(state.matches[0].status).toBe('CANCELLED');
      expect(state.opportunities[0].status).toBe('ACTIVE'); // Reopened
    });

    it('prevents illegal transitions (e.g. COMPLETED to ACCEPTED)', () => {
      useAppStore.setState({
        matches: [
          { id: 'm1', opportunityId: 'opp1', giverId: 'giver1', seekerId: 's1', status: 'COMPLETED' } as Match
        ]
      });

      const success = useAppStore.getState().transition('m1', 'giver1', 'ACCEPTED');
      expect(success).toBe(false);
      expect(useAppStore.getState().matches[0].status).toBe('COMPLETED');
    });
  });
});
