import { describe, it, expect } from '@jest/globals';
import { reconcile } from '../offers';
import { SeatOpportunity, Match } from '../../types';

describe('offers reconcile', () => {
  const opp = (overrides: Partial<SeatOpportunity>) =>
    ({
      id: 'opp1',
      giverId: 'u1',
      direction: 'Northbound',
      currentStationId: 'a',
      handoffStationId: 'b',
      createdAt: 1000,
      updatedAt: 1000,
      expiresAt: 5000,
      status: 'ACTIVE',
      trainId: 't1',
      ...overrides,
    }) as SeatOpportunity;

  const match = (overrides: Partial<Match>) =>
    ({
      id: 'm1',
      opportunityId: 'opp1',
      seekerId: 'u2',
      giverId: 'u1',
      status: 'PENDING',
      createdAt: 1000,
      ...overrides,
    }) as Match;

  it('ACTIVE past expiresAt becomes EXPIRED, PENDING matches CANCELLED', () => {
    const o = opp({ status: 'ACTIVE', expiresAt: 5000 });
    const m = match({ status: 'PENDING' });
    const { opportunities, matches } = reconcile([o], [m], 6000);

    expect(opportunities[0].status).toBe('EXPIRED');
    expect(opportunities[0].updatedAt).toBe(6000);
    expect(matches[0].status).toBe('CANCELLED');
    expect(matches[0].cancelledBy).toBe('system');
  });

  it('ACTIVE not past expiresAt remains unchanged', () => {
    const o = opp({ status: 'ACTIVE', expiresAt: 5000 });
    const m = match({ status: 'PENDING' });
    const res = reconcile([o], [m], 4000);

    expect(res.opportunities[0].status).toBe('ACTIVE');
    expect(res.matches[0].status).toBe('PENDING');
  });

  it('MATCHED with ACCEPTED match unconfirmed 10 mins past expiresAt becomes EXPIRED/CANCELLED', () => {
    const o = opp({ status: 'MATCHED', expiresAt: 5000 });
    const m = match({ status: 'ACCEPTED' });
    const { opportunities, matches } = reconcile([o], [m], 5000 + 10 * 60000 + 1);

    expect(opportunities[0].status).toBe('EXPIRED');
    expect(opportunities[0].updatedAt).toBe(5000 + 10 * 60000 + 1);
    expect(matches[0].status).toBe('CANCELLED');
    expect(matches[0].cancelledBy).toBe('system');
  });

  it('MATCHED with ACCEPTED match < 10 mins past expiresAt remains unchanged', () => {
    const o = opp({ status: 'MATCHED', expiresAt: 5000 });
    const m = match({ status: 'ACCEPTED' });
    const res = reconcile([o], [m], 5000 + 5 * 60000);

    expect(res.opportunities[0].status).toBe('MATCHED');
    expect(res.matches[0].status).toBe('ACCEPTED');
  });
});
