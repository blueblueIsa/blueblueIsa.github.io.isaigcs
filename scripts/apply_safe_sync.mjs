import fs from 'fs';
import path from 'path';

const repoRoot = path.resolve(new URL(import.meta.url).pathname, '..', '..');
const unitsPath = path.join(repoRoot, 'src', 'data', 'units.ts');
const proposalsPath = path.join(repoRoot, 'src', 'data', 'safe_sync_proposals.json');

function normalize(s){ return s==null? '': s.toString().replace(/\r\n?/g,'\n').trim();}

const proposals = JSON.parse(fs.readFileSync(proposalsPath,'utf8'));
// filter to define/state/describe questions (case-insensitive)
const defineRegex = /^(define|state|describe)\b/i;
const candidates = proposals.filter(p => defineRegex.test((p.question||'').trim()));

// dedupe by unitId+term: prefer the one with shortest paperAnswer length
const byKey = new Map();
for (const c of candidates) {
  const key = `${c.unitId}|||${c.term}`;
  if (!byKey.has(key) || (c.paperAnswer||'').length < (byKey.get(key).paperAnswer||'').length) {
    byKey.set(key,c);
  }
}
const picks = Array.from(byKey.values());
console.log(`Applying ${picks.length} safe updates (define/state/describe) to units.ts`);

let raw = fs.readFileSync(unitsPath,'utf8');
const log = [];
for (const p of picks) {
  const term = p.term;
  const oldDefMatch = new RegExp(`(\{[^}]*?term\s*:\s*\\"${escapeRegExp(term)}\\"[\s\S]*?definition\s*:\s*)(?:"([\\s\\S]*?)"|'([\\s\\S]*?)')`);
  const m = raw.match(oldDefMatch);
  if (!m) {
    console.warn(`Could not find term block for ${term}`);
    continue;
  }
  const oldDef = m[2] || m[3] || '';
  const newDef = p.paperAnswer;
  if (normalize(oldDef) === normalize(newDef)) {
    continue; // no change
  }
  const escaped = newDef.replace(/"/g, '\\"').replace(/\n/g, '\\n');
  const replaced = raw.replace(oldDefMatch, `$1"${escaped}"`);
  raw = replaced;
  log.push({unitId: p.unitId, term, oldDefinition: oldDef, newDefinition: newDef, source: p.paperFile});
}
if (log.length === 0) {
  console.log('No updates applied');
  process.exit(0);
}
fs.writeFileSync(unitsPath + '.bak2', fs.readFileSync(unitsPath,'utf8'));
fs.writeFileSync(unitsPath, raw, 'utf8');
fs.writeFileSync(path.join(path.dirname(unitsPath),'safe_sync_applied.json'), JSON.stringify(log,null,2),'utf8');
fs.writeFileSync(path.join(path.dirname(unitsPath),'safe_sync_applied.txt'), log.map(l => `${l.unitId} / ${l.term} FROM (${l.source})\n- OLD: ${l.oldDefinition}\n- NEW: ${l.newDefinition}\n`).join('\n'),'utf8');
console.log('Wrote safe_sync_applied.json and safe_sync_applied.txt and created backup units.ts.bak2');

function escapeRegExp(s){ return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
