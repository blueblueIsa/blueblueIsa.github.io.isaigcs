import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

function normalizePaperCode(paper) {
  const p = String(paper).trim();
  if (/^[SWM]\d{2}P\d{2}$/i.test(p)) return p.toUpperCase();
  const m = /^(\d{4})\s+(May\/June|Oct\/Nov|Feb\/Mar)\s+Paper\s+(\d{2})$/i.exec(p);
  if (!m) return p;
  const year = m[1];
  const season = m[2].toLowerCase();
  const num = m[3];
  const yy = year.slice(2);
  const code = season === 'may/june' ? 'S' : season === 'oct/nov' ? 'W' : 'M';
  return `${code}${yy}P${num}`;
}

function processFile(filePath) {
  const raw = readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw);
  let changed = false;
  if (Array.isArray(data)) {
    for (const item of data) {
      const before = item.paper;
      const after = normalizePaperCode(before);
      if (after !== before) {
        item.paper = after;
        changed = true;
      }
    }
  }
  if (changed) {
    writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  }
}

function main() {
  const dir = join(process.cwd(), 'src', 'data', 'papers');
  const files = readdirSync(dir).filter(f => f.endsWith('.json'));
  for (const f of files) {
    processFile(join(dir, f));
  }
  console.log('Paper codes normalized.');
}

main();
