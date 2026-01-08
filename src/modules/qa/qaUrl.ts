export interface QAParams {
  unit?: string;
  topic?: string;
  q?: string;
  kw?: string;
}

// Build a path-based QA URL: /qa/unit/:unit[/topic/:topic][?q=...&kw=...]
export function buildQAPath(params: QAParams): string {
  const parts: string[] = ['/qa'];
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

// Parse both path-based and legacy query-based QA URLs.
export function parseQAUrl(pathname: string, search: string): QAParams {
  const out: QAParams = {};

  // Try path-based: /qa(/v...)?/unit/:unit(/topic/:topic)?
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
