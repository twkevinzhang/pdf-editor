import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as pdfjs from 'pdfjs-dist';
import { Field, FieldType } from '../domain/entities/Field';
import { AcroFormReader } from '../domain/services/AcroFormReader';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export type AppMode = 'designer' | 'signer';
export type DocumentStatus = 'idle' | 'loading' | 'ready' | 'error';
export type ActiveTool = 'select' | FieldType;
export type EntryMode = 'guided' | 'shortcut' | null;
export type WorkflowStep = AppMode | null;

/**
 * The Designer state that must survive the guided handoff. The original PDF
 * does not yet contain fields that were only placed on the canvas, so loading
 * it again without this snapshot would lose those fields.
 */
export interface DesignerCheckpoint {
  file: File;
  fields: Field[];
  warnings: string[];
}

interface DocumentState {
  file: File | null;
  pdfDocument: pdfjs.PDFDocumentProxy | null;
  fields: Field[];
  activeFieldId: string | null;
  activeTool: ActiveTool;
  appMode: AppMode | null;
  entryMode: EntryMode;
  workflowStep: WorkflowStep;
  isTransitioning: boolean;
  designerCheckpoint: DesignerCheckpoint | null;
  status: DocumentStatus;
  error: string | null;
  warnings: string[];
}

interface DocumentContextType extends DocumentState {
  validationErrors: Record<string, string>;
  setFile: (file: File) => Promise<void>;
  setAppMode: (mode: AppMode | null) => void;
  resetDocument: () => void;
  startWorkflow: () => void;
  enterShortcut: (mode: AppMode) => void;
  handoffToSigner: (templateFile: File) => Promise<void>;
  returnToDesigner: () => Promise<void>;
  restartWorkflow: () => void;
  addField: (field: Field) => void;
  updateField: (id: string, updates: Partial<Field>) => void;
  removeField: (id: string) => void;
  setActiveField: (id: string | null) => void;
  setActiveTool: (tool: ActiveTool) => void;
}

const initialDocumentState: DocumentState = {
  file: null,
  pdfDocument: null,
  fields: [],
  activeFieldId: null,
  activeTool: 'select',
  appMode: null,
  entryMode: null,
  workflowStep: null,
  isTransitioning: false,
  designerCheckpoint: null,
  status: 'idle',
  error: null,
  warnings: [],
};

interface LoadFileOptions {
  appMode?: AppMode | null;
  entryMode?: EntryMode;
  workflowStep?: WorkflowStep;
  designerCheckpoint?: DesignerCheckpoint | null;
  restoredFields?: Field[];
  restoredWarnings?: string[];
  isTransitioning?: boolean;
}

const DocumentContext = createContext<DocumentContextType | undefined>(
  undefined
);

