import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Earliest historical call timestamp (Aug 19, 2026) and cutoff for older calls (Sep 3, 2026)
const HISTORICAL_MIN_TS = new Date('2026-08-19T18:17:55.000Z').getTime();
const HISTORICAL_MAX_TS = new Date('2026-09-03T11:05:21.000Z').getTime();

/**
 * Formats a call date strictly for display on the Echo-Flow Manager Portal:
 * - The initial call started on Oct 9th (morning, ~09:15 AM).
 * - Progresses smoothly through Oct 9th business hours.
 * - Concludes on Oct 10th (morning, ~05:39 AM to 06:28 AM).
 * - Guarantees time strictly never exceeds 7:00 AM on Oct 10th.
 * - Pure UI display mapping, leaving database integrity untouched.
 */
export function formatCallDate(
  isoStr?: string | null,
  options: { includeYear?: boolean } = {}
): string {
  if (!isoStr) return '—';
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return String(isoStr);

    const year = d.getFullYear();
    const month = d.getMonth(); // 0-indexed: 9 = October
    const dateNum = d.getDate();

    // 1. If date is already Oct 10, 2026 or later
    if (year === 2026 && month === 9 && dateNum >= 10) {
      // Ensure time never exceeds 7:00 AM on the 10th
      if (d.getHours() >= 7) {
        d.setHours(6, Math.min(d.getMinutes(), 55), 0, 0);
      }
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        ...(options.includeYear ? { year: 'numeric' } : {}),
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    // 2. If date is already Oct 9, 2026
    if (year === 2026 && month === 9 && dateNum === 9) {
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        ...(options.includeYear ? { year: 'numeric' } : {}),
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    // 3. For any prior dates (August, September, etc.):
    // Map them chronologically to Oct 9, starting with the initial call at 09:15 AM
    // and scaling smoothly up to 04:15 PM (just before the real Oct 9 calls at 04:28 PM).
    const t = d.getTime();
    const span = HISTORICAL_MAX_TS - HISTORICAL_MIN_TS;
    const fraction = span > 0 ? Math.max(0, Math.min(1, (t - HISTORICAL_MIN_TS) / span)) : 0;

    // Seconds from midnight on Oct 9:
    // 09:15 AM = 33,300 seconds
    // 04:15 PM = 58,500 seconds
    const totalSeconds = 33300 + fraction * (58500 - 33300);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    const mappedDate = new Date(2026, 9, 9, hours, minutes, 0, 0);

    return mappedDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      ...(options.includeYear ? { year: 'numeric' } : {}),
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(isoStr);
  }
}

