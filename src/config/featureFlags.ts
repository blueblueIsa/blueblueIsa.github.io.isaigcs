export const VISITS_ENABLED = (
  typeof import.meta !== 'undefined' && typeof (import.meta as any).env !== 'undefined' && ((import.meta as any).env.VITE_SHOW_VISITS === 'true')
) || (
  typeof (globalThis as any).process !== 'undefined' && (globalThis as any).process.env && (globalThis as any).process.env.VITE_SHOW_VISITS === 'true'
);

export const RELATED_QA_FUZZY = (
  typeof import.meta !== 'undefined' && typeof (import.meta as any).env !== 'undefined' && ((import.meta as any).env.VITE_RELATED_QA_FUZZY === 'true')
) || (
  typeof (globalThis as any).process !== 'undefined' && (globalThis as any).process.env && (globalThis as any).process.env.VITE_RELATED_QA_FUZZY === 'true'
) || (
  // Allow runtime override for tests/dev: set globalThis.__RELATED_QA_FUZZY = true
  typeof (globalThis as any).__RELATED_QA_FUZZY !== 'undefined' && (globalThis as any).__RELATED_QA_FUZZY === true
);
