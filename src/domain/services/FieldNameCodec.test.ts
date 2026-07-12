import { describe, expect, it } from 'vitest';
import { FieldNameCodec } from './FieldNameCodec';

describe('FieldNameCodec', () => {
  const id = '00000000-0000-4000-8000-000000000001';

  it.each([
    'text',
    'date',
    'handwrittenSignature',
    'certificateSignature',
  ] as const)('round-trips the %s project field name', (kind) => {
    const encoded = FieldNameCodec.encode(kind, id);

    expect(encoded).toBe(`pdfEditor.${kind}.${id}`);
    expect(FieldNameCodec.parse(encoded)).toEqual({ kind, id });
    expect(FieldNameCodec.isProjectField(encoded)).toBe(true);
  });

  it('does not claim external or malformed field names', () => {
    expect(FieldNameCodec.parse('customer.name')).toBeNull();
    expect(FieldNameCodec.parse('pdfEditor.text')).toBeNull();
    expect(FieldNameCodec.parse('pdfEditor.checkbox.id')).toBeNull();
  });

  it('identifies the hidden handwritten-signature companion field', () => {
    const name = FieldNameCodec.encode('handwrittenSignature', id);
    const companion = FieldNameCodec.companionValueName(name);

    expect(companion).toBe(`pdfEditor.handwrittenSignatureValue.${id}`);
    expect(FieldNameCodec.isCompanionValue(companion)).toBe(true);
    expect(FieldNameCodec.isProjectField(companion)).toBe(false);
  });
});
