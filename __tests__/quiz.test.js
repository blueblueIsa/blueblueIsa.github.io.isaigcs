const paper1 = require('../src/data/papers/25paper1.json');

describe('Paper 1 dataset', () => {
  test('contains fill_in and short_answer sample items', () => {
    expect(Array.isArray(paper1)).toBe(true);
    const hasFill = paper1.some(q => q.type === 'fill_in');
    const hasShort = paper1.some(q => q.type === 'short_answer');
    expect(hasFill).toBe(true);
    expect(hasShort).toBe(true);
  });

  test('fill_in entries have blanks array', () => {
    const fill = paper1.find(q => q.type === 'fill_in');
    expect(fill).toBeDefined();
    expect(Array.isArray(fill.blanks)).toBe(true);
  });
});
