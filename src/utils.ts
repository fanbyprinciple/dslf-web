export interface Fight {
  timestamp: number;
  reason: string;
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
