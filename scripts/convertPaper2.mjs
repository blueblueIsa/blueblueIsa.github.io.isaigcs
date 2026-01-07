import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

function normalizeSeason(season) {
  const s = String(season || '').toLowerCase();
  return s === 'may/june' ? 'S' : s === 'oct/nov' ? 'W' : s === 'feb/mar' ? 'M' : null;
}

function parseBlocks(raw) {
  const text = raw.replace(/\r\n/g, '\n');
  const blocks = text.split(/\n\s*\n/g);
  const byCode = new Map();
  for (const block of blocks) {
    const b = block.trim();
    if (!b) continue;
    const lines = b.split('\n').map(l => l.trim());
    const paperMatch =
      /Paper\s*21/i.test(b) ? 21 :
      /Paper\s*22/i.test(b) ? 22 :
      /Paper\s*23/i.test(b) ? 23 : null;
    if (!paperMatch) continue;
    const seasonLine = /(\d{4}).*(May\/June|Oct\/Nov|Feb\/Mar)/i.exec(b);
    const year = seasonLine ? parseInt(seasonLine[1], 10) : null;
    const season = seasonLine ? seasonLine[2] : null;
    const prefix = normalizeSeason(season);
    const code = prefix && year ? `${prefix}${String(year).slice(2)}P${String(paperMatch).padStart(2, '0')}` : `U00P${String(paperMatch).padStart(2, '0')}`;

    const qLine = lines.find(l => /^Q(uestion)?\s*:/.test(l)) || lines[0];
    const aIndex = lines.findIndex(l => /^A(ns(wer)?)?\s*:/.test(l));
    const tLine = lines.find(l => /^T(opic)?\s*:/.test(l));
    const mLine = lines.find(l => /^Marks?\s*:/.test(l));
    const tagsLine = lines.find(l => /^Tags?\s*:/.test(l));
    const kwLine = lines.find(l => /^Keywords?\s*:/.test(l));
    const question = String(qLine).replace(/^Q(uestion)?\s*:\s*/, '');
    const answer = aIndex >= 0 ? lines.slice(aIndex).join('\n').replace(/^A(ns(wer)?)?\s*:\s*/, '') : lines.slice(1).join('\n');
    const topic = tLine ? tLine.replace(/^T(opic)?\s*:\s*/, '') : 'Uncategorised';
    const marks = mLine ? parseInt(mLine.replace(/^Marks?\s*:\s*/, ''), 10) : undefined;
    const tags = tagsLine ? tagsLine.replace(/^Tags?\s*:\s*/, '').split(',').map(s => s.trim()).filter(Boolean) : undefined;
    const keywords = kwLine ? kwLine.replace(/^Keywords?\s*:\s*/, '').split(',').map(s => s.trim()).filter(Boolean) : undefined;
    const item = { question, answer, paper: code, topic, tags, marks, keywords };
    if (!byCode.has(code)) byCode.set(code, []);
    byCode.get(code).push(item);
  }
  return byCode;
}

function main() {
  const [inputPath, seasonOverride] = process.argv.slice(2);
  if (!inputPath) {
    console.error('Usage: node scripts/convertPaper2.mjs <input.txt> [S24|W24|M24]');
    process.exit(1);
  }
  const raw = readFileSync(inputPath, 'utf8');
  let map = parseBlocks(raw);
  if (seasonOverride) {
    const m = String(seasonOverride).trim().toUpperCase();
    const entries = Array.from(map.entries());
    map = new Map(entries.map(([code, arr]) => {
      const num = /P(\d{2})$/i.exec(code)?.[1] || '21';
      const fileCode = `${m.replace(/^[SWM]/, m[0])}${num ? '' : ''}${'P' + num}`;
      const normalized = `${m[0]}${m.slice(1)}P${num}`;
      return [normalized, arr.map(it => ({ ...it, paper: normalized }))];
    }));
  }
  const outDir = join(process.cwd(), 'src', 'data', 'papers');
  for (const [code, arr] of map.entries()) {
    const file = join(outDir, `${code.toLowerCase()}.json`);
    writeFileSync(file, JSON.stringify(arr, null, 2) + '\n', 'utf8');
  }
  console.log('Converted codes: ', Array.from(map.keys()).join(', '));
}

main();
