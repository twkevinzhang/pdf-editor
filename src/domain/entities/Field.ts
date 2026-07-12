import { v4 as uuidv4 } from 'uuid';
import { FieldNameCodec } from '../services/FieldNameCodec';

export type FieldType =
  | 'text'
  | 'date'
  | 'handwrittenSignature'
  | 'certificateSignature';

export type FieldSource = 'project' | 'external';

/**
 * Canvas coordinates are normalized against the rendered (rotated) page and
 * use a top-left origin. `page` is one-based to match the rest of the UI.
 */
export interface Field {
  id: string;
  acroName: string;
  label: string;
  type: FieldType;
  source: FieldSource;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  value?: string;
  defaultValue?: string;
  required: boolean;
  readOnly: boolean;
  maxLength?: number;
  multiline?: boolean;
  dateFormat?: string;
}

const DEFAULT_LABELS: Record<FieldType, string> = {
  text: 'Text field',
  date: 'Date',
  handwrittenSignature: 'Handwritten signature',
  certificateSignature: 'Certificate signature',
};

export class FieldFactory {
  static create(type: FieldType, page: number, x: number, y: number): Field {
    const id = uuidv4();
    const isSignature =
      type === 'handwrittenSignature' || type === 'certificateSignature';

    return {
      id,
      acroName: FieldNameCodec.encode(type, id),
      label: DEFAULT_LABELS[type],
      type,
      source: 'project',
      page,
      x,
      y,
      width: isSignature ? 0.25 : 0.2,
      height: isSignature ? 0.08 : 0.05,
      required: true,
      readOnly: false,
      multiline: false,
      dateFormat: type === 'date' ? 'YYYY-MM-DD' : undefined,
    };
  }
}
