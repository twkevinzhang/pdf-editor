import { PDFDocument, StandardFonts } from 'pdf-lib';
import { describe, expect, it } from 'vitest';
import { Field, FieldFactory } from '../entities/Field';
import { AcroFormWriter } from './AcroFormWriter';

if (!('DOMMatrix' in globalThis)) {
  Object.defineProperty(globalThis, 'DOMMatrix', {
    configurable: true,
    value: class DOMMatrix {},
  });
}

async function createPdfWithExternalText(): Promise<Uint8Array> {
  const document = await PDFDocument.create();
  const page = document.addPage([500, 700]);
  const form = document.getForm();
  const font = await document.embedFont(StandardFonts.Helvetica);
  const external = form.createTextField('external.reference');
  external.setText('EXT-001');
  external.addToPage(page, {
    x: 25,
    y: 640,
    width: 160,
    height: 24,
    font,
  });
  return document.save();
}

describe('AcroFormReader', () => {
  it('round-trips project widgets and exposes supported external text', async () => {
    const fields: Field[] = [
      FieldFactory.create('text', 1, 0.1, 0.1),
      FieldFactory.create('date', 1, 0.1, 0.2),
      FieldFactory.create('handwrittenSignature', 1, 0.1, 0.3),
      FieldFactory.create('certificateSignature', 1, 0.1, 0.42),
    ];
    const template = await AcroFormWriter.writeTemplate(
      await createPdfWithExternalText(),
      fields
    );
    const { AcroFormReader } = await import('./AcroFormReader');

    const result = await AcroFormReader.read(template);

    expect(result.fields).toHaveLength(5);
    for (const original of fields) {
      const restored = result.fields.find(
        (field) => field.acroName === original.acroName
      );
      expect(restored).toMatchObject({
        type: original.type,
        source: 'project',
        page: 1,
        required: original.required,
        readOnly: original.readOnly,
      });
      expect(restored?.x).toBeCloseTo(original.x, 2);
      expect(restored?.y).toBeCloseTo(original.y, 2);
      expect(restored?.width).toBeCloseTo(original.width, 2);
      expect(restored?.height).toBeCloseTo(original.height, 2);
    }

    expect(
      result.fields.find((field) => field.acroName === 'external.reference')
    ).toMatchObject({
      type: 'text',
      source: 'external',
      value: 'EXT-001',
    });
  });
});
