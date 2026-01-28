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
      const defMatch = objText.match(/definition\s*:\s*(?:(?:"([\s\S]*?)")|(?:'([\s\S]*?)'))/);
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
  // find opening brace
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

function findQuestionsInSection(sectionText) {
  // crude extraction: find all question/answer pairs within the section text
  const qRegex = /question\s*:\s*"([\s\S]*?)"[\s\S]*?answer\s*:\s*"([\s\S]*?)"/g;
  const pairs = [];
  let m;
  while (m = qRegex.exec(sectionText)) {
    pairs.push({question: m[1].trim(), answer: m[2].trim()});
  }
  return pairs;
}

function normalize(s) { return (s||'').toString().replace(/\r\n?/g,'\n').trim().toLowerCase(); }

function tokenRegexForTerm(term) {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b${escaped}\\b`, 'i');
}

function report() {
  const units = parseUnits();
  const rawQa = fs.readFileSync(qaPath, 'utf8');
  const results = [];
  for (const u of units) {
    const section = extractUnitSection(rawQa, u.id);
    const questions = findQuestionsInSection(section);
    for (const t of u.terms) {
      const reo = tokenRegexForTerm(t.term);
      const matches = [];
      const answerMatches = [];
      const keywordMatches = [];
      for (const q of questions) {
        if (reo.test(q.question)) matches.push(q.question);
        if (reo.test(q.answer)) answerMatches.push(q.answer);
      }
      // also attempt to find keywords arrays containing the term.
      const kwRe = new RegExp(`keywords\s*:\s*\[[^\]]*\b${t.term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\b[^\]]*\]`, 'i');
      if (kwRe.test(section)) keywordMatches.push('keyword-array-matches');

      results.push({unitId: u.id, term: t.term, definition: t.definition || '', hasRelatedQA: matches.length > 0, matchingQuestions: matches, answersContainingDefinition: answerMatches, keywordMatches: keywordMatches});
    }
  }
  const outJson = path.join(path.dirname(qaPath), 'unit_qa_report.json');
  const outCsv = path.join(path.dirname(qaPath), 'unit_qa_report.csv');
  fs.writeFileSync(outJson, JSON.stringify(results, null, 2), 'utf8');
  const csvLines = ['unitId,term,hasRelatedQA,numMatches,numAnswerMatches,keywordMatches,definitionSnippet'];
  for (const r of results) {
    csvLines.push(`"${r.unitId}","${r.term}",${r.hasRelatedQA},${r.matchingQuestions.length},${r.answersContainingDefinition.length},"${r.keywordMatches.join(';')}","${(r.definition||'').replace(/\n/g,'\\n').replace(/"/g,'\"').slice(0,120)}"`);
  }
  fs.writeFileSync(outCsv, csvLines.join('\n'), 'utf8');
  console.log(`Wrote ${outJson} (${results.length} rows) and ${outCsv}`);
}

report();
