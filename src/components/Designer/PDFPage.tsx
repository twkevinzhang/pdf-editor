import React, { useEffect, useRef } from 'react';
import * as pdfjs from 'pdfjs-dist';
import { Canvas, FabricImage, Rect } from 'fabric';
import { Theme } from '../../styles/DesignSystem';
import { useDocument } from '../../application/DocumentStore';
import { Field, FieldFactory } from '../../domain/entities/Field';

interface PDFPageProps {
  page: pdfjs.PDFPageProxy;
  scale?: number;
}

export const PDFPage: React.FC<PDFPageProps> = ({ page, scale = 1.1 }) => {
  const {
    fields,
    activeFieldId,
    activeTool,
    updateField,
    addField,
    setActiveField,
    setActiveTool,
    appMode,
  } = useDocument();
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const renderTaskRef = useRef<pdfjs.RenderTask | null>(null);
  const fieldsRef = useRef(fields);
  const interactionRef = useRef({ activeTool, appMode });
  const syncGenerationRef = useRef(0);

  fieldsRef.current = fields;
  interactionRef.current = { activeTool, appMode };

  const syncFieldToDomain = (object: any) => {
    const canvas = fabricRef.current;
    const id = object.get('data')?.id as string | undefined;
    const field = fieldsRef.current.find((candidate) => candidate.id === id);
    if (
      !canvas ||
      !field ||
      appMode !== 'designer' ||
      field.source !== 'project'
    ) {
      return;
    }

    const width = Math.min(
      1,
      Math.max(0.01, (object.width * object.scaleX) / canvas.width)
    );
    const height = Math.min(
      1,
      Math.max(0.01, (object.height * object.scaleY) / canvas.height)
    );
    const x = Math.min(1 - width, Math.max(0, object.left / canvas.width));
    const y = Math.min(1 - height, Math.max(0, object.top / canvas.height));

    updateField(field.id, { x, y, width, height });
  };

  const addObject = async (
    canvas: Canvas,
    field: Field,
    generation: number
  ) => {
    const canEditGeometry =
      interactionRef.current.appMode === 'designer' &&
      field.source === 'project';
    const commonProps = {
      left: field.x * canvas.width,
      top: field.y * canvas.height,
      data: { id: field.id },
      hasControls: canEditGeometry,
      lockMovementX: !canEditGeometry,
      lockMovementY: !canEditGeometry,
      lockScalingX: !canEditGeometry,
      lockScalingY: !canEditGeometry,
      lockRotation: true,
      hasRotatingPoint: false,
      hoverCursor: canEditGeometry ? 'move' : 'pointer',
      selectable: true,
    };

    if (field.type === 'handwrittenSignature' && field.value) {
      try {
        const image = await FabricImage.fromURL(field.value);
        if (
          generation !== syncGenerationRef.current ||
          fabricRef.current !== canvas
        ) {
          return;
        }
        image.set({
          ...commonProps,
          scaleX: (field.width * canvas.width) / Math.max(1, image.width),
          scaleY: (field.height * canvas.height) / Math.max(1, image.height),
        });
        canvas.add(image);
        if (field.id === activeFieldId) canvas.setActiveObject(image);
        canvas.requestRenderAll();
        return;
      } catch {
        // Fall back to the placeholder rectangle for an invalid preview image.
      }
    }

    const isExternal = field.source === 'external';
    const isCertificate = field.type === 'certificateSignature';
    const isHandwritten = field.type === 'handwrittenSignature';
    const hasValue = Boolean(field.value);
    const rect = new Rect({
      ...commonProps,
      width: field.width * canvas.width,
      height: field.height * canvas.height,
      fill: isExternal
        ? 'rgba(118, 118, 128, 0.12)'
        : hasValue
        ? 'rgba(52, 199, 89, 0.14)'
        : isCertificate
        ? 'rgba(255, 159, 10, 0.13)'
        : 'rgba(0, 113, 227, 0.12)',
      stroke: isExternal
        ? Theme.colors.secondary
        : isCertificate
        ? '#d97706'
        : isHandwritten
        ? '#5856d6'
        : Theme.colors.primary,
      strokeWidth: 2,
      strokeDashArray: isCertificate ? [7, 4] : undefined,
      rx: 4,
      ry: 4,
    });
    canvas.add(rect);
    if (field.id === activeFieldId) canvas.setActiveObject(rect);
  };

  const syncFieldsToFabric = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const generation = ++syncGenerationRef.current;
    canvas.remove(...canvas.getObjects());

    const pageFields = fieldsRef.current.filter(
      (field) => field.page === page.pageNumber
    );
    pageFields.forEach((field) => {
      void addObject(canvas, field, generation);
    });
    canvas.requestRenderAll();
  };

  const initializeFabric = (width: number, height: number) => {
    fabricRef.current?.dispose();
    const canvas = new Canvas(`page-${page.pageNumber}`, {
      width,
      height,
      selection: false,
      selectionColor: 'rgba(0, 113, 227, 0.1)',
      selectionBorderColor: Theme.colors.primary,
    });

    const handleSelection = (event: any) => {
      const target = event.selected?.[0];
      if (target) setActiveField(target.get('data')?.id ?? null);
    };

    canvas.on('object:modified', (event) => {
      if (event.target) syncFieldToDomain(event.target);
    });
    canvas.on('selection:created', handleSelection);
    canvas.on('selection:updated', handleSelection);
    canvas.on('selection:cleared', () => setActiveField(null));
    canvas.on('mouse:down', (event) => {
      const interaction = interactionRef.current;
      if (
        event.target ||
        interaction.appMode !== 'designer' ||
        interaction.activeTool === 'select'
      ) {
        return;
      }

      const point = canvas.getScenePoint(event.e);
      const provisional = FieldFactory.create(
        interaction.activeTool,
        page.pageNumber,
        point.x / canvas.width,
        point.y / canvas.height
      );
      provisional.x = Math.min(
        1 - provisional.width,
        Math.max(0, provisional.x)
      );
      provisional.y = Math.min(
        1 - provisional.height,
        Math.max(0, provisional.y)
      );
      addField(provisional);
      setActiveTool('select');
    });

    fabricRef.current = canvas;
    syncFieldsToFabric();
  };

  const renderPdfAndInit = async () => {
    const canvas = pdfCanvasRef.current;
    if (!canvas) return;
    renderTaskRef.current?.cancel();

    const viewport = page.getViewport({ scale });
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const context = canvas.getContext('2d');
    if (!context) return;

    const renderTask = page.render({
      canvasContext: context,
      viewport,
      canvas,
    });
    renderTaskRef.current = renderTask;
    try {
      await renderTask.promise;
      initializeFabric(viewport.width, viewport.height);
    } catch (error) {
      if (
        !(error instanceof Error) ||
        error.name !== 'RenderingCancelledException'
      ) {
        console.error('PDF rendering error:', error);
      }
    }
  };

  useEffect(() => {
    void renderPdfAndInit();
    return () => {
      renderTaskRef.current?.cancel();
      syncGenerationRef.current += 1;
      fabricRef.current?.dispose();
      fabricRef.current = null;
    };
    // Rendering is intentionally recreated only when the PDF page or scale changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, scale]);

  useEffect(() => {
    syncFieldsToFabric();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields]);

  return (
    <section
      id={`pdf-page-${page.pageNumber}`}
      aria-label={`PDF 第 ${page.pageNumber} 頁`}
      style={{
        position: 'relative',
        marginBottom: 40,
        boxShadow: Theme.shadows.medium,
        borderRadius: Theme.radius.medium,
        overflow: 'hidden',
        lineHeight: 0,
        maxWidth: '100%',
      }}
    >
      <canvas
        ref={pdfCanvasRef}
        style={{ display: 'block', maxWidth: '100%' }}
      />
      <div style={{ position: 'absolute', inset: 0 }}>
        <canvas id={`page-${page.pageNumber}`} />
      </div>
    </section>
  );
};
