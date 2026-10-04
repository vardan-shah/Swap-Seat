let offsetMs = 0;
let hasInitialized = false;

function initDemoTime() {
  if (hasInitialized) return;
  hasInitialized = true;
  const demoStr = process.env.EXPO_PUBLIC_DEMO_TIME;
  if (demoStr) {
    const d = new Date(demoStr);
    if (!isNaN(d.getTime())) {
      offsetMs = d.getTime() - Date.now();
    }
  }
}

export function now(): number {
  if (process.env.NODE_ENV !== 'test') {
    initDemoTime();
  }
  return Date.now() + offsetMs;
}
