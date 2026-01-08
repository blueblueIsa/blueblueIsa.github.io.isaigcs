#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const pathsArg = args.find(a => a.startsWith('--paths=')) || '--paths=src';
const pathsList = pathsArg.replace('--paths=', '').split(',').map(p => p.trim()).filter(Boolean);

const exts = new Set(['.ts', '.tsx', '.js', '.json', '.scss', '.md']);
const hanRegex = /[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]/u; // CJK Unified + Extensions + Compatibility
const results = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // skip node_modules and dist
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') continue;
      walk(full);
    } else {
      const ext = path.extname(entry.name);
      if (!exts.has(ext)) continue;
      const content = fs.readFileSync(full, 'utf8');
      if (hanRegex.test(content)) {
        const lines = content.split(/\r?\n/);
        lines.forEach((line, i) => {
          if (hanRegex.test(line)) {
            results.push({ file: full, line: i + 1, text: line.trim().slice(0, 200) });
          }
        });
      }
    }
  }
}

pathsList.forEach(p => {
  const full = path.resolve(process.cwd(), p);
  if (fs.existsSync(full)) {
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full);
    else {
      const content = fs.readFileSync(full, 'utf8');
      if (hanRegex.test(content)) results.push({ file: full, line: 1, text: content.trim().slice(0, 200) });
    }
  }
});

if (results.length > 0) {
  console.error('Non-English text detected (CJK characters):');
  for (const r of results) {
    console.error(`- ${r.file}:${r.line} :: ${r.text}`);
  }
  process.exit(1);
} else {
  console.log('Language check passed: English-only policy satisfied.');
}

