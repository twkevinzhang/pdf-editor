export const scaleTo = (
  w: number,
  h: number,
  wMax: number,
  hMax: number = wMax
): {
  width: number;
  height: number;
} => {
  let scale = 1;
  if (w > wMax) {
    scale = wMax / w;
  }

  if (h > hMax) {
    scale = Math.min(scale, hMax / h);
  }

  const width = w * scale;
  const height = h * scale;
  return {
    width,
    height,
  };
};