export const DocumentProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<DocumentState>(initialDocumentState);
  const documentRef = useRef<pdfjs.PDFDocumentProxy | null>(null);
  const loadRequestRef = useRef(0);
  const stateRef = useRef<DocumentState>(initialDocumentState);

  // Workflow actions run asynchronously. Keep a current snapshot so a handoff
  // always captures the latest Designer fields instead of a stale closure.
  stateRef.current = state;

  useEffect(
    () => () => {
      loadRequestRef.current += 1;
      void documentRef.current?.destroy();
    },
    []
  );

  const loadFile = useCallback(
    async (file: File, options: LoadFileOptions = {}) => {
      const requestId = ++loadRequestRef.current;
      setState((prev) => ({
        ...prev,
        file: null,
        pdfDocument: null,
        fields: [],
        activeFieldId: null,
        activeTool: 'select',
        status: 'loading',
        error: null,
        warnings: [],
        isTransitioning: options.isTransitioning ?? prev.isTransitioning,
      }));

      const previousDocument = documentRef.current;
      documentRef.current = null;
      if (previousDocument) void previousDocument.destroy();

      try {
        const buffer = await file.arrayBuffer();
        const loadingTask = pdfjs.getDocument({ data: buffer.slice(0) });
        const [pdfDocument, readResult] = await Promise.all([
          loadingTask.promise,
          AcroFormReader.read(buffer.slice(0)),
        ]);

        if (requestId !== loadRequestRef.current) {
          await pdfDocument.destroy();
          return;
        }

        const xfaWarning = readResult.warnings.find((warning) =>
          warning.toLowerCase().includes('xfa')
        );
        if (xfaWarning) {
          await pdfDocument.destroy();
          throw new Error(
            '此 PDF 使用不支援的 XFA 表單。請先在 Adobe Acrobat 將文件另存或轉換為標準 AcroForm PDF，再重新上傳。'
          );
        }

        documentRef.current = pdfDocument;
        setState((prev) => ({
          ...prev,
          file,
          pdfDocument,
          fields: cloneFields(options.restoredFields ?? readResult.fields),
          activeFieldId: null,
          activeTool: 'select',
          appMode: options.appMode ?? prev.appMode,
          entryMode: options.entryMode ?? prev.entryMode,
          workflowStep: options.workflowStep ?? prev.workflowStep,
          designerCheckpoint:
            options.designerCheckpoint === undefined
              ? prev.designerCheckpoint
              : cloneCheckpoint(options.designerCheckpoint),
          status: 'ready',
          error: null,
          warnings: [...(options.restoredWarnings ?? readResult.warnings)],
          isTransitioning: false,
        }));
      } catch (error) {
        if (requestId !== loadRequestRef.current) return;
        const message =
          error instanceof Error ? error.message : '無法載入這份 PDF。';
        setState((prev) => ({
          ...prev,
          file: null,
          pdfDocument: null,
          fields: [],
          activeFieldId: null,
          activeTool: 'select',
          status: 'error',
          error: message,
          isTransitioning: false,
        }));
      }
    },
    []
  );

  // This public API intentionally does not select a mode. Existing callers
  // can call setAppMode() before or after setFile() without the async load
  // resetting their selection.
  const setFile = useCallback(
    async (file: File) => {
      await loadFile(file);
    },
    [loadFile]
  );

  const setAppMode = useCallback((appMode: AppMode | null) => {
    setState((prev) => ({ ...prev, appMode }));
  }, []);

  const resetDocument = useCallback(() => {
    loadRequestRef.current += 1;
    const currentDocument = documentRef.current;
    documentRef.current = null;
    if (currentDocument) void currentDocument.destroy();
    setState(initialDocumentState);
  }, []);

  const startWorkflow = useCallback(() => {
    loadRequestRef.current += 1;
    const currentDocument = documentRef.current;
    documentRef.current = null;
    if (currentDocument) void currentDocument.destroy();
    setState({
      ...initialDocumentState,
      appMode: 'designer',
      entryMode: 'guided',
      workflowStep: 'designer',
    });
  }, []);

  const enterShortcut = useCallback((appMode: AppMode) => {
    loadRequestRef.current += 1;
    const currentDocument = documentRef.current;
    documentRef.current = null;
    if (currentDocument) void currentDocument.destroy();
    setState({
      ...initialDocumentState,
      appMode,
      entryMode: 'shortcut',
      workflowStep: appMode,
    });
  }, []);

  const handoffToSigner = useCallback(
    async (templateFile: File) => {
      const currentState = stateRef.current;
      if (
        currentState.appMode !== 'designer' ||
        currentState.status !== 'ready' ||
        !currentState.file
      ) {
        return;
      }

      const checkpoint: DesignerCheckpoint = {
        file: currentState.file,
        fields: cloneFields(currentState.fields),
        warnings: [...currentState.warnings],
      };

      setState((prev) => ({
        ...prev,
        entryMode: 'guided',
        workflowStep: 'designer',
        designerCheckpoint: checkpoint,
        isTransitioning: true,
      }));

      await loadFile(templateFile, {
        appMode: 'signer',
        entryMode: 'guided',
        workflowStep: 'signer',
        designerCheckpoint: checkpoint,
        isTransitioning: true,
      });
    },
    [loadFile]
  );

  const returnToDesigner = useCallback(async () => {
    const checkpoint = stateRef.current.designerCheckpoint;
    if (!checkpoint) return;

    const restoredCheckpoint = cloneCheckpoint(checkpoint);
    if (!restoredCheckpoint) return;

    setState((prev) => ({ ...prev, isTransitioning: true }));
    await loadFile(restoredCheckpoint.file, {
      appMode: 'designer',
      entryMode: 'guided',
      workflowStep: 'designer',
      designerCheckpoint: restoredCheckpoint,
      restoredFields: restoredCheckpoint.fields,
      restoredWarnings: restoredCheckpoint.warnings,
      isTransitioning: true,
    });
  }, [loadFile]);

  const restartWorkflow = useCallback(() => {
    resetDocument();
  }, [resetDocument]);

  const addField = useCallback((field: Field) => {
    setState((prev) => {
      if (prev.appMode !== 'designer' || field.source !== 'project')
        return prev;
      return {
        ...prev,
        fields: [...prev.fields, field],
        activeFieldId: field.id,
      };
    });
  }, []);

  const updateField = useCallback((id: string, updates: Partial<Field>) => {
    setState((prev) => {
      const target = prev.fields.find((field) => field.id === id);
      if (!target) return prev;

      let allowedUpdates: Partial<Field> = {};
      if (prev.appMode === 'designer' && target.source === 'project') {
        allowedUpdates = updates;
      } else if (
        prev.appMode === 'signer' &&
        !target.readOnly &&
        target.type !== 'certificateSignature' &&
        Object.prototype.hasOwnProperty.call(updates, 'value')
      ) {
        allowedUpdates = { value: updates.value };
      }

      if (Object.keys(allowedUpdates).length === 0) return prev;
      return {
        ...prev,
        fields: prev.fields.map((field) =>
          field.id === id ||
          (prev.appMode === 'signer' && field.acroName === target.acroName)
            ? { ...field, ...allowedUpdates }
            : field
        ),
      };
    });
  }, []);

  const removeField = useCallback((id: string) => {
    setState((prev) => {
      const target = prev.fields.find((field) => field.id === id);
      if (prev.appMode !== 'designer' || target?.source !== 'project')
        return prev;
      return {
        ...prev,
        fields: prev.fields.filter((field) => field.id !== id),
        activeFieldId: prev.activeFieldId === id ? null : prev.activeFieldId,
      };
    });
  }, []);

  const setActiveField = useCallback((activeFieldId: string | null) => {
    setState((prev) => ({ ...prev, activeFieldId }));
  }, []);

  const setActiveTool = useCallback((activeTool: ActiveTool) => {
    setState((prev) => ({ ...prev, activeTool }));
  }, []);

  const validationErrors = useMemo(
    () => validateFields(state.fields, state.appMode),
    [state.fields, state.appMode]
  );

  const value = useMemo<DocumentContextType>(
    () => ({
      ...state,
      validationErrors,
      setFile,
      setAppMode,
      resetDocument,
      startWorkflow,
      enterShortcut,
      handoffToSigner,
      returnToDesigner,
      restartWorkflow,
      addField,
      updateField,
      removeField,
      setActiveField,
      setActiveTool,
    }),
    [
      state,
      validationErrors,
      setFile,
      setAppMode,
      resetDocument,
      startWorkflow,
      enterShortcut,
      handoffToSigner,
      returnToDesigner,
      restartWorkflow,
      addField,
      updateField,
      removeField,
      setActiveField,
      setActiveTool,
    ]
  );

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
};

