export const VISITS_ENABLED = (
  typeof import.meta !== 'undefined' && typeof (import.meta as any).env !== 'undefined' && ((import.meta as any).env.VITE_SHOW_VISITS === 'true')
) || (
  typeof (globalThis as any).process !== 'undefined' && (globalThis as any).process.env && (globalThis as any).process.env.VITE_SHOW_VISITS === 'true'
);
