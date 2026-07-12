import {
  AcroFieldFlags,
  AnnotationFlags,
  PDFBool,
  PDFButton,
  PDFDocument,
  PDFField,
  PDFHexString,
  PDFName,
  PDFTextField,
  PDFWidgetAnnotation,
  PDFAcroSignature,
  StandardFonts,
  rgb,
} from 'pdf-lib';
import { Field } from '../entities/Field';
import { PdfGeometryMapper } from '../value-objects/PdfGeometryMapper';
import { FieldNameCodec } from './FieldNameCodec';

export type AcroFormWriteSource = Blob | ArrayBuffer | Uint8Array;

export class AcroFormWriter {
  /** Rebuilds project-owned widgets while preserving all external fields. */
  static async writeTemplate(
    source: AcroFormWriteSource,
    fields: Field[]
  ): Promise<Uint8Array> {
    const pdfDocument = await loadDocument(source);
    const form = pdfDocument.getForm();

    for (const existingField of [...form.getFields()]) {
      const name = existingField.getName();
      if (
        FieldNameCodec.isProjectField(name) ||
        FieldNameCodec.isCompanionValue(name)
      ) {
        form.removeField(existingField);
      }
    }

    const font = await pdfDocument.embedFont(StandardFonts.Helvetica);
    let needsViewerAppearances = false;
    for (const field of fields.filter(({ source }) => source === 'project')) {
      const page = pdfDocument.getPages()[field.page - 1];
      if (!page)
        throw new Error(
          `Field "${field.acroName}" references missing page ${field.page}.`
        );
      const cropBox = page.getCropBox();
      const rect = PdfGeometryMapper.toPdfRectangle(field, {
        ...cropBox,
        rotation: page.getRotation().angle,
      });

      if (field.type === 'text' || field.type === 'date') {
        const textField = form.createTextField(field.acroName);
        configureField(textField, field);
        if (field.maxLength !== undefined)
          textField.setMaxLength(field.maxLength);
        if (field.multiline) textField.enableMultiline();
        textField.addToPage(page, {
          ...rect,
          borderWidth: 1,
          borderColor: rgb(0.45, 0.45, 0.45),
          backgroundColor: rgb(1, 1, 1),
          font,
        });
        const value = field.defaultValue ?? field.value;
        if (value !== undefined) {
          textField.setText(value);
          needsViewerAppearances =
            updateTextAppearance(textField, font, value) ||
            needsViewerAppearances;
        }
      } else if (field.type === 'handwrittenSignature') {
        const button = form.createButton(field.acroName);
        configureField(button, field);
        button.addToPage(field.label || 'Sign here', page, {
          ...rect,
          borderWidth: 1,
          borderColor: rgb(0.2, 0.45, 0.8),
          backgroundColor: rgb(0.94, 0.97, 1),
          font,
        });
        if (field.value) {
          button.setImage(await embedDataUriImage(pdfDocument, field.value));
        }
        createSignatureCompanion(form, field);
      } else {
        createCertificateSignature(pdfDocument, field, page, rect);
      }
    }

    setNeedAppearances(pdfDocument, needsViewerAppearances);
    return pdfDocument.save({ updateFieldAppearances: false });
  }

  /** Writes values into existing fields without flattening the form. */
  static async fill(
    source: AcroFormWriteSource,
    fields: Field[]
  ): Promise<Uint8Array> {
    const pdfDocument = await loadDocument(source);
    const form = pdfDocument.getForm();
    const font = await pdfDocument.embedFont(StandardFonts.Helvetica);
    let needsViewerAppearances = false;

    for (const field of fields) {
      if (field.value === undefined) continue;
      if (field.type === 'text' || field.type === 'date') {
        const textField = form.getFieldMaybe(field.acroName);
        if (!(textField instanceof PDFTextField)) continue;
        textField.setText(field.value);
        needsViewerAppearances =
          updateTextAppearance(textField, font, field.value) ||
          needsViewerAppearances;
      } else if (
        field.type === 'handwrittenSignature' &&
        FieldNameCodec.parse(field.acroName)?.kind === 'handwrittenSignature'
      ) {
        const button = form.getFieldMaybe(field.acroName);
        if (button instanceof PDFButton && field.value) {
          button.setImage(await embedDataUriImage(pdfDocument, field.value));
          const companion = form.getFieldMaybe(
            FieldNameCodec.companionValueName(field.acroName)
          );
          if (companion instanceof PDFTextField) companion.setText(field.value);
        }
      }
      // A certificate signature value must be produced by a signing service.
      // Keeping the blank /Sig widget intact is intentional.
    }

    setNeedAppearances(pdfDocument, needsViewerAppearances);
    return pdfDocument.save({ updateFieldAppearances: false });
  }
}

