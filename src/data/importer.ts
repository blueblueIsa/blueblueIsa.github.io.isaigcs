import type { QAData, Question } from '../types';

interface RawQuestion {
  question: string;
  answer: string;
  paper: string;
  topic: string;
  tags?: string[];
  marks?: number;
  keywords?: string[];
}

function assignUnitIdByTopic(topic: string, answer: string, keywords: string[] | undefined, paper: string, question: string): string {
  const raw = topic.trim();
  const m = /^(\d+)\s+/.exec(raw);
  const num = m ? parseInt(m[1], 10) : NaN;
  const t = raw.replace(/^\d+\s+/, '').toLowerCase();
  const a = answer.toLowerCase();
  const k = Array.isArray(keywords) ? keywords.join(' ').toLowerCase() : '';
  const text = `${a} ${k}`;
  const paperIsP1 = /P1[1-3]$/i.test(paper);
  const paperIsP2 = /P2[1-3]$/i.test(paper);

  const qLower = question.toLowerCase();
  const isPseudo = /\bwrite\s+(pseudocode|statement|program)\b/.test(qLower) ||
                   /\b(pseudocode|code|program)\b/.test(k);
  const testHit = /\b(parity|checksum|check digit|trace table|dry run|validation|testing)\b/i.test(text);
  const progHit = /\b(for|while|repeat|until|array|2d array|string|procedure|function|parameter|argument|return|scope)\b/i.test(text);
  const logicHit = t.includes('logic') || a.includes('truth table') || /\b(and gate|or gate|not gate|nand|nor|xor|truth table|boolean)\b/i.test(text);
  const sqlHit = t.includes('sql') || t.includes('database') || a.includes('select') || a.includes('join');

  // Forced mappings by keyword
  if (/\bvirtual memory\b/.test(text)) return 'cs-3';
  if (/\bram\b|\brandom access memory\b/.test(text)) return 'cs-3';

  // Paper 1 numeric mapping to cs-1..6
  if (!Number.isNaN(num) && paperIsP1) {
    if (num >= 1 && num <= 6) return `cs-${num}`;
  }

  // Paper 2 numeric mapping by syllabus section numbers
  if (!Number.isNaN(num) && paperIsP2) {
    if (num === 1) return 'apl-7';
    if (num >= 2 && num <= 6) return 'apl-8';
    if (num === 9) return 'apl-9';
    if (num === 10) return 'apl-10';
  }

  // Content-based mapping (cs-1..5)
  if (t.includes('numbers') || t.includes('text') || t.includes('images') || t.includes('sound') || t.includes('compression') || t.includes('encoding')) return 'cs-1';
  if (t.includes('modes') || t.includes('errors') || t.includes('packets') || t.includes('protocols') || t.includes('control') || t.includes('switching')) return 'cs-2';
  if (t.includes('architecture') || t.includes('memory') || t.includes('storage') || t.includes('i/o') || t.includes('systems') || t.includes('input') || t.includes('output')) return 'cs-3';
  if (t.includes('os') || t.includes('software') || t.includes('languages') || t.includes('libraries') || t.includes('tools') || t.includes('translator')) return 'cs-4';
  if (t.includes('web') || t.includes('security') || t.includes('cloud') || t.includes('communication') || t.includes('email') || t.includes('ftp') || t.includes('dns')) return 'cs-5';

  // APL heuristics (generic)
  if (t.includes('validation') || t.includes('testing') || t.includes('trace') || testHit) return 'apl-7';
  if (t.includes('procedure') || t.includes('function') || t.includes('data type') || t.includes('program') || isPseudo || progHit) return 'apl-8';
  if (sqlHit) return 'apl-9';
  if (logicHit) return 'apl-10';

  return 'apl-7';
}

function normalizeTopic(answer: string, topic: string): string {
  const t = topic.replace(/^\d+\s+/, '').trim();
  const a = answer.toUpperCase();
  if (a.includes('ROUND(') || /\bRANDOM\b/.test(a) || /\bDIV\b/.test(a) || /\bMOD\b/.test(a)) {
    return 'Lib routines';
  }
  return t;
}

function canonicalTopicForUnit(unitId: string, topic: string, answer: string): string {
  const t = topic.toLowerCase();
  const a = answer.toLowerCase();
  if (unitId === 'apl-7') {
    if (t.includes('validation') || t.includes('verification') || t.includes('testing') || t.includes('trace')) return 'Testing';
    if (t.includes('pseudocode') || t.includes('algorithm')) return 'Algorithms';
    if (t.includes('life cycle') || t.includes('development') || t.includes('design') || t.includes('flowchart')) return 'Design';
    return topic;
  }
  if (unitId === 'apl-8') {
    if (t.includes('programming concepts')) return 'Basics';
    if (t.includes('data type') || t.includes('integer') || t.includes('string') || t.includes('char') || t.includes('real')) return 'Types';
    if (t.includes('library routines') || /\bround\b|\brandom\b|\bdiv\b|\bmod\b/.test(a)) return 'Lib routines';
    if (t.includes('file handling') || /\bopenfile|readfile|writefile|closefile\b/.test(a)) return 'File handling';
    if (/\b(for|while|repeat|until|if|case)\b/.test(a)) return 'Control';
    if (t.includes('procedure') || t.includes('function') || t.includes('subroutine') || /\b(call|procedure|function)\b/.test(a)) return 'Subroutines';
    if (t.includes('array') || /\barray\b/.test(a)) return 'Arrays';
    if (t.includes('operator')) return 'Operators';
    return topic;
  }
  if (unitId === 'apl-9') {
    if (t.includes('database') || t.includes('sql')) return 'SQL';
    if (t.includes('primary') || t.includes('key')) return 'Keys';
    if (t.includes('concept')) return 'Concepts';
    return topic;
  }
  if (unitId === 'apl-10') {
    return 'Logic';
  }
  return topic;
}

