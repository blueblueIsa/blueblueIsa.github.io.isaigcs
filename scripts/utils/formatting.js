export function normalizeUnicode(str) {
  return String(str).normalize('NFC');
}

export function encodeEntities(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function toMarkedText(str) {
  return String(str)
    .replace(/\n/g, '\\n')
    .replace(/\t/g, '\\t');
}

export function applyMarkdownMarks(textRuns) {
  return textRuns.map(run => {
    let t = encodeEntities(normalizeUnicode(run.text));
    if (run.bold) t = `**${t}**`;
    if (run.italic) t = `*${t}*`;
    return t;
  }).join('');
}