function configureField(pdfField: PDFField, field: Field): void {
  if (field.required) pdfField.enableRequired();
  else pdfField.disableRequired();
  if (field.readOnly) pdfField.enableReadOnly();
  else pdfField.disableReadOnly();
  pdfField.acroField.dict.set(
    PDFName.of('TU'),
    PDFHexString.fromText(field.label)
  );
  if (field.defaultValue !== undefined) {
    pdfField.acroField.dict.set(
      PDFName.of('DV'),
      PDFHexString.fromText(field.defaultValue)
    );
  }
  if (field.type === 'date') {
    pdfField.acroField.dict.set(
      PDFName.of('PdfEditorDateFormat'),
      PDFHexString.fromText(field.dateFormat ?? 'YYYY-MM-DD')
    );
  }
}

function createSignatureCompanion(
  form: ReturnType<PDFDocument['getForm']>,
  field: Field
): void {
  const companion = form.createTextField(
    FieldNameCodec.companionValueName(field.acroName)
  );
  companion.enableReadOnly();
  companion.disableExporting();
  if (field.value !== undefined) companion.setText(field.value);
}

function createCertificateSignature(
  pdfDocument: PDFDocument,
  field: Field,
  page: ReturnType<PDFDocument['getPages']>[number],
  rect: { x: number; y: number; width: number; height: number }
): void {
  const context = pdfDocument.context;
  const dict = context.obj({ FT: 'Sig', Kids: [] });
  const ref = context.register(dict);
  const signature = PDFAcroSignature.fromDict(dict, ref);
  signature.setPartialName(field.acroName);
  signature.setFlagTo(AcroFieldFlags.Required, field.required);
  signature.setFlagTo(AcroFieldFlags.ReadOnly, field.readOnly);
  signature.dict.set(PDFName.of('TU'), PDFHexString.fromText(field.label));
  pdfDocument.catalog.getOrCreateAcroForm().addField(ref);

  const widget = PDFWidgetAnnotation.create(context, ref);
  widget.setRectangle(rect);
  widget.setP(page.ref);
  widget.setFlagTo(AnnotationFlags.Print, true);
  widget.getOrCreateBorderStyle().setWidth(1);
  const widgetRef = context.register(widget.dict);
  signature.addWidget(widgetRef);
  page.node.addAnnot(widgetRef);
}

/** Returns true when a viewer must generate the appearance (for example CJK). */
function updateTextAppearance(
  field: PDFTextField,
  font: Awaited<ReturnType<PDFDocument['embedFont']>>,
  value: string
): boolean {
  try {
    font.encodeText(value);
    field.updateAppearances(font);
    return false;
  } catch {
    return true;
  }
}

function setNeedAppearances(pdfDocument: PDFDocument, enabled: boolean): void {
  const acroForm = pdfDocument.catalog.getOrCreateAcroForm();
  if (enabled) acroForm.dict.set(PDFName.of('NeedAppearances'), PDFBool.True);
}

async function embedDataUriImage(pdfDocument: PDFDocument, value: string) {
  const match = /^data:image\/(png|jpe?g);base64,(.+)$/i.exec(value);
  if (!match)
    throw new Error('Handwritten signature must be a PNG or JPEG data URI.');
  const binary = atob(match[2]);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return match[1].toLowerCase() === 'png'
    ? pdfDocument.embedPng(bytes)
    : pdfDocument.embedJpg(bytes);
}

async function loadDocument(source: AcroFormWriteSource): Promise<PDFDocument> {
  let bytes: Uint8Array;
  if (source instanceof Uint8Array) bytes = source.slice();
  else if (source instanceof ArrayBuffer)
    bytes = new Uint8Array(source.slice(0));
  else bytes = new Uint8Array(await source.arrayBuffer());
  return PDFDocument.load(bytes, { updateMetadata: false });
}
