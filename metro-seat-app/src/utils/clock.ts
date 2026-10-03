let demoOffset = 0;

export const setDemoTime = (timeMs: number) => {
  demoOffset = timeMs - Date.now();
};

export const resetDemoTime = () => {
  demoOffset = 0;
};

export const now = () => {
  if (process.env.EXPO_PUBLIC_DEMO_TIME) {
    return parseInt(process.env.EXPO_PUBLIC_DEMO_TIME, 10);
  }
  return Date.now() + demoOffset;
};
