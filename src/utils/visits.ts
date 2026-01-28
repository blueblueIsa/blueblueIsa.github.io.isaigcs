// Track visit timestamp for session and current visitor count
const SESSION_ID = crypto.randomUUID?.() || `session-${Date.now()}-${Math.random()}`;
const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes
const ACTIVE_SESSIONS_KEY = 'active:sessions';

export function incrementVisitsToday(): number {
  try {
    const key = `visits:${new Date().toISOString().slice(0,10)}`;
    const n = Number(localStorage.getItem(key) || '0') + 1;
    localStorage.setItem(key, String(n));
    
    // Track session
    localStorage.setItem('session:id', SESSION_ID);
    localStorage.setItem('session:lastActive', Date.now().toString());
    
    // Add this session to active sessions
    try {
      const sessions = JSON.parse(localStorage.getItem(ACTIVE_SESSIONS_KEY) || '{}');
      sessions[SESSION_ID] = Date.now();
      localStorage.setItem(ACTIVE_SESSIONS_KEY, JSON.stringify(sessions));
    } catch {
      // Ignore JSON errors
    }
    
    return n;
  } catch {
    return 0;
  }
}

export function getCurrentVisitors(): number {
  try {
    const now = Date.now();
    
    try {
      const sessions = JSON.parse(localStorage.getItem(ACTIVE_SESSIONS_KEY) || '{}');
      const activeSessions = Object.entries(sessions).filter(([, timestamp]: [string, any]) => {
        return (now - Number(timestamp)) < SESSION_TIMEOUT;
      });
      
      // Return at least 1, up to number of active sessions
      return Math.max(1, activeSessions.length);
    } catch {
      return 1;
    }
  } catch {
    return 1;
  }
}

export function getPageVisits(page: string): number {
  try {
    const today = new Date().toISOString().slice(0,10);
    const key = `page:${page}:${today}`;
    return Number(localStorage.getItem(key) || '0');
  } catch {
    return 0;
  }
}

export function getAllPageVisits(): Record<string, number> {
  try {
    const today = new Date().toISOString().slice(0,10);
    const result: Record<string, number> = {};
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`page:`) && key.endsWith(today)) {
        const page = key.split(':')[1];
        result[page] = Number(localStorage.getItem(key) || '0');
      }
    }
    
    return result;
  } catch {
    return {};
  }
}

export function updateSessionActivity(): void {
  try {
    localStorage.setItem('session:lastActive', Date.now().toString());
  } catch {
    // Ignore errors
  }
}

export function getVisitsForDate(date: Date): number {
  try {
    const key = `visits:${date.toISOString().slice(0,10)}`;
    return Number(localStorage.getItem(key) || '0');
  } catch {
    return 0;
  }
}

export function getVisitsStats(): { yesterday: number; today: number; weekTotal: number; week: Array<{day: string, count: number}> } {
  try {
    const today = new Date();
    const dayLabels: Array<{day: string, count: number}> = [];
    let weekTotal = 0;
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const count = getVisitsForDate(d);
      dayLabels.push({ day: d.toISOString().slice(5,10), count });
      weekTotal += count;
    }
    const yesterdayDate = new Date(today); yesterdayDate.setDate(today.getDate() - 1);
    return { yesterday: getVisitsForDate(yesterdayDate), today: getVisitsForDate(today), weekTotal, week: dayLabels };
  } catch {
    return { yesterday: 0, today: 0, weekTotal: 0, week: [] };
  }
}
