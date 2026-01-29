// Track visit timestamp for session and current visitor count
const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes
const ACTIVE_SESSIONS_KEY = 'active:sessions';

// Reuse a stable session id across reloads/tabs when possible
function getSessionId(): string {
  try {
    let id = localStorage.getItem('session:id');
    if (!id) {
      const newId = (crypto as any).randomUUID?.() || `session-${Date.now()}-${Math.random()}`;
      localStorage.setItem('session:id', newId);
      return newId;
    }
    return id;
  } catch {
    return `session-${Date.now()}-${Math.random()}`;
  }
}

const SESSION_ID = getSessionId();

export function incrementVisitsToday(): number {
  try {
    const key = `visits:${new Date().toISOString().slice(0,10)}`;
    const n = Number(localStorage.getItem(key) || '0') + 1;
    localStorage.setItem(key, String(n));
    
    // Track session
    localStorage.setItem('session:lastActive', Date.now().toString());

    // Add/refresh this session in active sessions map
    try {
      const sessions = JSON.parse(localStorage.getItem(ACTIVE_SESSIONS_KEY) || '{}');
      sessions[SESSION_ID] = Date.now();
      localStorage.setItem(ACTIVE_SESSIONS_KEY, JSON.stringify(sessions));
    } catch {
      localStorage.setItem(ACTIVE_SESSIONS_KEY, JSON.stringify({ [SESSION_ID]: Date.now() }));
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
      // Remove stale sessions and persist cleaned map
      const active: Record<string, number> = {};
      Object.entries(sessions).forEach(([id, ts]) => {
        if ((now - Number(ts)) < SESSION_TIMEOUT) active[id] = Number(ts);
      });
      try { localStorage.setItem(ACTIVE_SESSIONS_KEY, JSON.stringify(active)); } catch {}

      const activeCount = Object.keys(active).length;
      return activeCount;
    } catch {
      return 0;
    }
  } catch {
    return 1;
  }
}

export function getPageVisits(page: string): number {
  try {
    const today = new Date().toISOString().slice(0,10);
    const pageVisitsKey = `pageVisits:${today}`;
    try {
      const pageData = JSON.parse(localStorage.getItem(pageVisitsKey) || '{}');
      return Number(pageData[page] || 0);
    } catch {
      return 0;
    }
  } catch {
    return 0;
  }
}

export function getAllPageVisits(): Record<string, number> {
  try {
    const today = new Date().toISOString().slice(0,10);
    const pageVisitsKey = `pageVisits:${today}`;
    try {
      const data = JSON.parse(localStorage.getItem(pageVisitsKey) || '{}');
      return data;
    } catch {
      return {};
    }
  } catch {
    return {};
  }
}

export function updateSessionActivity(): void {
  try {
    const now = Date.now();
    localStorage.setItem('session:lastActive', now.toString());
    try {
      const sessions = JSON.parse(localStorage.getItem(ACTIVE_SESSIONS_KEY) || '{}');
      sessions[SESSION_ID] = now;
      localStorage.setItem(ACTIVE_SESSIONS_KEY, JSON.stringify(sessions));
    } catch {
      localStorage.setItem(ACTIVE_SESSIONS_KEY, JSON.stringify({ [SESSION_ID]: now }));
    }
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
