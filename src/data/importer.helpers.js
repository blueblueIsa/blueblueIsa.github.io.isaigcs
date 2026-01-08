function normalizePaperCodeStrict(paper) {
  const p = String(paper).trim();
  const re = /^[SWM]\d{2}P(1[123]|2[123])$/i;
  const verbose = /^(\d{4})\s+(May\/June|Oct\/Nov|Feb\/Mar)\s+Paper\s+(1[123]|2[123])$/i.exec(p);
  if (re.test(p)) return p.toUpperCase();
  if (verbose) {
    const year = verbose[1];
    const season = verbose[2].toLowerCase();
    const num = verbose[3];
    const yy = year.slice(2);
    const code = season === 'may/june' ? 'S' : season === 'oct/nov' ? 'W' : 'M';
    return `${code}${yy}P${num}`;
  }
  throw new Error(`Invalid paper code: ${paper}`);
}

const paperMapping = {
  describe(code) {
    const m = /^([SWM])(\d{2})P(1[123]|2[123])$/.exec(String(code).toUpperCase());
    if (!m) return 'Unknown paper';
    const season = m[1] === 'S' ? 'May/June' : m[1] === 'W' ? 'Oct/Nov' : 'Feb/Mar';
    const year = `20${m[2]}`;
    const paper = m[3];
    return `${season} ${year} Paper ${paper}`;
  }
};

module.exports = { normalizePaperCodeStrict, paperMapping };
