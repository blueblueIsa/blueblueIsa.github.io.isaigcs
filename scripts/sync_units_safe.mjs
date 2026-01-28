import fs from 'fs';
import path from 'path';

const repoRoot = path.resolve(new URL(import.meta.url).pathname, '..', '..');
const unitsPath = path.join(repoRoot, 'src', 'data', 'units.ts');
const papersDir = path.join(repoRoot, 'src', 'data', 'papers');

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
    const preBlock = raw.slice(Math.max(0, unitStart - 200), Math.min(raw.length, endPos + 200));
    const titleMatch = preBlock.match(/title\s*:\s*"([^"]+)"/);
    const unitTitle = titleMatch ? titleMatch[1] : undefined;
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
      const defMatch = objText.match(/definition\s*:\s*(?:"([\s\S]*?)"|'([\s\S]*?)')(?:,|$)/);
      const termObj = {
        term: termMatch ? (termMatch[1] || termMatch[2]) : undefined,
        definition: defMatch ? (defMatch[1] || defMatch[2]).replace(/\\"/g, '"') : undefined,
        rawObjText: objText,
        objStartIdx: unitStart + (bracketPos - unitStart) + 1 + s,
        objEndIdx: unitStart + (bracketPos - unitStart) + 1 + objEnd
      };
      terms.push(termObj);
      p = objEnd + 1;
    }
    units.push({id: unitId, title: unitTitle, terms});
    idx = endPos + 1;
  }
  return units;
}

function readPapers() {
  const files = fs.readdirSync(papersDir).filter(f => f.endsWith('.json'));
  return files.map(f => ({file: f, data: JSON.parse(fs.readFileSync(path.join(papersDir, f), 'utf8'))}));
}

function flattenWithMeta(papers) {
  const entries = [];
  for (const p of papers) {
    function walk(obj, contextPath = []) {
      if (Array.isArray(obj)) {
        for (const it of obj) walk(it, contextPath);
      } else if (obj && typeof obj === 'object') {
        if (obj.question && obj.answer) {
          entries.push({file: p.file, question: obj.question, answer: obj.answer, key_terms: obj.key_terms || obj.key_terms || obj.key_terms || [], keywords: obj.keywords || []});
        }
        for (const k of Object.keys(obj)) {
          if (typeof obj[k] === 'object') walk(obj[k], [...contextPath, k]);
        }
      }
    }
    walk(p.data);
  }
  return entries;
}

function normalize(s) {
  return s == null ? '' : s.toString().replace(/\r\n?/g, '\n').trim().toLowerCase();
}

function tokenSet(s) {
  return new Set((s||'').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean));
}

function proposeChanges() {
  const units = parseUnits();
  const papers = readPapers();
  const entries = flattenWithMeta(papers);
  const proposals = [];
  for (const unit of units) {
    for (const term of unit.terms || []) {
      const tname = term.term;
      const tnorm = normalize(tname);
      const tdef = normalize(term.definition || '');
      // find candidate paper entries where either question or key_terms mention the term (word boundary)
      const candidates = entries.filter(e => {
        const qn = normalize(e.question || '');
        const key = (e.key_terms || []).map(k => normalize(k));
        const inQuestion = new RegExp(`\\b${escapeRegExp(tnorm.replace(/\s+/g,' '))}\\b`).test(qn);
        const inKeyTerms = key.includes(tnorm) || key.some(k => k.includes(tnorm) || tnorm.includes(k));
        // also check keywords
        const kw = (e.keywords || []).map(k => normalize(k));
        const inKeywords = kw.includes(tnorm) || kw.some(k => k.includes(tnorm));
        return inQuestion || inKeyTerms || inKeywords;
      });
      // from candidates pick those where normalized answer differs from tdef
      for (const c of candidates) {
        const anum = normalize(c.answer || '');
        if (anum && anum !== tdef) {
          // be conservative: do not adopt numeric-only answers for non-numeric terms
          const isNumericAnswer = /^[-+]?\d+(\.\d+)?$/m.test(c.answer.trim());
          const termLooksNumeric = /byte|bits|bytes|kibibyte|kiB|kiB/i.test(tname);
          if (isNumericAnswer && !termLooksNumeric) continue;
          proposals.push({unitId: unit.id, term: tname, unitDef: term.definition || '', paperFile: c.file, question: c.question, paperAnswer: c.answer});
        }
      }
    }
  }
  return proposals;
}

function escapeRegExp(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function main() {
  console.log('Running safe proposal pass...');
  const proposals = proposeChanges();
  if (!proposals.length) {
    console.log('No safe proposals found.');
    return;
  }
  console.log(`Found ${proposals.length} safe proposal(s):`);
  for (const p of proposals) {
    console.log(`- ${p.unitId} / ${p.term} -> paper: ${p.paperFile} (Q: ${p.question.replace(/\n/g,' ')})\n  OLD: ${p.unitDef}\n  PAPER-A: ${p.paperAnswer}`);
  }
  fs.writeFileSync(path.join(path.dirname(unitsPath), 'safe_sync_proposals.json'), JSON.stringify(proposals, null, 2), 'utf8');
  console.log('Wrote safe_sync_proposals.json');
}

main();
