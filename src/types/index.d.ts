interface W3Color {
  toRgb: () => { r: number; b: number; g: number; a: number };
}

declare interface Window {
  w3color: (
    color: Record<string, unknown> | string,
    element?: HTMLElement
  ) => W3Color;
}

declare module 'react-input-position';

type AttachmentType = 'image' | 'text';

interface AttachmentBase {
  id: string;
  width: number;
  height: number;
  x: number;
  y: number;
  type: AttachmentType;
  column_id?: string;
}
interface ImageAttachment extends AttachmentBase {
  file: File;
  img: HTMLImageElement;
}

interface DrawingAttachment extends AttachmentBase {
  path?: string;
  scale?: number;
  stroke?: string;
  strokeWidth?: number;
}

interface TextAttachment extends AttachmentBase {
  text?: string;
  fontFamily?: string;
  size?: number;
  lineHeight?: number;
  lines?: string[];
}

interface Dimensions {
  x: number;
  y: number;
  width: number;
  height: number;
}

type Attachment = ImageAttachment | DrawingAttachment | TextAttachment;

type Attachments = Attachment[];

interface Placement {
  id: string;
  width: number;
  height: number;
  x: number;
  y: number;
  children?: string[];
}

type Placements = Placement[];

type DragEventListener<T> = (e: React.MouseEvent<T>) => void;
