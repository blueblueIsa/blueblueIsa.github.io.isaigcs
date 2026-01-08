export const LEVELS = { DEBUG: 0, INFO: 1, ERROR: 2 };
let currentLevel = LEVELS.INFO;

export function setLevel(level) {
  if (level in LEVELS) currentLevel = LEVELS[level];
}

export function log(level, msg, meta = {}) {
  if (LEVELS[level] >= currentLevel) {
    const time = new Date().toISOString();
    console.log(JSON.stringify({ time, level, msg, meta }));
  }
}
