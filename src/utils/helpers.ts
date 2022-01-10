export const scaleTo = (
  w: number,
  h: number,
  max: number
): {
  width: number;
  height: number;
} => {
  let scale = 1;
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
