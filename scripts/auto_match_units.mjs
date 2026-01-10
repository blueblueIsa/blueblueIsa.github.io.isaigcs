import fs from 'fs';
import path from 'path';

const repoRoot = path.resolve(new URL(import.meta.url).pathname, '..', '..');
const unitsPath = path.join(repoRoot, 'src', 'data', 'units.ts');
const qaPath = path.join(repoRoot, 'src', 'data', 'qa.ts');
const papersDir = path.join(repoRoot, 'src', 'data', 'papers');
const reportPath = path.join(repoRoot, 'scripts', 'verify_units_report.json');

function readUnits() {
  // Fallback parser that finds unit blocks and extracts term objects without evaluating TS
  const raw = fs.readFileSync(unitsPath, 'utf8');
  const units = [];
  let idx = 0;
  while (true) {
    const idMatch = raw.slice(idx).match(/\b{id?\s*:\s*"([^"]+)"/);
    // Better: find next `id: "...",` that is at top-level of a unit definition
    const nextUnitMatch = raw.slice(idx).match(/\{\s*id\s*:\s*"([^"]+)"[\s\S]*?terms\s*:\s*\[/m);
    if (!nextUnitMatch) break;
    const unitStart = idx + nextUnitMatch.index;
    const unitId = nextUnitMatch[1];
    // find the 'terms: [' position
    const termsPos = raw.indexOf('terms', unitStart);
    const bracketPos = raw.indexOf('[', termsPos);
    if (termsPos === -1 || bracketPos === -1) break;
    // scan forward to find matching closing bracket for the terms array
    let depth = 0;
    let pos = bracketPos;
    let endPos = -1;
    while (pos < raw.length) {
      const ch = raw[pos];
      if (ch === '[') depth++;
      else if (ch === ']') {
        depth--;
        if (depth === 0) { endPos = pos; break; }
      }
      pos++;
    }
    if (endPos === -1) break;
    const termsBlock = raw.slice(bracketPos + 1, endPos);
    // also capture the unit title by looking backward a little
    const preBlock = raw.slice(Math.max(0, unitStart - 200), Math.min(raw.length, endPos + 200));
    const titleMatch = preBlock.match(/title\s*:\s*"([^"]+)"/);
    const unitTitle = titleMatch ? titleMatch[1] : undefined;
    // now extract individual term object literals using a simple scan for top-level braces
    const terms = [];
    let p = 0;
    while (p < termsBlock.length) {
      // find next '{'
      const s = termsBlock.indexOf('{', p);
      if (s === -1) break;
      let d = 0;
      let q = s;
      let objEnd = -1;
      while (q < termsBlock.length) {
        const ch2 = termsBlock[q];
        if (ch2 === '{') d++;
        else if (ch2 === '}') {
          d--;
          if (d === 0) { objEnd = q; break; }
        }
        q++;
      }
      if (objEnd === -1) break;
      const objText = termsBlock.slice(s + 1, objEnd);
      // crude extraction of fields: term, definition, example, sourceVerified
      const termMatch = objText.match(/term\s*:\s*(?:"([^"]+)"|'([^']+)')/);
      const defMatch = objText.match(/definition\s*:\s*(?:"([\s\S]*?)"|'([\s\S]*?)')(?:,|$)/);
      const exMatch = objText.match(/example\s*:\s*(?:"([\s\S]*?)"|'([\s\S]*?)')(?:,|$)/);
      const svMatch = objText.match(/sourceVerified\s*:\s*(true|false)/);
      const termObj = {
        term: termMatch ? (termMatch[1] || termMatch[2]) : undefined,
        definition: defMatch ? (defMatch[1] || defMatch[2]).replace(/\\"/g, '"') : undefined,
        example: exMatch ? (exMatch[1] || exMatch[2]).replace(/\\"/g, '"') : undefined,
        sourceVerified: svMatch ? svMatch[1] === 'true' : false
      };
      terms.push(termObj);
      p = objEnd + 1;
    }
    units.push({id: unitId, title: unitTitle, terms});
    idx = endPos + 1;
  }
  return units;
}

function readQA() {
  const raw = fs.readFileSync(qaPath, 'utf8');
  // try to extract exported `qa` or default structure as JSON
  const match = raw.match(/export\s+const\s+qa\s*=\s*(\{[\s\S]*?\});/m);
  if (!match) return {};
  const js = match[1]
    .replace(/([\w_]+)\s*:\s*/g, '"$1": ')
    .replace(/,\s*}/g, '}')
    .replace(/,\s*\]/g, ']');
  const qa = Function(`"use strict"; return (${js});`)();
  return qa;
}

