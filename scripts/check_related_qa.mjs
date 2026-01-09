import fs from 'fs';
import path from 'path';
import vm from 'vm';

const QA_SRC = path.join(process.cwd(), 'src', 'data', 'qa.ts');
const txt = fs.readFileSync(QA_SRC, 'utf8');
function findBaseObject(text) {
  const needle = 'const baseQaData';
  const i = text.indexOf(needle);
  const startBrace = text.indexOf('{', i);
  let idx = startBrace; let depth = 0; let inStr=false; let strChar=''; let escaped=false;
  while (idx < text.length) {
    const ch = text[idx];
    if (!inStr) {
      if (ch === '"' || ch === "'" || ch === '`') { inStr = true; strChar = ch; }
      else if (ch === '{') depth++;
      else if (ch === '}') { depth--; if (depth === 0) return text.slice(startBrace, idx+1); }
    } else {
      if (escaped) escaped=false; else if (ch === '\\') escaped=true; else if (ch===strChar) inStr=false;
    }
    idx++;
  }
  throw new Error('not found');
}
const objText = findBaseObject(txt);
const context = vm.createContext({});
vm.runInContext(`const x = ${objText}; globalThis.__QA__ = x;`, context);
const baseQaData = context.__QA__;

const unitId = 'cs-1';
const unitQA = baseQaData[unitId] || {};
const topics = Object.keys(unitQA);
console.log('Topics for', unitId, topics);

const skipAssignRe = /identify.*error|identify.*incorrect|identify.*incorrect statement/i;

// fallback: just print assigned by scanning
const assigned = {};
for (const t of Object.keys(unitQA)) {
  const questions = unitQA[t];
  for (const q of questions) {
    if (skipAssignRe.test(q.question)) continue;
    for (const termName of ['Overflow','Binary','Hexadecimal','ASCII']) {
      const escaped = termName.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
      const re = new RegExp(`\\b${escaped}\\b`, 'i');
      if (re.test(q.question) || (Array.isArray(q.keywords) && q.keywords.some(w => re.test(w)))) {
        assigned[termName] = assigned[termName] || [];
        assigned[termName].push(q.question);
      }
    }
  }
}
console.log('Assigned mapping (sample):', assigned);
