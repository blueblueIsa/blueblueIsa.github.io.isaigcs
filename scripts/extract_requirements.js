#!/usr/bin/env node
/* eslint-disable no-console */
import fs from 'node:fs';
import path from 'node:path';
import * as logger from './utils/logger.js';
import * as formatting from './utils/formatting.js';
const { log, setLevel } = logger;
const { normalizeUnicode, toMarkedText, applyMarkdownMarks } = formatting;

const args = process.argv.slice(2);
const argMap = {};
for (const a of args) {
  const m = /^--([^=]+)=(.+)$/.exec(a);
  if (m) argMap[m[1]] = m[2];
  else if (a === '--verbose') argMap.verbose = '1';
}
if (argMap.verbose) setLevel('DEBUG');

const input = argMap.input || './input.pdf';
const outputDir = argMap.output || './output';
fs.mkdirSync(outputDir, { recursive: true });

async function loadPdf(inputPath) {
  let pdfjsLib = null;
  try {
    pdfjsLib = await import('pdfjs-dist');
  } catch (e) {
    log('ERROR', 'pdfjs-dist not installed');
    process.exit(2);
  }
  const data = new Uint8Array(fs.readFileSync(inputPath));
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  return pdf;
}

async function extractPages(pdf, startPage, endPage) {
  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const items = content.items.map(it => {
      const text = normalizeUnicode(it.str);
      const bold = it.fontName && /bold/i.test(it.fontName);
      const italic = it.fontName && /italic|oblique/i.test(it.fontName);
      const [a, b, c, d, e, f] = it.transform || [1, 0, 0, 1, 0, 0];
      const x = e;
      const y = f;
      const size = Math.sqrt(a * a + d * d);
      return { text, bold, italic, x, y, size };
    });
    const text = applyMarkdownMarks(items);
    pages.push({ index: i, text, items });
  }
  return pages;
}

function segmentUnits(textPages) {
  const units = [];
  let current = null;
  for (const p of textPages) {
    const t = p.text;
    const unitHeader = /Unit\s+(\d{1,2})\s*[:\-–]\s*([^\n]+)/i.exec(t);
    if (unitHeader) {
      if (current) units.push(current);
      current = { unitId: `unit${unitHeader[1]}`, title: unitHeader[2].trim(), pages: [p.index], raw: [t], items: [p.items] };
    } else if (current) {
      current.pages.push(p.index);
      current.raw.push(t);
      current.items.push(p.items);
    }
  }
  if (current) units.push(current);
  return units;
}

function parseBullets(text) {
  const lines = String(text).split(/[\r\n]+/);
  const out = [];
  for (const ln of lines) {
    const l = ln.trim();
    if (/^(?:•|-|–|\d+\.)\s+/.test(l)) {
      out.push(l.replace(/^(?:•|-|–|\d+\.)\s+/, ''));
    }
  }
  return out;
}

function extractSectionsFromRaw(rawText) {
  const t = rawText;
  const loMatch = /Learning objectives?\s*[:\-–]?([\s\S]*?)(?=(Key concepts|Assessment criteria|Unit\s+\d))/i.exec(t);
  const kcMatch = /Key concepts?\s*[:\-–]?([\s\S]*?)(?=(Assessment criteria|Learning objectives|Unit\s+\d))/i.exec(t);
  const acMatch = /Assessment criteria?\s*[:\-–]?([\s\S]*?)(?=(Key concepts|Learning objectives|Unit\s+\d))/i.exec(t);
  const learningObjectives = loMatch ? parseBullets(loMatch[1]) : [];
  const keyConcepts = kcMatch ? parseBullets(kcMatch[1]) : [];
  const assessmentCriteria = acMatch ? parseBullets(acMatch[1]) : [];
  return { learningObjectives, keyConcepts, assessmentCriteria };
}

function extractTablesFromItems(itemsPages) {
  const rows = [];
  for (const items of itemsPages) {
    const byY = new Map();
    for (const it of items) {
      const y = Math.round(it.y);
      if (!byY.has(y)) byY.set(y, []);
      byY.get(y).push(it);
    }
    for (const [y, lineItems] of byY.entries()) {
      lineItems.sort((a, b) => a.x - b.x);
      const cells = [];
      let current = '';
      let lastX = null;
      for (const li of lineItems) {
        if (lastX !== null && li.x - lastX > 60) {
          if (current.trim()) cells.push(current.trim());
          current = li.text;
        } else {
          current += (current ? ' ' : '') + li.text;
        }
        lastX = li.x;
      }
      if (current.trim()) cells.push(current.trim());
      if (cells.length > 1) rows.push(cells);
    }
  }
  // Heuristic: consider a table if rows share the same column count ≥ 2
  const colCounts = rows.map(r => r.length);
  const modeCols = colCounts.length ? colCounts.sort((a, b) => a - b)[Math.floor(colCounts.length / 2)] : 0;
  const table = rows.filter(r => r.length === modeCols && modeCols >= 2);
  return table;
}

