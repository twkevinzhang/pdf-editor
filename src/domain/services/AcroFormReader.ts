import {
  PDFButton,
  PDFDict,
  PDFDocument,
  PDFField,
  PDFHexString,
  PDFName,
  PDFSignature,
  PDFString,
  PDFTextField,
} from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';
import { Field, FieldType } from '../entities/Field';
import { PdfGeometryMapper } from '../value-objects/PdfGeometryMapper';
import { FieldNameCodec } from './FieldNameCodec';

export type AcroFormReadSource = Blob | ArrayBuffer | Uint8Array;

export interface AcroFormReadResult {
  fields: Field[];
  warnings: string[];
}

interface FieldMetadata {
  name: string;
  label?: string;
  value?: string;
  defaultValue?: string;
  required: boolean;
  readOnly: boolean;
  maxLength?: number;
  multiline?: boolean;
  dateFormat?: string;
  pdfLibType: 'text' | 'button' | 'signature' | 'unsupported';
}

export class AcroFormReader {
  static async read(source: AcroFormReadSource): Promise<AcroFormReadResult> {
    const bytes = await toBytes(source);
    const warnings: string[] = [];
    const metadata = await this.readMetadata(bytes.slice(), warnings);
    const fields: Field[] = [];
    const seenProjectIds = new Set<string>();
    const loadingTask = pdfjs.getDocument({ data: bytes.slice() });
    const pdfDocument = await loadingTask.promise;

    try {
      for (
        let pageIndex = 0;
        pageIndex < pdfDocument.numPages;
        pageIndex += 1
      ) {
        const page = await pdfDocument.getPage(pageIndex + 1);
        const annotations = await page.getAnnotations({ intent: 'display' });
        const [minX, minY, maxX, maxY] = page.view;
        const pageGeometry = {
          x: minX,
          y: minY,
          width: maxX - minX,
          height: maxY - minY,
          rotation: page.rotate,
        };

        annotations.forEach((annotation: any, annotationIndex: number) => {
          if (!annotation.fieldName || !Array.isArray(annotation.rect)) return;

          const acroName = String(annotation.fieldName);
          if (FieldNameCodec.isCompanionValue(acroName)) return;

          const parsedName = FieldNameCodec.parse(acroName);
          const fieldMetadata = metadata.get(acroName);
          const type = resolveFieldType(
            acroName,
            annotation.fieldType,
            parsedName?.kind,
            fieldMetadata,
            warnings
          );
          if (!type) return;

          const [rectX1, rectY1, rectX2, rectY2] = annotation.rect.map(Number);
          if (
            [rectX1, rectY1, rectX2, rectY2].some(
              (value) => !Number.isFinite(value)
            )
          ) {
            warnings.push(
              `Skipped field "${acroName}" on page ${
                pageIndex + 1
              }: invalid widget rectangle.`
            );
            return;
          }

          const normalized = PdfGeometryMapper.fromPdfRectangle(
            {
              x: Math.min(rectX1, rectX2),
              y: Math.min(rectY1, rectY2),
              width: Math.abs(rectX2 - rectX1),
              height: Math.abs(rectY2 - rectY1),
            },
            pageGeometry
          );
          let id =
            parsedName?.id ??
            externalId(acroName, pageIndex, annotation, annotationIndex);
          if (parsedName && seenProjectIds.has(id)) {
            id = `${id}:widget:${pageIndex + 1}:${annotationIndex}`;
          }
          if (parsedName) seenProjectIds.add(parsedName.id);

          const companion =
            type === 'handwrittenSignature'
              ? metadata.get(FieldNameCodec.companionValueName(acroName))
              : undefined;
          const value =
            companion?.value ??
            fieldMetadata?.value ??
            (typeof annotation.fieldValue === 'string'
              ? annotation.fieldValue
              : undefined);

          fields.push({
            id,
            acroName,
            label:
              fieldMetadata?.label ??
              annotation.alternativeText ??
              annotation.fieldName,
            type,
            source: parsedName ? 'project' : 'external',
            page: pageIndex + 1,
            ...normalized,
            value,
            defaultValue: fieldMetadata?.defaultValue,
            required: fieldMetadata?.required ?? Boolean(annotation.required),
            readOnly: fieldMetadata?.readOnly ?? Boolean(annotation.readOnly),
            maxLength: fieldMetadata?.maxLength,
            multiline: fieldMetadata?.multiline ?? false,
            dateFormat:
              type === 'date'
                ? fieldMetadata?.dateFormat ?? 'YYYY-MM-DD'
                : undefined,
          });
        });
      }
    } finally {
      await loadingTask.destroy();
    }

    return { fields, warnings };
  }

