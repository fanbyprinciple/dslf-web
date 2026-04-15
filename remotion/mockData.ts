import { Fight } from '../src/utils';

const now = Date.now();
const day = 86_400_000;

export const MOCK_FIGHTS: Fight[] = [
  { timestamp: now - 14 * day, reason: 'Communication', notes: 'Verbal altercation. De-escalated without further incident.', resolved: true },
  { timestamp: now - 30 * day, reason: 'Chores', notes: 'Disagreement about household responsibilities.', resolved: true },
  { timestamp: now - 47 * day, reason: 'Work Stress', notes: 'Brought work frustration home.', resolved: false },
  { timestamp: now - 65 * day, reason: 'Money', notes: 'Budget disagreement.', resolved: true },
  { timestamp: now - 80 * day, reason: 'Family', resolved: true },
];

export const MOCK_STREAK = 14;
export const MOCK_LAST_REASON = 'Communication';
