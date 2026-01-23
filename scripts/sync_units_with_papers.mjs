import fs from 'fs';
import path from 'path';

const repoRoot = path.resolve(new URL(import.meta.url).pathname, '..', '..');
const unitsPath = path.join(repoRoot, 'src', 'data', 'units.ts');
const papersDir = path.join(repoRoot, 'src', 'data', 'papers');
const qaPath = path.join(repoRoot, 'src', 'data', 'qa.ts');

function readUnitsRaw() {
  return fs.readFileSync(unitsPath, 'utf8');
}

// reuse simple parser from auto_match to get unit/term/definition
function parseUnits() {
  const raw = readUnitsRaw();
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

function flattenPaperAnswers(papers) {
  const answers = [];
  for (const p of papers) {
    // traverse object and collect all `answer` fields and also `question` fields if present
    function walk(obj, prefix = []) {
      if (Array.isArray(obj)) {
        for (const it of obj) walk(it, prefix);
      } else if (obj && typeof obj === 'object') {
        for (const k of Object.keys(obj)) {
          if (k === 'answer' && obj[k]) {
            answers.push({file: p.file, text: obj[k], path: [...prefix, k].join('.')});
          } else if (typeof obj[k] === 'object') {
            walk(obj[k], [...prefix, k]);
          }
        }
      }
    }
    walk(p.data);
  }
  return answers;
}

function normalize(s) {
  if (s == null) return '';
  // normalize line endings and trim
  return s.toString().replace(/\r\n?/g, '\n').trim();
}

function applyUpdates(changes) {
  let raw = readUnitsRaw();
  const log = [];
  // process changes in reverse file index order to keep string positions valid
  const sorted = changes.slice().sort((a,b) => b.unitIndex - a.unitIndex || b.termIndex - a.termIndex);
  for (const c of sorted) {
    const before = raw.slice(c.objStart, c.objEnd);
    // find definition: "..." occurs inside before; replace the first occurrence of definition value
    const newDefEscaped = c.newDefinition.replace(/"/g, '\\"').replace(/\n/g, '\n');
    const defRegex = /definition\s*:\s*(?:"([\s\S]*?)"|'([\s\S]*?)')/;
    const newObj = before.replace(defRegex, `definition: "${newDefEscaped}"`);
    raw = raw.slice(0, c.objStart) + newObj + raw.slice(c.objEnd);
    log.push({unitId: c.unitId, term: c.term, oldDefinition: c.oldDefinition, newDefinition: c.newDefinition, source: c.sourceFile});
  }
  // write backup and new file
  fs.writeFileSync(unitsPath + '.bak', fs.readFileSync(unitsPath, 'utf8'), 'utf8');
  fs.writeFileSync(unitsPath, raw, 'utf8');
  fs.writeFileSync(path.join(path.dirname(unitsPath), 'sync_changes.json'), JSON.stringify(log, null, 2), 'utf8');
  fs.writeFileSync(path.join(path.dirname(unitsPath), 'sync_changes.txt'), log.map(l => `${l.unitId} / ${l.term} FROM (${l.source})\n- OLD: ${l.oldDefinition}\n- NEW: ${l.newDefinition}\n`).join('\n'), 'utf8');
  return log;
}

function main() {
  console.log('Parsing units...');
  const units = parseUnits();
  console.log(`Found ${units.length} units`);
  const papers = readPapers();
  console.log(`Loaded ${papers.length} paper files`);
  const paperAnswers = flattenPaperAnswers(papers);
  console.log(`Collected ${paperAnswers.length} answers from papers`);

  const changes = [];
  for (let ui = 0; ui < units.length; ui++) {
    const unit = units[ui];
    for (let ti = 0; ti < (unit.terms || []).length; ti++) {
      const term = unit.terms[ti];
      const unitTerm = term.term;
      const unitDef = normalize(term.definition || '');
      // find exact paper answer match
      const match = paperAnswers.find(pa => normalize(pa.text || '') === unitDef && normalize(pa.text || '').length > 0);
      if (match) {
        // exact match exists — ensure source is logged but no change needed
        continue;
      }
      // find paper answer that contains the unitDef as substring, or vice versa
      const contains = paperAnswers.find(pa => {
        const t = normalize(pa.text || '');
        return t.includes(unitDef) && unitDef.length > 0;
      });
      if (contains) {
        // if unitDef is substring of paper answer but not exact, update to paper answer
        changes.push({unitId: unit.id, term: unitTerm, oldDefinition: term.definition || '', newDefinition: contains.text, sourceFile: contains.file, unitIndex: ui, termIndex: ti, objStart: term.objStartIdx, objEnd: term.objEndIdx});
        continue;
      }
      // try reverse: paper answer shorter, unitDef contains paper answer
      const reverse = paperAnswers.find(pa => unitDef.includes(normalize(pa.text || '')) && normalize(pa.text || '').length > 0);
      if (reverse) {
        // prefer the paper answer as authoritative
        changes.push({unitId: unit.id, term: unitTerm, oldDefinition: term.definition || '', newDefinition: reverse.text, sourceFile: reverse.file, unitIndex: ui, termIndex: ti, objStart: term.objStartIdx, objEnd: term.objEndIdx});
        continue;
      }
      // no match found — try QA answers
      // load QA file and search for answers equal to unitDef
      try {
        const qaRaw = fs.readFileSync(qaPath, 'utf8');
        // look for question/answer pairs that reference the term name
        if (qaRaw.includes(unitTerm)) {
          // best-effort: find answer entries containing unitDefinition or term
          const regex = new RegExp(`question\s*:\s*"([\\s\\S]*?${escapeRegExp(unitTerm)}[\\s\\S]*?)"[\\s\\S]*?answer\s*:\s*"([\\s\\S]*?)"`, 'g');
          const m = regex.exec(qaRaw);
          if (m && m[2]) {
            const qaAns = m[2];
            if (normalize(qaAns) !== unitDef) {
              changes.push({unitId: unit.id, term: unitTerm, oldDefinition: term.definition || '', newDefinition: qaAns, sourceFile: 'qa.ts', unitIndex: ui, termIndex: ti, objStart: term.objStartIdx, objEnd: term.objEndIdx});
            }
          }
        }
      } catch (e) {}
    }
  }

  if (changes.length === 0) {
    console.log('No changes required: all unit definitions match paper answers or QA entries (exact or contained).');
    return;
  }
  console.log(`Applying ${changes.length} changes to ${unitsPath}`);
  const log = applyUpdates(changes);
  console.log('Changes applied. Wrote backup and change logs:');
  console.log('- ' + unitsPath + '.bak');
  console.log('- ' + path.join(path.dirname(unitsPath), 'sync_changes.json'));
  console.log('- ' + path.join(path.dirname(unitsPath), 'sync_changes.txt'));
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

main();
