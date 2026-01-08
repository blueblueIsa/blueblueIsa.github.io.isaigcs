const { strictEqual, throws } = require('assert');
const { normalizePaperCodeStrict } = require('../src/data/importer.helpers');

describe('normalizePaperCodeStrict', () => {
  it('accepts valid codes', () => {
    strictEqual(normalizePaperCodeStrict('W25P12'), 'W25P12');
    strictEqual(normalizePaperCodeStrict('S24P21'), 'S24P21');
  });
  it('rejects invalid paper numbers', () => {
    throws(() => normalizePaperCodeStrict('W25P29'));
  });
  it('converts verbose format', () => {
    strictEqual(normalizePaperCodeStrict('2025 Oct/Nov Paper 12'), 'W25P12');
  });
});
