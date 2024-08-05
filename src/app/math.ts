export const remap = (x: number, inMin: number, inMax: number, outMin: number, outMax: number, clamp?: boolean) => {
  const value = ((x - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  return clamp ? Math.max(Math.min(value, outMax), outMin) : value;
};

export const lerp = (a: number, b: number, t: number, clamp?: boolean) => {
  const min = Math.min(a, b);
  const max = Math.max(a, b);
  const value = a + (b - a) * t;
  return clamp ? Math.max(min, Math.min(max, value)) : value;
};