function cloneFields(fields: Field[]): Field[] {
  return fields.map((field) => ({ ...field }));
}

function cloneCheckpoint(
  checkpoint: DesignerCheckpoint | null
): DesignerCheckpoint | null {
  if (!checkpoint) return null;
  return {
    file: checkpoint.file,
    fields: cloneFields(checkpoint.fields),
    warnings: [...checkpoint.warnings],
  };
}

function validateFields(
  fields: Field[],
  appMode: AppMode | null
): Record<string, string> {
  if (appMode !== 'signer') return {};
  return fields.reduce<Record<string, string>>((errors, field) => {
    const value = field.value?.trim() ?? '';
    if (field.required && field.type !== 'certificateSignature' && !value) {
      errors[field.id] = '此欄位為必填。';
      return errors;
    }
    if (
      field.type === 'date' &&
      value &&
      !isValidDate(value, field.dateFormat)
    ) {
      errors[field.id] = `請輸入有效日期（${
        field.dateFormat ?? 'YYYY-MM-DD'
      }）。`;
    }
    return errors;
  }, {});
}

function isValidDate(value: string, format = 'YYYY-MM-DD'): boolean {
  const separator = format.includes('/') ? '/' : '-';
  const expected = `YYYY${separator}MM${separator}DD`;
  if (format !== expected) return value.length > 0;
  const match = new RegExp(
    `^(\\d{4})\\${separator}(\\d{2})\\${separator}(\\d{2})$`
  ).exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const candidate = new Date(Date.UTC(year, month - 1, day));
  return (
    candidate.getUTCFullYear() === year &&
    candidate.getUTCMonth() === month - 1 &&
    candidate.getUTCDate() === day
  );
}

export const useDocument = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocument must be used within a DocumentProvider');
  }
  return context;
};
