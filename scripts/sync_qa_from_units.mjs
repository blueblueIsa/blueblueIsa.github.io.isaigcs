import fs from 'fs';
import path from 'path';

const repoRoot = path.resolve(new URL(import.meta.url).pathname, '..', '..');
const unitsPath = path.join(repoRoot, 'src', 'data', 'units.ts');
const qaPath = path.join(repoRoot, 'src', 'data', 'qa.ts');

function parseUnits() {
  const raw = fs.readFileSync(unitsPath, 'utf8');
  const units = [];
  let idx = 0;
  while (true) {
    const nextUnitMatch = raw.slice(idx).match(/\{\s*id\s*:\s*"([^"]+)"[\s\S]*?terms\s*:\s*\[/m);
    if (!nextUnitMatch) break;
    const unitStart = idx + nextUnitMatch.index;
    const unitId = nextUnitMatch[1];
    const termsPos = raw.indexOf('terms', unitStart);
    const bracketPos = raw.indexOf('[', termsPos);
    if (termsPos === -1 || bracketPos === -1) break;
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
    const terms = [];
    let p = 0;
    while (p < termsBlock.length) {
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
      const termMatch = objText.match(/term\s*:\s*(?:"([^"]+)"|'([^']+)')/);
      const defMatch = objText.match(/definition\s*:\s*(?:"([\s\S]*?)"|'([\s\S]*?)')/);
      if (termMatch) terms.push({term: termMatch[1]||termMatch[2], definition: defMatch ? (defMatch[1]||defMatch[2]).replace(/\\"/g,'"') : ''});
      p = objEnd + 1;
    }
    units.push({id: unitId, terms});
    idx = endPos + 1;
  }
  return units;
}

function normalize(s){ return s==null?'': s.toString().replace(/\r\n?/g,'\n').trim(); }

function loadQA() {
  const raw = fs.readFileSync(qaPath,'utf8');
  // crude: find question/answer pairs by regex
  const pairs = [];
  const qRegex = /question\s*:\s*"([\s\S]*?)"[\s\S]*?answer\s*:\s*"([\s\S]*?)"/g;
  let m; while (m = qRegex.exec(raw)) { pairs.push({question: m[1], answer: m[2]}); }
  return pairs;
}

function findTermByName(units, termName) {
  for (const u of units) {
    for (const t of u.terms) {
      if (t.term && t.term.toLowerCase() === termName.toLowerCase()) return t;
    }
  }
  return null;
}

function main() {
  const units = parseUnits();
  const qaPairs = loadQA();
  const proposals = [];
  const defineRegex = /^\s*(define|state)\b\s*(?:what is|the)?\s*(.*)$/i;
  for (const pair of qaPairs) {
    const q = pair.question.trim();
    // attempt to extract term from question, e.g., 'Define colour depth' -> 'colour depth'
    const defineMatch = q.match(/^\s*(?:define|state|describe)\s+([A-Za-z0-9 \-\'\(\)]+)[\?\.]?$/i);
    if (!defineMatch) continue;
    const termName = defineMatch[1].trim();
    const term = findTermByName(units, termName);
    if (!term) continue;
    const unitDef = normalize(term.definition);
    const qaAns = normalize(pair.answer);
    if (unitDef && unitDef !== qaAns) {
      proposals.push({term: termName, question: q, oldAnswer: pair.answer, suggestedAnswer: term.definition});
    }
  }
  fs.writeFileSync(path.join(path.dirname(qaPath),'qa_sync_proposals.json'), JSON.stringify(proposals,null,2),'utf8');
  console.log(`Found ${proposals.length} QA entries that differ and could be synced to units definitions. Written to qa_sync_proposals.json`);
}

main();
