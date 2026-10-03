let demoOffset = 0;

export const setDemoTime = (timeMs: number) => {
  demoOffset = timeMs - Date.now();
};

export const resetDemoTime = () => {
  demoOffset = 0;
};

export const now = () => Date.now() + demoOffset;
