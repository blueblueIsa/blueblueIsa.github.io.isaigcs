const { parseQAUrl, buildQAPath } = require('../src/modules/qa/qaUrl');

describe('QA URL helpers', () => {
  test('parse legacy query params', () => {
    const res = parseQAUrl('/qa', '?unit=unit1&q=search&kw=key');
    expect(res.unit).toBe('unit1');
    expect(res.q).toBe('search');
    expect(res.kw).toBe('key');
  });

  test('parse path-based url with topic', () => {
    const res = parseQAUrl('/qa/unit/unit42/topic/HTML', '?q=link');
    expect(res.unit).toBe('unit42');
    expect(res.topic).toBe('HTML');
    expect(res.q).toBe('link');
  });

  test('build path produces expected string', () => {
    const p = buildQAPath({ unit: 'unit42', topic: 'HTML', q: 'link' });
    expect(p).toBe('/qa/unit/unit42/topic/HTML?q=link');
  });

  test('parse path with version prefix', () => {
    const res = parseQAUrl('/qa/v2/unit/unit1', '');
    expect(res.unit).toBe('unit1');
  });
});