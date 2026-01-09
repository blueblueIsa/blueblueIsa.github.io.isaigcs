import fs from 'fs';
import path from 'path';
import vm from 'vm';

const ROOT = path.resolve(process.cwd());
const QA_SRC = path.join(ROOT, 'src', 'data', 'qa.ts');
const OUT_DIR = path.join(ROOT, 'src', 'data', 'units');

function findBaseObject(text) {
  const needle = 'const baseQaData';
  const i = text.indexOf(needle);
  if (i === -1) throw new Error('baseQaData not found');
  const startBrace = text.indexOf('{', i);
  if (startBrace === -1) throw new Error('start brace not found');
  let idx = startBrace;
  let depth = 0;
  let inStr = false;
  let strChar = '';
  let escaped = false;
  while (idx < text.length) {
    const ch = text[idx];
    if (!inStr) {
      if (ch === '"' || ch === "'" || ch === '`') { inStr = true; strChar = ch; }
      else if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth === 0) {
          return text.slice(startBrace, idx + 1);
        }
      }
    } else {
      if (escaped) { escaped = false; }
      else if (ch === '\\') { escaped = true; }
      else if (ch === strChar) { inStr = false; }
    }
    idx++;
  }
  throw new Error('matching brace not found');
}


async function main() {
  const txt = fs.readFileSync(QA_SRC, 'utf8');
  const objText = findBaseObject(txt);

  // Evaluate the object safely via Node's VM
  const context = vm.createContext({});
  vm.runInContext(`const x = ${objText}; globalThis.__QA__ = x;`, context);
  const baseQaData = context.__QA__;

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const yearsRe = /\b(2024|2025)\b/;
  const skipRe = /identify.*error|identify.*incorrect|identify.*incorrect statement/i;

  for (let unitIndex = 1; unitIndex <= 10; unitIndex++) {
    const uid = `cs-${unitIndex}`;
    const source = baseQaData[uid] || {};
    const out = {};
    for (const topic of Object.keys(source)) {
      const qs = source[topic].filter(q => {
        if (!q || !q.paper) return false;
        if (!yearsRe.test(q.paper)) return false;
        if (skipRe.test(q.question)) return false;
        return true;
      });
      if (qs.length > 0) out[topic] = qs;
    }
    const outPath = path.join(OUT_DIR, `unit${unitIndex}.json`);
    fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');
    console.log(`Wrote ${outPath}`);
  }
}

main().catch(err => { console.error(err); process.exit(1); });