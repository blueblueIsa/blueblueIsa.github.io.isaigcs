export function incrementVisitsToday(): number {
  try {
    const key = `visits:${new Date().toISOString().slice(0,10)}`;
    const n = Number(localStorage.getItem(key) || '0') + 1;
    localStorage.setItem(key, String(n));
    return n;
  } catch {
    return 0;
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