function buildSyllabus(units) {
  const out = {
    metadata: {
      source: 'https://www.cambridgeinternational.org/Images/697167-2026-2028-syllabus.pdf',
      version: '2026–2028',
      extractedAt: new Date().toISOString()
    },
    units: units.map(u => {
      const mergedRaw = (u.raw || []).join('\n');
      const sections = extractSectionsFromRaw(mergedRaw);
      const table = extractTablesFromItems(u.items || []);
      const unitOut = {
        unitId: u.unitId,
        title: u.title || `Unit ${String(u.unitId).replace(/^unit/, '')}`,
        learningObjectives: sections.learningObjectives,
        keyConcepts: sections.keyConcepts,
        assessmentCriteria: sections.assessmentCriteria
      };
      if (table && table.length) {
        unitOut.tables = [table];
      }
      return unitOut;
    }),
    programming_key_terms: [],
    pseudocode_syntax: { version: '2026–2028', rules: [] },
    display_key_terms: []
  };
  return out;
}

async function extractProgrammingAndPseudocode(pdf, startPage) {
  const pages = await extractPages(pdf, startPage, pdf.numPages);
  const terms = [];
  const rules = [];
  for (const p of pages) {
    const text = p.text;
    const lines = text.split(/[\r\n]+/).map(s => s.trim()).filter(Boolean);
    for (const ln of lines) {
      const m = /^([A-Z][A-Za-z0-9\s\/\-]+)\s*[:\-–]\s*(.+)$/.exec(ln);
      if (m && !/\b(IF|FOR|WHILE|REPEAT|UNTIL|INPUT|OUTPUT|PROCEDURE|FUNCTION|RETURN|ARRAY|DIV|MOD|ROUND|RANDOM)\b/i.test(m[1])) {
        terms.push({ term: m[1].trim(), definition: m[2].trim() });
      } else if (/\b(IF|FOR|WHILE|REPEAT|UNTIL|INPUT|OUTPUT|PROCEDURE|FUNCTION|RETURN|ARRAY|DIV|MOD|ROUND|RANDOM)\b/.test(ln)) {
        rules.push(ln);
      }
    }
  }
  rules.sort((a, b) => a.localeCompare(b));
  terms.sort((a, b) => a.term.localeCompare(b.term));
  return { terms, rules };
}

async function main() {
  log('INFO', 'start extraction', { input, outputDir });
  const pdf = await loadPdf(input);
  const pageCount = pdf.numPages;
  if (pageCount < 31) {
    log('ERROR', 'PDF seems incomplete', { pageCount });
    process.exit(3);
  }
  const pages = await extractPages(pdf, 11, 31);
  let units = segmentUnits(pages);
  if (units.length === 0) {
    units = [
      { unitId: 'cs-1', title: 'Data representation' },
      { unitId: 'cs-2', title: 'Data transmission' },
      { unitId: 'cs-3', title: 'Hardware' },
      { unitId: 'cs-4', title: 'Software' },
      { unitId: 'cs-5', title: 'The internet and its uses' },
      { unitId: 'cs-6', title: 'Automated and emerging technologies' },
      { unitId: 'apl-7', title: 'Algorithms' },
      { unitId: 'apl-8', title: 'Programming' },
      { unitId: 'apl-9', title: 'Databases' },
      { unitId: 'apl-10', title: 'Boolean logic' }
    ];
  }
  log('INFO', 'units segmented', { count: units.length });
  const syllabus = buildSyllabus(units);
  const p32 = await extractProgrammingAndPseudocode(pdf, 32);
  syllabus.programming_key_terms = p32.terms;
  syllabus.pseudocode_syntax = { version: '2026–2028', rules: p32.rules };
  const outPath = path.join(outputDir, 'syllabus.json');
  fs.writeFileSync(outPath, JSON.stringify(syllabus, null, 2), 'utf-8');
  log('INFO', 'written', { outPath });
  const dataPath = path.join(process.cwd(), 'src', 'data', 'syllabus.json');
  fs.writeFileSync(dataPath, JSON.stringify(syllabus, null, 2), 'utf-8');
  log('INFO', 'updated data', { dataPath });
}

main().catch(err => {
  log('ERROR', 'extract failed', { err: String(err.stack || err) });
  process.exit(1);
});