  private static async readMetadata(
    bytes: Uint8Array,
    warnings: string[]
  ): Promise<Map<string, FieldMetadata>> {
    const result = new Map<string, FieldMetadata>();
    try {
      const pdfDocument = await PDFDocument.load(bytes, {
        updateMetadata: false,
      });
      const acroFormDict = pdfDocument.catalog.lookupMaybe(
        PDFName.of('AcroForm'),
        PDFDict
      );
      if (acroFormDict?.has(PDFName.of('XFA'))) {
        warnings.push(
          'This PDF contains XFA data. Only its standard AcroForm widgets are available; XFA behavior is not supported.'
        );
      }

      for (const field of pdfDocument.getForm().getFields()) {
        const name = field.getName();
        let value: string | undefined;
        let maxLength: number | undefined;
        let multiline: boolean | undefined;
        let pdfLibType: FieldMetadata['pdfLibType'] = 'unsupported';

        if (field instanceof PDFTextField) {
          pdfLibType = 'text';
          value = safelyGetText(field, name, warnings);
          maxLength = field.getMaxLength();
          multiline = field.isMultiline();
        } else if (field instanceof PDFButton) {
          pdfLibType = 'button';
        } else if (field instanceof PDFSignature) {
          pdfLibType = 'signature';
          if (field.acroField.dict.has(PDFName.of('V'))) {
            warnings.push(
              `Field "${name}" contains an existing digital signature; exporting a modified PDF may invalidate it.`
            );
          }
        }

        result.set(name, {
          name,
          label: getTextEntry(field, 'TU'),
          value,
          defaultValue: getTextEntry(field, 'DV'),
          required: field.isRequired(),
          readOnly: field.isReadOnly(),
          maxLength,
          multiline,
          dateFormat: getTextEntry(field, 'PdfEditorDateFormat'),
          pdfLibType,
        });
      }
    } catch (error) {
      warnings.push(
        `AcroForm metadata could not be read; widget data will be used instead (${errorMessage(
          error
        )}).`
      );
    }
    return result;
  }
}

function resolveFieldType(
  name: string,
  annotationType: string | undefined,
  projectType: FieldType | undefined,
  metadata: FieldMetadata | undefined,
  warnings: string[]
): FieldType | null {
  if (projectType) {
    const expectedAnnotationType =
      projectType === 'text' || projectType === 'date'
        ? 'Tx'
        : projectType === 'handwrittenSignature'
        ? 'Btn'
        : 'Sig';
    if (annotationType !== expectedAnnotationType) {
      warnings.push(
        `Skipped project field "${name}": expected ${expectedAnnotationType} widget, received ${
          annotationType ?? 'unknown'
        }.`
      );
      return null;
    }
    return projectType;
  }

  const resolvedType = annotationType ?? metadata?.pdfLibType;
  if (resolvedType === 'Tx' || resolvedType === 'text') return 'text';
  if (resolvedType === 'Sig' || resolvedType === 'signature') {
    return 'certificateSignature';
  }

  warnings.push(
    `Skipped unsupported external AcroForm field "${name}" (type ${String(
      resolvedType ?? 'unknown'
    )}).`
  );
  return null;
}

function safelyGetText(
  field: PDFTextField,
  name: string,
  warnings: string[]
): string | undefined {
  try {
    return field.getText();
  } catch (error) {
    warnings.push(
      `Could not read text value for field "${name}" (${errorMessage(error)}).`
    );
    return undefined;
  }
}

function getTextEntry(field: PDFField, key: string): string | undefined {
  const value = field.acroField.dict.lookupMaybe(
    PDFName.of(key),
    PDFString,
    PDFHexString
  );
  return value?.decodeText();
}

function externalId(
  name: string,
  pageIndex: number,
  annotation: any,
  annotationIndex: number
): string {
  return `external:${name}:${pageIndex + 1}:${
    annotation.id ?? annotationIndex
  }`;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function toBytes(source: AcroFormReadSource): Promise<Uint8Array> {
  if (source instanceof Uint8Array) return source.slice();
  if (source instanceof ArrayBuffer) return new Uint8Array(source.slice(0));
  return new Uint8Array(await source.arrayBuffer());
}
