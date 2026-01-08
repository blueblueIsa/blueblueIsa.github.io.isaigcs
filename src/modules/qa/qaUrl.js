// JS helper for tests and runtime use in Jest (CommonJS)
function buildQAPath(params) {
  const parts = ['/qa'];
  if (params.unit) parts.push('unit', encodeURIComponent(params.unit));
  if (params.topic) parts.push('topic', encodeURIComponent(params.topic));
  let path = parts.join('/');
  const sp = new URLSearchParams();
  if (params.q) sp.set('q', params.q);
  if (params.kw) sp.set('kw', params.kw);
  const qs = sp.toString();
  if (qs) path += `?${qs}`;
  return path;
}

function parseQAUrl(pathname, search) {
  const out = {};
  const pathRegex = /^\/qa(?:\/v[^\/]+)?(?:\/unit\/([^\/]+))?(?:\/topic\/([^\/]+))?/i;
  const m = pathname.match(pathRegex);
  if (m) {
    if (m[1]) out.unit = decodeURIComponent(m[1]);
    if (m[2]) out.topic = decodeURIComponent(m[2]);
  }
  const sp = new URLSearchParams(search);
  const q = sp.get('q');
  const kw = sp.get('kw');
  const legacyUnit = sp.get('unit');
  if (q) out.q = q;
  if (kw) out.kw = kw;
  if (legacyUnit && !out.unit) out.unit = legacyUnit;
  return out;
}

module.exports = { buildQAPath, parseQAUrl };