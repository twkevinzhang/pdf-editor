import { describe, expect, it } from 'vitest';
import { PdfGeometryMapper } from './PdfGeometryMapper';

describe('PdfGeometryMapper', () => {
  it.each([0, 90, 180, 270] as const)(
    'round-trips a normalized rectangle for %s degree rotation and a non-zero CropBox',
    (rotation) => {
      const page = {
        x: 37,
        y: 53,
        width: 612,
        height: 792,
        rotation,
      };
      const normalized = {
        x: 0.123,
        y: 0.217,
        width: 0.31,
        height: 0.084,
      };

      const pdfRectangle = PdfGeometryMapper.toPdfRectangle(normalized, page);
      const restored = PdfGeometryMapper.fromPdfRectangle(pdfRectangle, page);

      expect(restored.x).toBeCloseTo(normalized.x, 8);
      expect(restored.y).toBeCloseTo(normalized.y, 8);
      expect(restored.width).toBeCloseTo(normalized.width, 8);
      expect(restored.height).toBeCloseTo(normalized.height, 8);
    }
  );

  it('rejects rotations outside the PDF right-angle set', () => {
    expect(() => PdfGeometryMapper.normalizeRotation(45)).toThrow(
      'Unsupported PDF page rotation'
    );
  });
});
