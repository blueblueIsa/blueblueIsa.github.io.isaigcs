import fs from 'fs';
import path from 'path';

const repoRoot = path.resolve(new URL(import.meta.url).pathname, '..', '..');
const unitsPath = path.join(repoRoot, 'src', 'data', 'units.ts');
const proposalsPath = path.join(repoRoot, 'src', 'data', 'safe_sync_proposals.json');
const papersDir = path.join(repoRoot, 'src', 'data', 'papers');

function normalize(s){ return s==null? '': s.toString().replace(/\r\n?/g,'\n').trim();}
function termToken(term){ return new RegExp(`\\b${term.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')}\\b`, 'i'); }

const proposals = JSON.parse(fs.readFileSync(proposalsPath,'utf8'));
const defineRegex = /^(define|state|describe)\b/i;
const candidates = proposals.filter(p => defineRegex.test((p.question||'').trim()));

// group candidates by unit+term, pick shortest candidate answer
const byKey = new Map();
for (const c of candidates) {
  const key = `${c.unitId}|||${c.term}`;
  if (!byKey.has(key) || (c.paperAnswer||'').length < (byKey.get(key).paperAnswer||'').length) {
    byKey.set(key,c);
  }
}
const picks = Array.from(byKey.values());
console.log(`Strict pass: ${picks.length} candidates`);

let raw = fs.readFileSync(unitsPath,'utf8');
const log = [];

for (const p of picks) {
  const term = p.term;
  const q = p.question;
  const paperFile = p.paperFile;
  let paperObj = null;
  try {
    const pdf = JSON.parse(fs.readFileSync(path.join(papersDir, paperFile),'utf8'));
    // find object where question matches
    function walk(obj){
      if (Array.isArray(obj)) { for (const it of obj) { const found = walk(it); if (found) return found; } }
      else if (obj && typeof obj === 'object') {
        if (obj.question && normalize(obj.question) === normalize(q)) return obj;
        for (const k of Object.keys(obj)) {
          if (typeof obj[k] === 'object') { const found = walk(obj[k]); if (found) return found; }
        }
      }
      return null;
    }
    paperObj = walk(pdf);
  } catch (e) {}

  const containsTermInQuestion = termToken(term).test(q || '');
  const keyTermsInclude = paperObj && Array.isArray(paperObj.key_terms) && paperObj.key_terms.map(k=>normalize(k)).includes(normalize(term));
  if (!containsTermInQuestion && !keyTermsInclude) {
    console.log(`Skipping ${term} (no explicit term token in question nor key_terms)`);
    continue;
  }
  // find term object in units.ts
  const termTokenStr = `term: \"${term.replace(/"/g,'\"')}\"`;
  const foundIdx = raw.indexOf(termTokenStr);
  if (foundIdx === -1) { console.warn(`Could not find term ${term} in units.ts`); continue; }
  const objStart = raw.lastIndexOf('{', foundIdx);
  const objEnd = raw.indexOf('}', foundIdx);
  if (objStart === -1 || objEnd === -1) { console.warn(`Obj bounds missing for ${term}`); continue; }
  const objText = raw.slice(objStart, objEnd+1);
  const defMatch = objText.match(/definition\s*:\s*(?:"([\s\S]*?)"|'([\s\S]*?)')/);
  if (!defMatch) { console.warn(`No definition field for ${term}`); continue; }
  const oldDef = defMatch[1] || defMatch[2] || '';
  const newDef = p.paperAnswer;
  if (normalize(oldDef) === normalize(newDef)) { continue; }
  const isNumericAnswer = /^[-+]?\d+(\.\d+)?$/m.test((newDef||'').trim());
  const termLooksNumeric = /byte|bytes|bits|kibibyte|kiB|kB|kib/i.test(term);
  if (isNumericAnswer && !termLooksNumeric) { console.log(`Skipping numeric-only for ${term}`); continue; }
  // apply
  const escapedNew = newDef.replace(/"/g,'\\"').replace(/\n/g,'\\n');
  const objTextNew = objText.replace(defMatch[0], `definition: "${escapedNew}"`);
  raw = raw.slice(0, objStart) + objTextNew + raw.slice(objEnd+1);
  log.push({unitId: p.unitId, term, oldDefinition: oldDef, newDefinition: newDef, source: paperFile, question: q});
  console.log(`Applied strict update to ${p.unitId} / ${term}`);
}

if (log.length === 0) { console.log('No strict updates applied.'); process.exit(0); }
fs.writeFileSync(unitsPath + '.bak4', fs.readFileSync(unitsPath,'utf8'));
fs.writeFileSync(unitsPath, raw, 'utf8');
fs.writeFileSync(path.join(path.dirname(unitsPath),'strict_sync_applied.json'), JSON.stringify(log,null,2),'utf8');
fs.writeFileSync(path.join(path.dirname(unitsPath),'strict_sync_applied.txt'), log.map(l => `${l.unitId} / ${l.term} FROM (${l.source})\nQ: ${l.question}\n- OLD: ${l.oldDefinition}\n- NEW: ${l.newDefinition}\n`).join('\n'),'utf8');
console.log('Wrote strict_sync_applied.* and units.ts.bak4');
