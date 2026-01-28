/**
 * Advanced analytics utilities for visit statistics
 * Supports date-range queries, per-page tracking, and data export
 */

interface DailyStats {
  date: string;
  total: number;
  pages: Record<string, number>;
  sessions: number;
}

interface AnalyticsData {
  date: string;
  page: string;
  count: number;
  timestamp: number;
}

/**
 * Get statistics for a specific date
 */
export function getStatsForDate(date: string): DailyStats {
  try {
    const visitsKey = `visits:${date}`;
    const total = Number(localStorage.getItem(visitsKey) || '0');

    // Get per-page visits for this date
    const pages: Record<string, number> = {};
    const pageVisitsKey = `pageVisits:${date}`;
    try {
      const pageData = JSON.parse(localStorage.getItem(pageVisitsKey) || '{}');
      Object.assign(pages, pageData);
    } catch {
      // Ignore JSON errors
    }

    // Get session count
    const sessionsKey = `sessions:${date}`;
    const sessions = Number(localStorage.getItem(sessionsKey) || '0');

    return { date, total, pages, sessions };
  } catch (error) {
    console.error(`Failed to get stats for ${date}:`, error);
    return { date, total: 0, pages: {}, sessions: 0 };
  }
}

/**
 * Get statistics for a date range
 */
export function getStatsForDateRange(startDate: string, endDate: string): DailyStats[] {
  const stats: DailyStats[] = [];
  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    const dateStr = current.toISOString().slice(0, 10);
    stats.push(getStatsForDate(dateStr));
    current.setDate(current.getDate() + 1);
  }

  return stats;
}

/**
 * Get aggregated statistics for all tracked dates
 */
export function getAllStats(): DailyStats[] {
  const stats: DailyStats[] = [];
  const keys = Object.keys(localStorage);

  const visitKeys = keys
    .filter((key) => key.startsWith('visits:'))
    .map((key) => key.replace('visits:', ''));

  const uniqueDates = [...new Set(visitKeys)].sort().reverse();

  uniqueDates.forEach((date) => {
    stats.push(getStatsForDate(date));
  });

  return stats;
}

/**
 * Get page-specific statistics
 */
export function getPageStats(page: string, limit: number = 30): AnalyticsData[] {
  const data: AnalyticsData[] = [];
  const keys = Object.keys(localStorage);

  keys.forEach((key) => {
    if (key.startsWith(`pageVisits:`)) {
      const [, date] = key.split(':');
      try {
        const pageData = JSON.parse(localStorage.getItem(key) || '{}');
        if (pageData[page]) {
          data.push({
            date,
            page,
            count: pageData[page],
            timestamp: new Date(date).getTime()
          });
        }
      } catch {
        // Ignore JSON errors
      }
    }
  });

  return data.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
}

/**
 * Get all pages that have been tracked
 */
export function getAllTrackedPages(): string[] {
  const pages = new Set<string>();
  const keys = Object.keys(localStorage);

  keys.forEach((key) => {
    if (key.startsWith('pageVisits:')) {
      try {
        const pageData = JSON.parse(localStorage.getItem(key) || '{}');
        Object.keys(pageData).forEach((page) => pages.add(page));
      } catch {
        // Ignore
      }
    }
  });

  return Array.from(pages).sort();
}

/**
 * Export statistics as JSON
 */
export function exportStatsAsJSON(
  startDate?: string,
  endDate?: string
): { data: DailyStats[]; exportDate: string } {
  const today = new Date().toISOString().slice(0, 10);
  const start = startDate || '2000-01-01';
  const end = endDate || today;

  const data = getStatsForDateRange(start, end);

  return {
    data,
    exportDate: new Date().toISOString()
  };
}

/**
 * Export statistics as CSV
 */
export function exportStatsAsCSV(
  startDate?: string,
  endDate?: string
): string {
  const stats = exportStatsAsJSON(startDate, endDate);
  const lines: string[] = [];

  // Header
  lines.push('Date,Total Visits,Sessions,Pages');

  // Data rows
  stats.data.forEach((day) => {
    const pageStr = Object.entries(day.pages)
      .map(([page, count]) => `${page}:${count}`)
      .join('; ');
    lines.push(
      `${day.date},${day.total},${day.sessions},"${pageStr}"`
    );
  });

  return lines.join('\n');
}

/**
 * Calculate statistics summary
 */
export function getStatsSummary(days: number = 7): {
  totalVisits: number;
  totalSessions: number;
  avgVisitsPerDay: number;
  topPages: Array<[string, number]>;
  dateRange: { start: string; end: string };
} {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - (days - 1));

  const start = startDate.toISOString().slice(0, 10);
  const end = today.toISOString().slice(0, 10);

  const stats = getStatsForDateRange(start, end);

  const totalVisits = stats.reduce((sum, s) => sum + s.total, 0);
  const totalSessions = stats.reduce((sum, s) => sum + s.sessions, 0);
  const avgVisitsPerDay = stats.length > 0 ? totalVisits / stats.length : 0;

  // Get top pages
  const pageStats: Record<string, number> = {};
  stats.forEach((s) => {
    Object.entries(s.pages).forEach(([page, count]) => {
      pageStats[page] = (pageStats[page] || 0) + count;
    });
  });

  const topPages = Object.entries(pageStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return {
    totalVisits,
    totalSessions,
    avgVisitsPerDay,
    topPages,
    dateRange: { start, end }
  };
}

/**
 * Clear old statistics (older than daysToKeep)
 */
export function clearOldStats(daysToKeep: number = 90): number {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  const cutoffStr = cutoffDate.toISOString().slice(0, 10);

  let cleared = 0;
  const keys = Object.keys(localStorage);

  keys.forEach((key) => {
    if (key.startsWith('visits:') || key.startsWith('pageVisits:')) {
      const datePart = key.split(':')[1];
      if (datePart < cutoffStr) {
        localStorage.removeItem(key);
        cleared++;
      }
    }
  });

  return cleared;
}

/**
 * Record a page visit with page name
 */
export function recordPageVisit(page: string): void {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const pageVisitsKey = `pageVisits:${today}`;

    try {
      const pageData = JSON.parse(localStorage.getItem(pageVisitsKey) || '{}');
      pageData[page] = (pageData[page] || 0) + 1;
      localStorage.setItem(pageVisitsKey, JSON.stringify(pageData));
    } catch {
      // Initialize if JSON parsing fails
      const pageData = { [page]: 1 };
      localStorage.setItem(pageVisitsKey, JSON.stringify(pageData));
    }
  } catch (error) {
    console.error(`Failed to record page visit for ${page}:`, error);
  }
}

/**
 * Record session count
 */
export function recordSession(): void {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const sessionsKey = `sessions:${today}`;
    const current = Number(localStorage.getItem(sessionsKey) || '0');
    localStorage.setItem(sessionsKey, String(current + 1));
  } catch (error) {
    console.error('Failed to record session:', error);
  }
}
