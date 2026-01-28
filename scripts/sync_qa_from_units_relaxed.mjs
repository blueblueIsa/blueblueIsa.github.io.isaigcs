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
    const nextUnitMatch = raw.slice(idx).match(/\{\s*id\s*:\s*"([^\"]+)"[\s\S]*?terms\s*:\s*\[/m);
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
      const termMatch = objText.match(/term\s*:\s*(?:"([^\"]+)"|'([^']+)')/);
      const defMatch = objText.match(/definition\s*:\s*(?:"([\s\S]*?)"|'([\s\S]*?)')/);
      if (termMatch) terms.push({term: termMatch[1]||termMatch[2], definition: defMatch ? (defMatch[1]||defMatch[2]).replace(/\\"/g,'"') : ''});
      p = objEnd + 1;
    }
    units.push({id: unitId, terms});
    idx = endPos + 1;
  }
  return units;
}

function extractUnitSection(rawQa, unitId) {
  const key = `"${unitId}"\s*:`;
  const idx = rawQa.search(new RegExp(key));
  if (idx === -1) return '';
  const bracePos = rawQa.indexOf('{', idx);
  if (bracePos === -1) return '';
  let depth = 0;
  let pos = bracePos;
  while (pos < rawQa.length) {
    const ch = rawQa[pos];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) {
        return rawQa.slice(bracePos + 1, pos);
      }
    }
    pos++;
  }
  return '';
}

function findQuestionObjects(sectionText) {
  // match question/answer/paper/keywords blocks crudely
  const qRegex = /\{([\s\S]*?question\s*:\s*"([\s\S]*?)"[\s\S]*?answer\s*:\s*"([\s\S]*?)")[\s\S]*?\}/g;
  const pairs = [];
  let m;
  while (m = qRegex.exec(sectionText)) {
    const whole = m[1];
    const question = (m[2]||'').trim();
    const answer = (m[3]||'').trim();
    const paperMatch = whole.match(/paper\s*:\s*"([^\"]+)"/);
    const paper = paperMatch ? paperMatch[1] : '';
    const keywordsMatch = whole.match(/keywords\s*:\s*\[([\s\S]*?)\]/);
    let keywords = [];
    if (keywordsMatch) {
      const inner = keywordsMatch[1];
      const re = /"([^\"]+)"|'([^']+)'/g;
      let km;
      while (km = re.exec(inner)) keywords.push(km[1]||km[2]);
    }
    pairs.push({question, answer, paper, keywords});
  }
  return pairs;
}

function normalize(s){ return (s||'').toString().replace(/\r\n?/g,'\n').trim().toLowerCase(); }

function tokenRegexForTerm(term) {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b${escaped}\\b`, 'i');
}

function scoreMatch(term, unitDef, qObj) {
  // returns {matchType, confidence}
  const tRe = tokenRegexForTerm(term);
  const q = normalize(qObj.question);
  const a = normalize(qObj.answer);
  const d = normalize(unitDef);

  if (d && a.includes(d)) return {matchType: 'answer_contains_definition', confidence: 0.95};
  if (tRe.test(q) && q.startsWith('define')) return {matchType: 'define_question', confidence: 0.9};
  if (tRe.test(q)) return {matchType: 'term_in_question', confidence: 0.8};
  if (Array.isArray(qObj.keywords) && qObj.keywords.some(k => tRe.test(k))) return {matchType: 'term_in_keywords', confidence: 0.75};
  if (tRe.test(a)) return {matchType: 'term_in_answer', confidence: 0.65};
  // fuzzy: any token of term appears in question/answer
  const tokens = term.split(/\s+/).filter(x=>x.length>1);
  const tokenHit = tokens.some(tok => { const re = new RegExp(`\\b${tok.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\b`, 'i'); return re.test(q) || re.test(a);});
  if (tokenHit) return {matchType: 'token_fuzzy', confidence: 0.6};
  return null;
}

function main() {
  const units = parseUnits();
  const rawQa = fs.readFileSync(qaPath,'utf8');
  const proposals = [];
  for (const u of units) {
    const section = extractUnitSection(rawQa, u.id);
    if (!section) continue;
    const questions = findQuestionObjects(section);
    for (const t of u.terms) {
      const unitDef = t.definition || '';
      for (const qObj of questions) {
        const score = scoreMatch(t.term, unitDef, qObj);
        if (score && score.confidence >= 0.6) {
          // only suggest if the unitDef is non-empty and differs from QA answer
          const qAnsNorm = normalize(qObj.answer);
          const uDefNorm = normalize(unitDef);
          if (!uDefNorm) continue;
          // avoid duplicate proposals where answer already equals unit def
          if (qAnsNorm && qAnsNorm === uDefNorm) continue;
          proposals.push({unitId: u.id, term: t.term, question: qObj.question, paper: qObj.paper || '', oldAnswer: qObj.answer, suggestedAnswer: unitDef, matchType: score.matchType, confidence: score.confidence});
        }
      }
    }
  }
  // sort proposals by confidence desc
  proposals.sort((a,b)=> b.confidence - a.confidence);
  const outPath = path.join(path.dirname(qaPath),'qa_sync_proposals_relaxed.json');
  fs.writeFileSync(outPath, JSON.stringify(proposals,null,2),'utf8');
  console.log(`Found ${proposals.length} relaxed QA sync proposals. Written to ${outPath}`);
}

main();
