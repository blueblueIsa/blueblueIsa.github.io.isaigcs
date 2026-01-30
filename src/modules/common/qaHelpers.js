// Utility used by GenericUnitView to determine if a term has related QA

function escapeForWordBoundary(s) {
  return s.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
}

export function hasRelatedQAForTerm(termName, assignedMap, unitId, qaData, RELATED_QA_FUZZY) {
  const set = assignedMap && assignedMap[termName];
  const hasAssigned = !!(set && set.size > 0);
  if (hasAssigned) return true;

  // Support an override for QA data during tests/dev (window.__QA_DATA_OVERRIDE)
  const effectiveQaData = (typeof globalThis.__QA_DATA_OVERRIDE !== 'undefined') ? globalThis.__QA_DATA_OVERRIDE : qaData;

  if (RELATED_QA_FUZZY) {
    const unitQA = (effectiveQaData && effectiveQaData[unitId]) || {};
    const allQs = Object.values(unitQA).flat();
    const re = new RegExp(`\\b${escapeForWordBoundary(termName)}\\b`, 'i');
    const skipAssignRe = /identify.*error|identify.*incorrect|identify.*incorrect statement/i;
    const matches = allQs.filter(q => {
      if (skipAssignRe.test(q.question)) return false;
      return re.test(q.question) || (Array.isArray(q.keywords) && q.keywords.some(w => re.test(w)));
    });
    return matches.length > 0;
  }

  return false;
}

// Support CommonJS require() for tests (guarded to avoid ReferenceError in browser)
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = { hasRelatedQAForTerm };
}
