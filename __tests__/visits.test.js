const { incrementVisitsToday, getVisitsForDate, getVisitsStats } = require('../src/utils/visits');
const React = require('react');
const { render, screen, fireEvent } = require('@testing-library/react');
const { Layout } = require('../src/components/layout/layout.testable');

describe('visits util', () => {
  beforeEach(() => { try { localStorage.clear(); } catch (_) {} });

  test('increment and get visits', () => {
    const n1 = incrementVisitsToday();
    expect(Number(n1)).toBeGreaterThanOrEqual(1);
    const today = new Date();
    expect(getVisitsForDate(today)).toBe(n1);
  });

  test('getVisitsStats returns week array and totals', () => {
    // increment a couple of times to populate week
    incrementVisitsToday();
    incrementVisitsToday();
    const stats = getVisitsStats();
    expect(stats).toHaveProperty('yesterday');
    expect(stats).toHaveProperty('today');
    expect(stats.week.length).toBe(7);
  });

  // UI removed: visits popover is hidden; no layout test for popover any more.
  test('visits popover UI is absent from layout', () => {
    render(React.createElement(Layout));
    const btn = screen.queryByRole('button', { name: /visits/i });
    expect(btn).toBeNull();
  });
});