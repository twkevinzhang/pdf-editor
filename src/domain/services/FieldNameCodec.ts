import type { FieldType } from '../entities/Field';

const PREFIX = 'pdfEditor';
const HANDWRITTEN_VALUE_KIND = 'handwrittenSignatureValue';
const SUPPORTED_KINDS = new Set<FieldType>([
  'text',
  'date',
  'handwrittenSignature',
  'certificateSignature',
]);
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface ParsedProjectFieldName {
  kind: FieldType;
  id: string;
}

export class FieldNameCodec {
  static encode(kind: FieldType, id: string): string {
    if (!UUID_PATTERN.test(id)) {
      throw new Error('A project field id must be a UUID.');
    }
    return `${PREFIX}.${kind}.${id}`;
  }

  static parse(name: string): ParsedProjectFieldName | null {
    const parts = name.split('.');
    if (parts.length !== 3 || parts[0] !== PREFIX) return null;

    const kind = parts[1] as FieldType;
    const id = parts[2];
    if (!SUPPORTED_KINDS.has(kind) || !UUID_PATTERN.test(id)) return null;

    return { kind, id };
  }

  static isProjectField(name: string): boolean {
    return this.parse(name) !== null;
  }

  static companionValueName(name: string): string {
    const parsed = this.parse(name);
    if (!parsed || parsed.kind !== 'handwrittenSignature') {
      throw new Error(
        'Only a project handwritten signature has a companion value.'
      );
    }
    return `${PREFIX}.${HANDWRITTEN_VALUE_KIND}.${parsed.id}`;
  }

  static isCompanionValue(name: string): boolean {
    const [prefix, kind, id, ...rest] = name.split('.');
    return (
      rest.length === 0 &&
      prefix === PREFIX &&
      kind === HANDWRITTEN_VALUE_KIND &&
      UUID_PATTERN.test(id)
    );
  }
}
