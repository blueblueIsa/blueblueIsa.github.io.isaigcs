const fs = require('fs');
const path = require('path');

test('generated per-unit JSON excludes identify-errors questions', () => {
  const dir = path.join(__dirname, '..', 'src', 'data', 'units');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  const skipRe = /(^|\s)identify.*\berrors?\b/i;
  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    for (const topic of Object.keys(data)) {
      for (const q of data[topic]) {
        expect(skipRe.test(q.question)).toBe(false);
      }
    }
  }
});