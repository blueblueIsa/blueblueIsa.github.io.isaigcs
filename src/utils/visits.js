function incrementVisitsToday() {
  try {
    const key = `visits:${new Date().toISOString().slice(0,10)}`;
    const n = Number(localStorage.getItem(key) || '0') + 1;
    localStorage.setItem(key, String(n));
    return n;
  } catch (e) {
    return 0;
  }
}

function getVisitsForDate(date) {
  try {
    const key = `visits:${date.toISOString().slice(0,10)}`;
    return Number(localStorage.getItem(key) || '0');
  } catch (e) {
    return 0;
  }
}

function getVisitsStats() {
  try {
    const today = new Date();
    const week = [];
    let weekTotal = 0;
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const count = getVisitsForDate(d);
      week.push({ day: d.toISOString().slice(5,10), count });
      weekTotal += count;
    }
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    return { yesterday: getVisitsForDate(yesterday), today: getVisitsForDate(today), weekTotal, week };
  } catch (e) {
    return { yesterday: 0, today: 0, weekTotal: 0, week: [] };
  }
}

module.exports = { incrementVisitsToday, getVisitsForDate, getVisitsStats };
