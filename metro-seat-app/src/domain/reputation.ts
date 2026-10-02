import { User } from '../types';

export const formatReputation = (u?: User) =>
  u && u.reputation > 0 ? `${u.reputation.toFixed(1)}/5.0` : 'New';
