export const scale = (
  w: number,
  h: number,
  max: number,
  scale: number
): {
  width: number;
  height: number;
} => {
  if (w > max) {
    scale = max / w;
  }

  if (h > max) {
    scale = Math.min(scale, max / h);
  }

  const width = w * scale;
  const height = h * scale;
  return {
    width,
    height,
  };
};
