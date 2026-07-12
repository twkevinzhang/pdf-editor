export interface NormalizedPdfRectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PdfRectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PdfPageGeometry extends PdfRectangle {
  rotation: number;
}

type Point = [number, number];

/** Maps between PDF points and the UI's rotated, top-left normalized space. */
export class PdfGeometryMapper {
  static toPdfRectangle(
    rect: NormalizedPdfRectangle,
    page: PdfPageGeometry
  ): PdfRectangle {
    this.assertRectangle(rect);
    const rotation = this.normalizeRotation(page.rotation);
    const viewportWidth = rotation % 180 === 0 ? page.width : page.height;
    const viewportHeight = rotation % 180 === 0 ? page.height : page.width;
    const left = rect.x * viewportWidth;
    const top = rect.y * viewportHeight;
    const right = (rect.x + rect.width) * viewportWidth;
    const bottom = (rect.y + rect.height) * viewportHeight;
    const points = [
      this.viewportToPdf(left, top, page, rotation),
      this.viewportToPdf(right, top, page, rotation),
      this.viewportToPdf(left, bottom, page, rotation),
      this.viewportToPdf(right, bottom, page, rotation),
    ];

    return this.boundingRectangle(points);
  }

  static fromPdfRectangle(
    rect: PdfRectangle,
    page: PdfPageGeometry
  ): NormalizedPdfRectangle {
    this.assertRectangle(rect);
    const rotation = this.normalizeRotation(page.rotation);
    const viewportWidth = rotation % 180 === 0 ? page.width : page.height;
    const viewportHeight = rotation % 180 === 0 ? page.height : page.width;
    const points = [
      this.pdfToViewport(rect.x, rect.y, page, rotation),
      this.pdfToViewport(rect.x + rect.width, rect.y, page, rotation),
      this.pdfToViewport(rect.x, rect.y + rect.height, page, rotation),
      this.pdfToViewport(
        rect.x + rect.width,
        rect.y + rect.height,
        page,
        rotation
      ),
    ];
    const viewport = this.boundingRectangle(points);

    return {
      x: viewport.x / viewportWidth,
      y: viewport.y / viewportHeight,
      width: viewport.width / viewportWidth,
      height: viewport.height / viewportHeight,
    };
  }

  static normalizeRotation(rotation: number): 0 | 90 | 180 | 270 {
    const normalized = ((rotation % 360) + 360) % 360;
    if (
      normalized === 0 ||
      normalized === 90 ||
      normalized === 180 ||
      normalized === 270
    ) {
      return normalized;
    }
    throw new Error(`Unsupported PDF page rotation: ${rotation}`);
  }

  private static pdfToViewport(
    pdfX: number,
    pdfY: number,
    page: PdfPageGeometry,
    rotation: 0 | 90 | 180 | 270
  ): Point {
    const maxX = page.x + page.width;
    const maxY = page.y + page.height;
    switch (rotation) {
      case 0:
        return [pdfX - page.x, maxY - pdfY];
      case 90:
        return [pdfY - page.y, pdfX - page.x];
      case 180:
        return [maxX - pdfX, pdfY - page.y];
      case 270:
        return [maxY - pdfY, maxX - pdfX];
    }
  }

  private static viewportToPdf(
    viewportX: number,
    viewportY: number,
    page: PdfPageGeometry,
    rotation: 0 | 90 | 180 | 270
  ): Point {
    const maxX = page.x + page.width;
    const maxY = page.y + page.height;
    switch (rotation) {
      case 0:
        return [page.x + viewportX, maxY - viewportY];
      case 90:
        return [page.x + viewportY, page.y + viewportX];
      case 180:
        return [maxX - viewportX, page.y + viewportY];
      case 270:
        return [maxX - viewportY, maxY - viewportX];
    }
  }

  private static boundingRectangle(points: Point[]): PdfRectangle {
    const xs = points.map(([x]) => x);
    const ys = points.map(([, y]) => y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    return {
      x: minX,
      y: minY,
      width: Math.max(...xs) - minX,
      height: Math.max(...ys) - minY,
    };
  }

  private static assertRectangle(rect: PdfRectangle): void {
    const values = [rect.x, rect.y, rect.width, rect.height];
    if (values.some((value) => !Number.isFinite(value))) {
      throw new Error('PDF rectangle values must be finite numbers.');
    }
    if (rect.width < 0 || rect.height < 0) {
      throw new Error('PDF rectangle width and height cannot be negative.');
    }
  }
}
