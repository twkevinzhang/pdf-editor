import { Field } from '../entities/Field';
import { AcroFormWriter, AcroFormWriteSource } from './AcroFormWriter';

export type PdfExportMode = 'designer' | 'signer';

/** Compatibility facade used by the UI while all persistence moves to PDF. */
export class PdfExportService {
  static async export(
    source: AcroFormWriteSource,
    fields: Field[],
    mode: PdfExportMode = 'designer'
  ): Promise<Uint8Array> {
    return mode === 'designer'
      ? AcroFormWriter.writeTemplate(source, fields)
      : AcroFormWriter.fill(source, fields);
  }

  static exportTemplate(
    source: AcroFormWriteSource,
    fields: Field[]
  ): Promise<Uint8Array> {
    return AcroFormWriter.writeTemplate(source, fields);
  }

  static exportFilled(
    source: AcroFormWriteSource,
    fields: Field[]
  ): Promise<Uint8Array> {
    return AcroFormWriter.fill(source, fields);
  }
}
