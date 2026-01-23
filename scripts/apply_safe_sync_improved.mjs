import fs from 'fs';
import path from 'path';

const repoRoot = path.resolve(new URL(import.meta.url).pathname, '..', '..');
const unitsPath = path.join(repoRoot, 'src', 'data', 'units.ts');
const proposalsPath = path.join(repoRoot, 'src', 'data', 'safe_sync_proposals.json');

function normalize(s){ return s==null? '': s.toString().replace(/\r\n?/g,'\n').trim();}

const proposals = JSON.parse(fs.readFileSync(proposalsPath,'utf8'));
const defineRegex = /^(define|state|describe)\b/i;
const candidates = proposals.filter(p => defineRegex.test((p.question||'').trim()));

// dedupe by unitId+term: pick shortest answer (more likely concise def)
const byKey = new Map();
for (const c of candidates) {
  const key = `${c.unitId}|||${c.term}`;
  if (!byKey.has(key) || (c.paperAnswer||'').length < (byKey.get(key).paperAnswer||'').length) {
    byKey.set(key,c);
  }
}
const picks = Array.from(byKey.values());
console.log(`Attempting ${picks.length} safe updates (define/state/describe)`);

let raw = fs.readFileSync(unitsPath,'utf8');
const log = [];

for (const p of picks) {
  const term = p.term;
  const termToken = `term: \"${escapeRegExp(term)}\"`;
  const foundIdx = raw.indexOf(termToken);
  if (foundIdx === -1) {
    console.warn(`Could not find term token for ${term}`);
    continue;
  }
  // find the nearest object start '{' before foundIdx
  const objStart = raw.lastIndexOf('{', foundIdx);
  const objEnd = raw.indexOf('}', foundIdx);
  if (objStart === -1 || objEnd === -1) {
    console.warn(`Could not find object boundaries for ${term}`);
    continue;
  }
  const objText = raw.slice(objStart, objEnd+1);
  const defMatch = objText.match(/definition\s*:\s*(?:"([\s\S]*?)"|'([\s\S]*?)')/);
  if (!defMatch) {
    console.warn(`No definition field found for ${term}`);
    continue;
  }
  const oldDef = defMatch[1] || defMatch[2] || '';
  const newDef = p.paperAnswer;
  if (normalize(oldDef) === normalize(newDef)) {
    // already matches
    continue;
  }
  // conservative checks
  const isNumericAnswer = /^[-+]?\d+(\.\d+)?$/m.test((newDef||'').trim());
  const termLooksNumeric = /byte|bits|bytes|kibibyte|kib|kibi|kb|kiB|bit/i.test(term);
  if (isNumericAnswer && !termLooksNumeric) {
    console.log(`Skipping numeric-only answer for non-numeric term ${term}`);
    continue;
  }
  // apply replacement in the full raw by replacing the first occurrence of oldDef in the object
  const escapedNew = newDef.replace(/"/g,'\\"').replace(/\n/g,'\\n');
  const objTextNew = objText.replace(defMatch[0], `definition: "${escapedNew}"`);
  raw = raw.slice(0, objStart) + objTextNew + raw.slice(objEnd+1);
  log.push({unitId: p.unitId, term, oldDefinition: oldDef, newDefinition: newDef, source: p.paperFile, question: p.question});
  console.log(`Updated ${p.unitId} / ${term}`);
}

if (log.length === 0) {
  console.log('No safe updates applied.');
  process.exit(0);
}
fs.writeFileSync(unitsPath + '.bak3', fs.readFileSync(unitsPath,'utf8'));
fs.writeFileSync(unitsPath, raw, 'utf8');
fs.writeFileSync(path.join(path.dirname(unitsPath),'safe_sync_applied_improved.json'), JSON.stringify(log,null,2),'utf8');
fs.writeFileSync(path.join(path.dirname(unitsPath),'safe_sync_applied_improved.txt'), log.map(l => `${l.unitId} / ${l.term} FROM (${l.source})\nQ: ${l.question}\n- OLD: ${l.oldDefinition}\n- NEW: ${l.newDefinition}\n`).join('\n'),'utf8');
console.log(`Applied ${log.length} updates; backup at units.ts.bak3 and logs written.`);

function escapeRegExp(s){ return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
