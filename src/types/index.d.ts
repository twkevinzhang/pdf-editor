type ObjectType = 'image' | 'text';

interface ImageObject {
  id: () => number;
  type: ObjectType;
  width: number;
  height: number;
  file: File;
  x: number;
  y: number;
  payload: HTMLImageElement;
}

interface Dimensions {
  width: number;
  height: number;
}

type AllObjects = (ImageObject)[]