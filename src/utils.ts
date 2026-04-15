export interface Fight {
  timestamp: number;
  reason: string;
  notes?: string;
  resolved?: boolean;
}

const WEEK_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;

export type WeekDayStatus = 'streak' | 'fight' | 'today' | 'future';

export { WEEK_DAYS };

export function getWeekDotStatuses(fights: Fight[]): WeekDayStatus[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dayOfWeek = today.getDay(); // 0=Sun
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(today);
  monday.setDate(monday.getDate() - daysFromMonday);

  const fightDateSet = new Set(
    fights.map((f) => {
      const d = new Date(f.timestamp);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
  );

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    if (d > today) return 'future' as WeekDayStatus;
    if (d.getTime() === today.getTime()) {
      return (fightDateSet.has(d.getTime()) ? 'fight' : 'today') as WeekDayStatus;
    }
    return (fightDateSet.has(d.getTime()) ? 'fight' : 'streak') as WeekDayStatus;
  });
}

export function computeStreakDays(lastFightTimestamp: number | null): number {
  if (lastFightTimestamp === null) return 0;
  const now = Date.now();
  const diffMs = now - lastFightTimestamp;
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export function getLocalStorageItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function setLocalStorageItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}
