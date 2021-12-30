export const mockPlacements = (): Placement[] => {
  const arr: Placement[] = [];

  const width = 91;
  const height = 50;
  const offsetX = 103;
  const offsetY = 470;

  for (let x = 0; x < 5; x++) {
    for (let y = 0; y < 4; y++) {
      arr.push({
        height,
        width,
        x: offsetX + width * x,
        y: offsetY + height * y,
        id: `${x}-${y}`,
      });
    }
  }
  console.log(arr);
  return arr;
};
