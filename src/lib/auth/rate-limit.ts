import "server-only";

/**
 * Login attempt limiter (in memory, no database).
 * - Per IP address: 5 failed attempts in 15 minutes locks that address for 15 minutes.
 * - Globally: 40 failed attempts in 15 minutes pauses all logins for 5 minutes.
 * Memory is per server instance. On Vercel, add a Firewall rate-limit rule for
 * POST /admin/login as a second layer (see README > Security).
 */

const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_IP = 5;
const MAX_GLOBAL = 40;
const GLOBAL_PAUSE_MS = 5 * 60 * 1000;

type Entry = { failures: number[]; lockedUntil: number };
const store = new Map<string, Entry>();
const globalEntry: Entry = { failures: [], lockedUntil: 0 };

function prune(entry: Entry, now: number) {
  entry.failures = entry.failures.filter((t) => now - t < WINDOW_MS);
}

/** Returns seconds to wait, or 0 when an attempt is allowed. */
export function loginBlockedFor(ip: string): number {
  const now = Date.now();
  const wait = Math.max(globalEntry.lockedUntil, store.get(ip)?.lockedUntil ?? 0) - now;
  return wait > 0 ? Math.ceil(wait / 1000) : 0;
}

export function recordLoginFailure(ip: string) {
  const now = Date.now();
  const entry = store.get(ip) ?? { failures: [], lockedUntil: 0 };
  prune(entry, now);
  entry.failures.push(now);
  if (entry.failures.length >= MAX_PER_IP) {
    entry.lockedUntil = now + WINDOW_MS;
    entry.failures = [];
  }
  store.set(ip, entry);

  prune(globalEntry, now);
  globalEntry.failures.push(now);
  if (globalEntry.failures.length >= MAX_GLOBAL) {
    globalEntry.lockedUntil = now + GLOBAL_PAUSE_MS;
    globalEntry.failures = [];
  }

  if (store.size > 5000) {
    for (const [key, value] of store) {
      prune(value, now);
      if (value.failures.length === 0 && value.lockedUntil < now) store.delete(key);
    }
  }
}

export function recordLoginSuccess(ip: string) {
  store.delete(ip);
}
