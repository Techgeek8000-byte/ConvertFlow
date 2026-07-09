'use client';

// ============================================================
// ConvertFlow — Usage Counter (localStorage-based)
// ============================================================

const STORAGE_KEY = 'cf-usage-counts';
const RECENT_KEY = 'cf-recent-tools';

interface UsageData {
  counts: Record<string, number>;
}

function getStorageData(): UsageData {
  if (typeof window === 'undefined') return { counts: {} };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as UsageData;
  } catch {
    // corrupted data, reset
  }
  return { counts: {} };
}

function saveStorageData(data: UsageData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // storage full or unavailable
  }
}

/**
 * Increment the usage count for a specific tool.
 * Returns the new count for that tool.
 */
export function incrementUsage(toolId: string): number {
  const data = getStorageData();
  data.counts[toolId] = (data.counts[toolId] || 0) + 1;
  saveStorageData(data);
  return data.counts[toolId];
}

/**
 * Get usage counts for all tools.
 */
export function getUsageCounts(): Record<string, number> {
  return { ...getStorageData().counts };
}

/**
 * Get total number of conversions across all tools.
 */
export function getTotalUsage(): number {
  const data = getStorageData();
  return Object.values(data.counts).reduce((sum, c) => sum + c, 0);
}

// ────────────── Recently Used Tools ──────────────

interface RecentEntry {
  toolId: string;
  timestamp: number;
}

/**
 * Record a tool as recently used. Keeps the most recent entries only.
 */
export function recordRecentTool(toolId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    let recent: RecentEntry[] = raw ? JSON.parse(raw) : [];

    // Remove existing entry for this tool
    recent = recent.filter((e) => e.toolId !== toolId);

    // Add to front
    recent.unshift({ toolId, timestamp: Date.now() });

    // Keep only last 10
    recent = recent.slice(0, 10);

    localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
  } catch {
    // ignore
  }
}

/**
 * Get the list of recently used tool IDs, newest first.
 * Returns up to `limit` entries.
 */
export function getRecentTools(limit: number = 4): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const recent: RecentEntry[] = JSON.parse(raw);
    return recent.slice(0, limit).map((e) => e.toolId);
  } catch {
    return [];
  }
}
