const React = require('react');
const { incrementVisitsToday } = require('../src/utils/visits');

describe('visits utility', () => {
  beforeEach(() => { try { localStorage.clear(); } catch (_) {} });

  test('incrementVisitsToday increments and returns numeric value', () => {
    const n1 = incrementVisitsToday();
    expect(Number(n1)).toBeGreaterThanOrEqual(1);
    const n2 = incrementVisitsToday();
    expect(Number(n2)).toBe(n1 + 1);
  });
});