function sanitizeSQL(answer: string): string {
  const A = answer.toUpperCase();
  const maybeSQL = /\b(SELECT|FROM|WHERE|ORDER BY)\b/.test(A);
  if (!maybeSQL) return answer;
  const unsupported = [
    'AVG','MIN','MAX','IN','INNER','LEFT','RIGHT','ON','HAVING','GROUP BY',
    'INSERT','UPDATE','DELETE','CREATE','DROP','ALTER','TRIGGER','PROCEDURE','VIEW',
    'GRANT','REVOKE','UNION','INTERSECT'
  ];
  const lines = String(answer).split('\n');
  const filtered = lines.filter(line => {
    const u = line.toUpperCase();
    return !unsupported.some(tok => u.includes(tok));
  });
  const out = filtered.join('\n').trim();
  return out.length > 0 ? out : answer;
}

function normalizePaperCode(paper: string): string {
  const p = paper.trim();
  if (/^[SWM]\d{2}P\d{2}$/i.test(p)) return p.toUpperCase();
  const m = /^(\d{4})\s+(May\/June|Oct\/Nov|Feb\/Mar)\s+Paper\s+(\d{2})$/i.exec(p);
  if (!m) return p;
  const year = m[1];
  const season = m[2].toLowerCase();
  const num = m[3];
  const yy = year.slice(2);
  const code = season === 'may/june' ? 'S' : season === 'oct/nov' ? 'W' : 'M';
  return `${code}${yy}P${num}`;
}
function shouldSkip(q: RawQuestion): boolean {
  const s = q.question.trim().toLowerCase();
  if (s.startsWith('identify four errors')) return true;
  if (s.startsWith('complete paragraph')) return true;
  if (s.startsWith('complete the paragraph')) return true;
  if (s.includes('interrupt process') && s.startsWith('complete')) return true;
  // New skip conditions
  if (/\bcircle\b/.test(s)) return true;
  if (/^identify.*\berrors?\b/.test(s)) return true;
  if (s.includes('trace table')) return true;
  if (s.includes('truth table')) return true;
  if (s.includes('logic circuit')) return true;
  const t = q.topic.trim().toLowerCase();
  if (t.includes('trace table')) return true;
  if (t.includes('truth table')) return true;
  if (t.includes('logic circuit')) return true;
  return false;
}

export function loadQAFromPapers(): QAData {
  const modules = {
    ...import.meta.glob('./papers/*.json', { eager: true }),
    ...import.meta.glob('./24paper1.json', { eager: true }),
    ...import.meta.glob('./25paper2.json', { eager: true })
  };
  const out: QAData = {};
  for (const k in modules) {
    const mod = modules[k] as unknown;
    const data = (mod as { default?: unknown })?.default ?? mod;
    const arr: RawQuestion[] = Array.isArray(data) ? data as RawQuestion[] : extractQuestions(data);
    for (const rq of arr) {
      if (shouldSkip(rq)) continue;
      let ans = sanitizeSQL(rq.answer);
      const isMC = Array.isArray(rq.tags) && rq.tags.some(t => t.toLowerCase() === 'multiple choice');
      if (isMC) {
        const firstLine = String(ans).split('\n')[0].trim();
        const mOpt = /^([A-Z])\s+(.+)$/.exec(firstLine);
        if (mOpt) {
          ans = mOpt[2];
        }
      }
      const skipAdvancedDB = /\b(relational database|foreign key|candidate key|erd|entity relationship|integrity)\b/i.test(rq.question) || /\b(relational database|foreign key|candidate key|erd|entity relationship|integrity)\b/i.test(ans);
      if (skipAdvancedDB) continue;
      const paperCode = normalizePaperCode(rq.paper);
      const is25 = /^[SMW]25P\d{2}$/i.test(paperCode) || /^\s*2025\b/.test(String(rq.paper));
      const is25examples = /25paper2\.json$/.test(k);
      if (is25 && !is25examples) {
        continue;
      }
      const unitId = assignUnitIdByTopic(rq.topic, ans, rq.keywords, paperCode, rq.question);
      const topicNameRaw = normalizeTopic(ans, rq.topic);
      const topicName = canonicalTopicForUnit(unitId, topicNameRaw, ans);
      const tags = Array.isArray(rq.tags) ? [...rq.tags] : [];
      if (/^write\s+pseudocode\b/i.test(rq.question) && !tags.map(t => t.toLowerCase()).includes('pseudocode')) {
        tags.push('pseudocode');
      }
      const q: Question = {
        question: rq.question,
        answer: ans,
        paper: paperCode,
        topic: topicName,
        tags,
        marks: rq.marks,
        keywords: rq.keywords,
      };
      out[unitId] = out[unitId] || {};
      out[unitId][topicName] = out[unitId][topicName] || [];
      const bucket = out[unitId][topicName];
      const key = `${q.paper}::${q.question.trim()}`;
      const exists = bucket.some(x => `${x.paper}::${x.question.trim()}` === key);
      if (!exists) bucket.push(q);
    }
  }
  return out;
}

function extractQuestions(input: unknown): RawQuestion[] {
  const out: RawQuestion[] = [];
  const visit = (node: unknown) => {
    if (!node) return;
    if (Array.isArray(node)) {
      for (const item of node) visit(item);
      return;
    }
    if (typeof node === 'object') {
      const obj = node as Record<string, unknown>;
      if ('question' in obj && 'answer' in obj && 'paper' in obj && 'topic' in obj) {
        out.push(obj as unknown as RawQuestion);
      }
      for (const key of Object.keys(obj)) {
        visit(obj[key]);
      }
    }
  };
  visit(input);
  return out;
}
