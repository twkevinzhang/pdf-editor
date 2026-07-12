import {
  PDFButton,
  PDFDocument,
  PDFSignature,
  PDFTextField,
  StandardFonts,
} from 'pdf-lib';
import { describe, expect, it } from 'vitest';
import { Field, FieldFactory } from '../entities/Field';
import { AcroFormWriter } from './AcroFormWriter';
import { FieldNameCodec } from './FieldNameCodec';

const ONE_PIXEL_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9ZrGAAAAAASUVORK5CYII=';

async function createSourcePdf(): Promise<Uint8Array> {
  const document = await PDFDocument.create();
  const page = document.addPage([612, 792]);
  const form = document.getForm();
  const font = await document.embedFont(StandardFonts.Helvetica);
  const external = form.createTextField('external.customerName');
  external.addToPage(page, {
    x: 40,
    y: 700,
    width: 220,
    height: 28,
    font,
  });
  return document.save();
}

function projectFields(): Field[] {
  const text = FieldFactory.create('text', 1, 0.1, 0.1);
  text.label = '姓名';
  text.maxLength = 30;
  const date = FieldFactory.create('date', 1, 0.1, 0.2);
  date.required = false;
  const handwritten = FieldFactory.create('handwrittenSignature', 1, 0.1, 0.3);
  const certificate = FieldFactory.create('certificateSignature', 1, 0.1, 0.42);
  return [text, date, handwritten, certificate];
}

describe('AcroFormWriter', () => {
  it('creates all V1 project fields without removing an external field', async () => {
    const fields = projectFields();
    const bytes = await AcroFormWriter.writeTemplate(
      await createSourcePdf(),
      fields
    );
    const document = await PDFDocument.load(bytes);
    const form = document.getForm();

    expect(form.getField('external.customerName')).toBeInstanceOf(PDFTextField);
    expect(form.getField(fields[0].acroName)).toBeInstanceOf(PDFTextField);
    expect(form.getField(fields[1].acroName)).toBeInstanceOf(PDFTextField);
    expect(form.getField(fields[2].acroName)).toBeInstanceOf(PDFButton);
    expect(form.getField(fields[3].acroName)).toBeInstanceOf(PDFSignature);
    expect(
      form.getField(FieldNameCodec.companionValueName(fields[2].acroName))
    ).toBeInstanceOf(PDFTextField);
    expect(form.getFields()).toHaveLength(6);
  });

  it('fills Unicode text and a handwritten appearance while keeping fields editable', async () => {
    const fields = projectFields();
    const template = await AcroFormWriter.writeTemplate(
      await createSourcePdf(),
      fields
    );
    fields[0].value = '中文姓名';
    fields[2].value = ONE_PIXEL_PNG;
    const external: Field = {
      id: 'external-widget',
      acroName: 'external.customerName',
      label: 'External name',
      type: 'text',
      source: 'external',
      page: 1,
      x: 0.1,
      y: 0.1,
      width: 0.2,
      height: 0.05,
      value: 'External value',
      required: false,
      readOnly: false,
    };

    const filled = await AcroFormWriter.fill(template, [...fields, external]);
    const document = await PDFDocument.load(filled);
    const form = document.getForm();

    expect(form.getTextField(fields[0].acroName).getText()).toBe('中文姓名');
    expect(form.getTextField('external.customerName').getText()).toBe(
      'External value'
    );
    expect(
      form
        .getTextField(FieldNameCodec.companionValueName(fields[2].acroName))
        .getText()
    ).toBe(ONE_PIXEL_PNG);
    expect(form.getField(fields[3].acroName)).toBeInstanceOf(PDFSignature);
    expect(form.getFields()).toHaveLength(6);
  });
});
