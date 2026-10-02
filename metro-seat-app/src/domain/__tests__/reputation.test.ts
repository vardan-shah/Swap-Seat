import { describe, it, expect } from '@jest/globals';
import { formatReputation } from '../reputation';
import { User } from '../../types';

describe('formatReputation', () => {
  it('returns New for undefined user', () => {
    expect(formatReputation()).toBe('New');
  });

  it('returns New for user with 0 reputation', () => {
    expect(formatReputation({ id: '1', displayName: 'A', reputation: 0 } as User)).toBe('New');
  });

  it('formats positive reputation correctly', () => {
    expect(formatReputation({ id: '1', displayName: 'A', reputation: 4.8 } as User)).toBe(
      '4.8/5.0',
    );
    expect(formatReputation({ id: '1', displayName: 'A', reputation: 5 } as User)).toBe('5.0/5.0');
  });
});
