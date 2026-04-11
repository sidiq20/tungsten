import { type PostResponse } from './types';

/** Format ISO8601 timestamp → "2 hours ago" style */
export function timeAgo(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diff = Math.floor((now - then) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(isoString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Pick a deterministic icon color class based on course code hash */
export function courseColor(code: string): string {
  const colors = [
    'var(--color-indigo)',
    'var(--color-emerald)',
    'var(--color-violet)',
    'var(--color-amber)',
    'var(--color-rose)',
    'var(--color-sky)',
  ];
  let hash = 0;
  for (let i = 0; i < code.length; i++) hash += code.charCodeAt(i);
  return colors[hash % colors.length];
}

/** Truncate text to n characters */
export function truncate(text: string, n: number): string {
  return text.length > n ? text.slice(0, n).trimEnd() + '…' : text;
}

/** Check if a post has a PDF attachment */
export function hasPdf(post: PostResponse): boolean {
  return post.file_type === 'application/pdf' || post.file_url?.endsWith('.pdf') === true;
}

/** Get display name for user (full name or username) */
export function displayName(username: string, fullName?: string | null): string {
  return fullName?.trim() || username;
}

/** Format large numbers: 1200 → 1.2k */
export function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
