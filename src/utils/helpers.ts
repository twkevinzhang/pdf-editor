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

export function whichPlacement(
  x: number,
  y: number,
  placements: Placement[]
): Placement | null {
  const lasted = placements[placements.length - 1];
  const arr = placements
    .filter(
      (p) =>
        p.x < x &&
        x < lasted.x + lasted.width &&
        p.y < y &&
        y < lasted.y + lasted.height
    )
    .sort((p1) => p1.x - x + (p1.y - y));
  if (arr && arr.length) return arr[0];
  return null;
}
