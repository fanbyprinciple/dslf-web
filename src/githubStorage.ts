import { Fight } from './utils';

const REPO = 'fanbyprinciple/dslf-web';
const FILE_PATH = 'data/fights.json';
const API_BASE = 'https://api.github.com';
const TOKEN_KEY = 'dslf_github_token';

export function getStoredToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export function saveToken(token: string): void {
  try { localStorage.setItem(TOKEN_KEY, token); } catch {}
}

export function clearToken(): void {
  try { localStorage.removeItem(TOKEN_KEY); } catch {}
}

interface GitHubFileResponse {
  content: string;
  sha: string;
  encoding: string;
}

// Reads are unauthenticated — public repo, works on any device without token.
// Optional token passed only when writing (to get fresh SHA).
async function getFile(token?: string): Promise<{ fights: Fight[]; sha: string }> {
  const headers: Record<string, string> = { Accept: 'application/vnd.github+json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/repos/${REPO}/contents/${FILE_PATH}`, { headers });

  if (res.status === 404) return { fights: [], sha: '' };

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).message || `GitHub API error ${res.status}`);
  }

  const data: GitHubFileResponse = await res.json();
  const decoded = atob(data.content.replace(/\n/g, ''));
  const fights: Fight[] = JSON.parse(decoded);
  return { fights, sha: data.sha };
}

export async function loadFightsFromGitHub(): Promise<Fight[]> {
  const { fights } = await getFile();
  return fights;
}

export async function saveFightsToGitHub(token: string, fights: Fight[]): Promise<void> {
  const { sha } = await getFile(token);

  const content = btoa(JSON.stringify(fights, null, 2));
  const body: Record<string, string> = {
    message: `update: log fight entry ${new Date().toISOString().slice(0, 10)}`,
    content,
  };
  if (sha) body.sha = sha;

  const res = await fetch(`${API_BASE}/repos/${REPO}/contents/${FILE_PATH}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).message || `GitHub write error ${res.status}`);
  }
}

export async function validateToken(token: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/repos/${REPO}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
    });
    return res.ok;
  } catch {
    return false;
  }
}