function readPapers() {
  const files = fs.readdirSync(papersDir).filter(f => f.endsWith('.json'));
  return files.map(f => {
    const data = JSON.parse(fs.readFileSync(path.join(papersDir, f), 'utf8'));
    return {file: f, data};
  });
}

function normalize(s) {
  if (!s) return '';
  return s.toLowerCase().replace(/\s+/g, ' ').trim();
}

function quickMatches(term, candidates) {
  // unit term objects use `term.term` for the name
  const t = normalize(term.term || term.name || '');
  const def = normalize(term.definition || '') + ' ' + normalize(term.example || '');
  const matches = [];
  for (const cand of candidates) {
    const text = normalize((cand.text || cand.definition || cand.q || cand.question || cand.answer || cand.a || '').toString());
    if (!text) continue;
    if (t && (text.includes(t) || t.includes(text))) {
      matches.push({source: cand.source, excerpt: cand.text || cand.definition || cand.q || cand.question || cand.answer || cand.a, score: 1.0, type: 'exact'});
    } else if (def && (text.includes(def) || def.includes(text))) {
      matches.push({source: cand.source, excerpt: cand.text || cand.definition || cand.q || cand.question || cand.answer || cand.a, score: 0.9, type: 'def-exact'});
    }
  }
  return matches;
}

function buildCandidates(qa, papers) {
  const cand = [];
  // QA entries
  for (const k of Object.keys(qa)) {
    const group = qa[k];
    if (Array.isArray(group)) {
      for (const item of group) {
        cand.push({source: `qa:${k}`, text: item.q || item.question || item.name, definition: item.a || item.answer || item.definition});
      }
    }
  }
  // papers
  for (const p of papers) {
    // attempt to flatten objects
    const flatText = JSON.stringify(p.data).slice(0, 2000); // limit size
    cand.push({source: `paper:${p.file}`, text: flatText});
  }
  return cand;
}

function main() {
  console.log('Reading units...');
  const units = readUnits();
  console.log(`Found ${units.length} units`);
  console.log('Reading QA...');
  const qa = readQA();
  console.log('Reading papers...');
  const papers = readPapers();
  const candidates = buildCandidates(qa, papers);

  const report = [];
  for (const unit of units) {
    for (const term of unit.terms || []) {
      const matches = quickMatches(term, candidates);
      report.push({unitId: unit.id, unitTitle: unit.title, term: term.term, sourceVerified: !!term.sourceVerified, matches});
    }
  }

  // write merged report (augment existing if present)
  let prev = {};
  try { prev = JSON.parse(fs.readFileSync(reportPath, 'utf8')); } catch (e) {}
  const out = {generatedAt: new Date().toISOString(), mode: 'quick-scan', results: report};
  fs.writeFileSync(reportPath, JSON.stringify(out, null, 2), 'utf8');
  console.log(`Wrote ${reportPath} with ${report.length} term entries`);

  // compute exact paper matches (term name + definition both included in paper JSON text)
  const paperTexts = papers.map(p => ({file: p.file, text: JSON.stringify(p.data)}));
  for (const r of report) {
    r.exactPaperMatches = [];
    const termNorm = normalize(r.term || '');
    const defNorm = normalize((r.definition || ''));
    for (const p of paperTexts) {
      const t = normalize(p.text);
      if (termNorm && t.includes(termNorm) && defNorm && t.includes(defNorm)) {
        r.exactPaperMatches.push(p.file);
      }
    }
  }

  // write CSV report
  const csvPath = path.join(path.dirname(reportPath), 'verify_units_report.csv');
  const csvHeader = ['unitId','unitTitle','term','sourceVerified','matches','exactPaperMatches'];
  const csvRows = [csvHeader.join(',')];
  for (const r of report) {
    const matchesStr = (r.matches || []).map(m => `${m.source}:${m.type}`).join('|').replace(/\n/g, ' ');
    const exactStr = (r.exactPaperMatches || []).join('|');
    const row = [r.unitId, (r.unitTitle||'').replace(/,/g, ' '), (r.term||'').replace(/,/g, ' '), String(r.sourceVerified), `"${matchesStr}"`, `"${exactStr}"`];
    csvRows.push(row.join(','));
  }
  fs.writeFileSync(csvPath, csvRows.join('\n'), 'utf8');
  console.log(`Wrote CSV: ${csvPath}`);

  // print a short sample
  const sample = report.slice(0, 10).filter(r => (r.matches && r.matches.length > 0) || (r.exactPaperMatches && r.exactPaperMatches.length > 0));
  console.log('Sample matches (up to 10):');
  for (const s of sample) {
    console.log(`- ${s.unitId} / ${s.term} -> matches: ${s.matches.map(m => m.source).join(', ')} exactPaperMatches: ${(s.exactPaperMatches||[]).join(', ')}`);
  }
}

main();
