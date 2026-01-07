import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

function normalizePaperCode(seasonCode, paperNum) {
  const code = String(seasonCode || '').trim().toUpperCase();
  const yy = code.replace(/^[SWM]/, '');
  const prefix = code[0];
  const num = String(paperNum).padStart(2, '0');
  return `${prefix}${yy}P${num}`;
}

function parseLines(raw) {
  const text = raw.replace(/\r\n/g, '\n');
  const lines = text.split('\n').map(l => l.trim());
  const byCode = new Map();
  let currentPaper = null;
  let currentYear = null;
  let currentSeason = null;
  let current = null;
  let inAnswer = false;

  const paperRegex = /^(?:Paper\s*:?\s*|P\s*:?)(1[123])\b/i;
  const paperInlineRegex = /\bPaper\s*(1[123])\b/i;
  const seasonLineRegex = /(\d{4}).*(May\/June|Oct\/Nov|Feb\/Mar)/i;

  function normalizeSeason(season) {
    const s = String(season || '').toLowerCase();
    return s === 'may/june' ? 'S' : s === 'oct/nov' ? 'W' : s === 'feb/mar' ? 'M' : null;
  }

  function computeCode() {
    const prefix = normalizeSeason(currentSeason);
    if (prefix && currentYear && currentPaper) {
      const yy = String(currentYear).slice(2);
      const num = String(currentPaper).padStart(2, '0');
      return `${prefix}${yy}P${num}`;
    }
    return null;
  }

  function ensureBucket(code) {
    if (!byCode.has(code)) byCode.set(code, []);
    return byCode.get(code);
  }

  function pushCurrent() {
    if (!current || !currentPaper) return;
    const code = computeCode();
    const item = {
      question: (current.question || '').trim(),
      answer: (current.answer || '').trim(),
      paper: code || String(currentPaper),
      topic: (current.topic || 'Uncategorised').trim(),
      tags: current.tags && current.tags.length ? current.tags : undefined,
      marks: typeof current.marks === 'number' ? current.marks : undefined,
      keywords: current.keywords && current.keywords.length ? current.keywords : undefined
    };
    if (!item.question || !item.answer) return;
    if (code) {
      ensureBucket(code).push(item);
    } else {
      const fallback = `U00P${String(currentPaper).padStart(2, '0')}`;
      ensureBucket(fallback).push(item);
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) {
      if (current) {
        pushCurrent();
        current = null;
        inAnswer = false;
      }
      continue;
    }

    const sm = seasonLineRegex.exec(line);
    if (sm) {
      currentYear = parseInt(sm[1], 10);
      currentSeason = sm[2];
    }

    let m = paperRegex.exec(line);
    if (m) {
      const num = parseInt(m[1], 10);
      currentPaper = num;
      continue;
    }
    if (!m && paperInlineRegex.test(line)) {
      const m2 = paperInlineRegex.exec(line);
      if (m2) currentPaper = parseInt(m2[1], 10);
    }

    if (/^Q(uestion)?\s*:/.test(line) || /^Question\b/i.test(line)) {
      if (current) pushCurrent();
      current = { question: line.replace(/^Q(uestion)?\s*:\s*/i, '').replace(/^Question\s*/i, '').trim(), answer: '' };
      inAnswer = false;
      continue;
    }
    if (/^A(ns(wer)?)?\s*:/.test(line) || /^Answer\b/i.test(line)) {
      if (!current) current = { question: '', answer: '' };
      const start = line.replace(/^A(ns(wer)?)?\s*:\s*/i, '').replace(/^Answer\s*/i, '');
      current.answer = start ? start : '';
      inAnswer = true;
      continue;
    }
    if (/^T(opic)?\s*:/.test(line)) {
      if (!current) current = { question: '', answer: '' };
      current.topic = line.replace(/^T(opic)?\s*:\s*/i, '').trim();
      continue;
    }
    if (/^Marks?\s*:/.test(line)) {
      if (!current) current = { question: '', answer: '' };
      const mv = line.replace(/^Marks?\s*:\s*/i, '').trim();
      const val = parseInt(mv, 10);
      if (!Number.isNaN(val)) current.marks = val;
      continue;
    }
    if (/^Tags?\s*:/.test(line)) {
      if (!current) current = { question: '', answer: '' };
      const t = line.replace(/^Tags?\s*:\s*/i, '');
      current.tags = t.split(',').map(s => s.trim()).filter(Boolean);
      continue;
    }
    if (/^Keywords?\s*:/.test(line)) {
      if (!current) current = { question: '', answer: '' };
      const k = line.replace(/^Keywords?\s*:\s*/i, '');
      current.keywords = k.split(',').map(s => s.trim()).filter(Boolean);
      continue;
    }
    if (!current) {
      // If no explicit "Question:" label, start a question on first non-empty line
      current = { question: line, answer: '' };
      inAnswer = false;
      continue;
    }
    if (inAnswer) {
      current.answer = (current.answer ? current.answer + '\n' : '') + line;
    } else {
      current.question = (current.question ? current.question + '\n' : '') + line;
    }
  }

  if (current) pushCurrent();
  return byCode;
}

function writeOutputs(map) {
  const outDir = join(process.cwd(), 'src', 'data', 'papers');
  for (const [code, arr] of map.entries()) {
    const file = join(outDir, `${code.toLowerCase()}.json`);
    writeFileSync(file, JSON.stringify(arr, null, 2) + '\n', 'utf8');
  }
}

function main() {
  const [inputPath, seasonOverride] = process.argv.slice(2);
  if (!inputPath) {
    console.error('Usage: node scripts/convertPaper1.mjs <input.txt> [S24|W24|M24]');
    process.exit(1);
  }
  const raw = readFileSync(inputPath, 'utf8');
  let map = parseLines(raw);
  if (seasonOverride) {
    const m = String(seasonOverride).trim().toUpperCase();
    const entries = Array.from(map.entries());
    map = new Map(entries.map(([code, arr]) => {
      const num = /P(\d{2})$/i.exec(code)?.[1] || '11';
      const fileCode = normalizePaperCode(m, num);
      return [fileCode, arr.map(it => ({ ...it, paper: fileCode }))];
    }));
  }
  writeOutputs(map);
  console.log('Converted codes: ', Array.from(map.keys()).join(', '));
}

main();
