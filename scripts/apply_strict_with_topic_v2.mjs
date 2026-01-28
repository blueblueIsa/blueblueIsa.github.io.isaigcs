import fs from 'fs';
import path from 'path';

const repoRoot = path.resolve(new URL(import.meta.url).pathname, '..', '..');
const unitsPath = path.join(repoRoot, 'src', 'data', 'units.ts');
const proposalsPath = path.join(repoRoot, 'src', 'data', 'safe_sync_proposals.json');
const papersDir = path.join(repoRoot, 'src', 'data', 'papers');

function normalize(s){ return s==null? '': s.toString().replace(/\r\n?/g,'\n').trim().toLowerCase();}
function tokenRegex(term){ return new RegExp(`\\b${term.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')}\\b`, 'i'); }

const proposals = JSON.parse(fs.readFileSync(proposalsPath,'utf8'));
const defineRegex = /^(define|state|describe)\b/i;
const candidates = proposals.filter(p => defineRegex.test((p.question||'').trim()));

const byKey = new Map();
for (const c of candidates) {
  const key = `${c.unitId}|||${c.term}`;
  if (!byKey.has(key) || (c.paperAnswer||'').length < (byKey.get(key).paperAnswer||'').length) {
    byKey.set(key,c);
  }
}
const picks = Array.from(byKey.values());
console.log(`Strict topic-v2 pass: ${picks.length} candidates`);

let raw = fs.readFileSync(unitsPath,'utf8');
const log = [];

for (const p of picks) {
  const term = p.term;
  const q = p.question;
  const paperFile = p.paperFile;
  let paperObj = null;
  try {
    const pdf = JSON.parse(fs.readFileSync(path.join(papersDir, paperFile),'utf8'));
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
  } catch (e) { console.warn(`Failed to load ${paperFile}`); }

  const containsTermInQuestion = tokenRegex(term).test(q || '');
  const paperTopic = paperObj && (paperObj.topic ? normalize(paperObj.topic) : null);

  // find term in units.ts with its topic
  const termTokenStr = `term: \"${term.replace(/"/g,'\"')}\"`;
  const foundIdx = raw.indexOf(termTokenStr);
  if (foundIdx === -1) { console.warn(`Could not find term ${term} in units.ts`); continue; }
  const objStart = raw.lastIndexOf('{', foundIdx);
  const objEnd = raw.indexOf('}', foundIdx);
  if (objStart === -1 || objEnd === -1) { console.warn(`Obj bounds missing for ${term}`); continue; }
  const objText = raw.slice(objStart, objEnd+1);
  const topicMatch = objText.match(/topic\s*:\s*(?:"([^"]+)"|'([^']+)')/);
  const unitTopic = topicMatch ? normalize(topicMatch[1] || topicMatch[2]) : null;

  const keyTermsIncluded = paperObj && Array.isArray(paperObj.key_terms) && paperObj.key_terms.map(k=>normalize(k)).includes(normalize(term));

  // require: (containsTermInQuestion AND topicsMatch) OR key_terms_include
  const topicsMatch = paperTopic && unitTopic && (paperTopic.includes(unitTopic) || unitTopic.includes(paperTopic));
  if (!(keyTermsIncluded || (containsTermInQuestion && topicsMatch))) {
    console.log(`Skipping ${term} (term-in-question? ${containsTermInQuestion}, topicsMatch? ${topicsMatch}, keyTerms? ${keyTermsIncluded})`);
    continue;
  }

  const defMatch = objText.match(/definition\s*:\s*(?:"([\s\S]*?)"|'([\s\S]*?)')/);
  if (!defMatch) { console.warn(`No definition field for ${term}`); continue; }
  const oldDef = defMatch[1] || defMatch[2] || '';
  const newDef = p.paperAnswer;
  if (normalize(oldDef) === normalize(newDef)) { continue; }
  const isNumericAnswer = /^[-+]?\d+(\.\d+)?$/m.test((newDef||'').trim());
  const termLooksNumeric = /byte|bytes|bits|kibibyte|kib|kB|kiB/i.test(term);
  if (isNumericAnswer && !termLooksNumeric) { console.log(`Skipping numeric-only for ${term}`); continue; }
  const escapedNew = newDef.replace(/"/g,'\\"').replace(/\n/g,'\\n');
  const objTextNew = objText.replace(defMatch[0], `definition: "${escapedNew}"`);
  raw = raw.slice(0, objStart) + objTextNew + raw.slice(objEnd+1);
  log.push({unitId: p.unitId, term, unitTopic, paperTopic, oldDefinition: oldDef, newDefinition: newDef, source: paperFile, question: q});
  console.log(`Applied topic-v2 update to ${p.unitId} / ${term}`);
}

if (log.length === 0) { console.log('No topic-v2 updates applied.'); process.exit(0); }
fs.writeFileSync(unitsPath + '.bak6', fs.readFileSync(unitsPath,'utf8'));
fs.writeFileSync(unitsPath, raw, 'utf8');
fs.writeFileSync(path.join(path.dirname(unitsPath),'strict_topic_v2_applied.json'), JSON.stringify(log,null,2),'utf8');
fs.writeFileSync(path.join(path.dirname(unitsPath),'strict_topic_v2_applied.txt'), log.map(l => `${l.unitId} / ${l.term} (unitTopic=${l.unitTopic} paperTopic=${l.paperTopic}) FROM (${l.source})\nQ: ${l.question}\n- OLD: ${l.oldDefinition}\n- NEW: ${l.newDefinition}\n`).join('\n'),'utf8');
console.log('Wrote strict_topic_v2_applied.* and units.ts.bak6');
