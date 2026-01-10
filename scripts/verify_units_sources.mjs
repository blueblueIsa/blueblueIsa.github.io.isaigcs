import fs from 'fs';
import path from 'path';

const UNITS_PATH = path.resolve('./src/data/units.ts');
const OUT_JSON = path.resolve('./scripts/verify_units_report.json');
const OUT_CSV = path.resolve('./scripts/verify_units_report.csv');

let src = fs.readFileSync(UNITS_PATH, 'utf8');

// Skip if already has sourceVerified anywhere
if (/sourceVerified\s*:/m.test(src)) {
  console.log('sourceVerified already present in units.ts — generating report only.');
} else {
  // Insert `sourceVerified: false` after each `definition: "..."` property
  // Use a conservative regex that matches the definition string but avoids over-matching
  src = src.replace(/(definition:\s*(?:"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'))/g, '$1, sourceVerified: false');
  fs.writeFileSync(UNITS_PATH + '.bak', fs.readFileSync(UNITS_PATH, 'utf8'));
  fs.writeFileSync(UNITS_PATH, src, 'utf8');
  console.log('Inserted sourceVerified: false into units.ts and wrote a backup to units.ts.bak');
}

// Now generate a report by extracting units, terms, definitions and the sourceVerified value
const termRegex = /\{[^}]*?term:\s*(?:"([^"]+)"|'([^']+)')[^}]*?definition:\s*(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)')[^}]*?sourceVerified:\s*(true|false)[^}]*?\}/gms;
let match;
const out = [];
while ((match = termRegex.exec(src)) !== null) {
  const term = match[1] || match[2] || '';
  const definition = (match[3] || match[4] || '').replace(/\\n/g, '\n');
  const sourceVerified = match[5] === 'true';
  out.push({ term, definition, sourceVerified });
}

fs.writeFileSync(OUT_JSON, JSON.stringify(out, null, 2));
console.log('Wrote JSON report to', OUT_JSON);

// CSV
const csv = ['term,sourceVerified,definition'];
for (const row of out) {
  const def = '"' + row.definition.replace(/"/g, '""') + '"';
  csv.push(`${JSON.stringify(row.term)},${row.sourceVerified},${def}`);
}
fs.writeFileSync(OUT_CSV, csv.join('\n'));
console.log('Wrote CSV report to', OUT_CSV);

console.log('Done. Please review scripts/verify_units_report.json or .csv and mark sourceVerified true where appropriate, then commit changes.');