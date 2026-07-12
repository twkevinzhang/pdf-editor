import React, { useState } from 'react';
import styled from 'styled-components';
import {
  Calendar,
  ArrowRight,
  CheckCircle2,
  Download,
  FileSignature,
  LoaderCircle,
  MousePointer2,
  PenLine,
  ShieldCheck,
  Type,
} from 'lucide-react';
import { Theme, UIButton } from '../../styles/DesignSystem';
import { useDocument } from '../../application/DocumentStore';
import { FieldType } from '../../domain/entities/Field';
import { PdfExportService } from '../../domain/services/PdfExportService';

const ToolbarContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(20px);
  padding: 8px;
  border-radius: ${Theme.radius.large};
  border: 1px solid ${Theme.colors.border};
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  box-shadow: ${Theme.shadows.medium};
  max-width: calc(100vw - 220px);

  @media (max-width: 980px) {
    top: 16px;
    max-width: calc(100vw - 112px);
  }

  @media (max-width: 700px) {
    top: 12px;
    gap: 4px;
    max-width: calc(100vw - 76px);
  }
`;

const ToolButton = styled.button<{ $active?: boolean }>`
  background: ${(props) =>
    props.$active ? Theme.colors.primary : 'transparent'};
  color: ${(props) => (props.$active ? '#fff' : Theme.colors.secondary)};
  border: none;
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  border-radius: ${Theme.radius.medium};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(props) =>
      props.$active ? Theme.colors.primary : 'rgba(0,0,0,0.05)'};
  }

  @media (max-width: 700px) {
    width: 36px;
    height: 36px;
    flex-basis: 36px;
  }
`;

const Divider = styled.div`
  width: 1px;
  height: 24px;
  flex: 0 0 1px;
  background: ${Theme.colors.border};
`;

const ProgressBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  font-size: 13px;
  font-weight: 600;
  color: ${Theme.colors.primary};
  padding: 0 8px;

  @media (max-width: 700px) {
    display: none;
  }
`;

const ExportButton = styled(UIButton)`
  height: 40px;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;

  @media (max-width: 700px) {
    width: 40px;
    height: 36px;
    padding: 0;
    justify-content: center;

    span {
      display: none;
    }
  }
`;

const ContinueButton = styled(UIButton)`
  height: 40px;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;

  @media (max-width: 700px) {
    height: 36px;
    padding: 0 12px;
    font-size: 13px;
  }
`;

const StatusMessage = styled.div<{ $error?: boolean }>`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  max-width: 360px;
  padding: 8px 12px;
  border-radius: ${Theme.radius.small};
  background: ${(props) => (props.$error ? '#fff1f0' : '#effaf2')};
  color: ${(props) => (props.$error ? Theme.colors.danger : '#187a35')};
  border: 1px solid
    ${(props) => (props.$error ? 'rgba(255,59,48,.25)' : 'rgba(52,199,89,.25)')};
  font-size: 12px;
  box-shadow: ${Theme.shadows.soft};
`;

const TOOLS: Array<{
  type: FieldType;
  label: string;
  icon: React.ReactNode;
}> = [
  { type: 'text', label: '文字欄位', icon: <Type size={20} /> },
  { type: 'date', label: '日期欄位', icon: <Calendar size={20} /> },
  {
    type: 'handwrittenSignature',
    label: '手寫簽名欄位',
    icon: <PenLine size={20} />,
  },
  {
    type: 'certificateSignature',
    label: '憑證簽章預留欄位',
    icon: <ShieldCheck size={20} />,
  },
];

interface DesignerToolbarProps {
  /** Present only for the guided Start workflow. */
  onContinueToSigner?: (templateFile: File) => Promise<void>;
  isTransitioning?: boolean;
}

export const DesignerToolbar: React.FC<DesignerToolbarProps> = ({
  onContinueToSigner,
  isTransitioning = false,
}) => {
  const {
    activeTool,
    setActiveTool,
    file,
    fields,
    appMode,
    warnings,
    validationErrors,
  } = useDocument();
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<{
    message: string;
    error: boolean;
  } | null>(null);

  const requiredFields = fields.filter(
    (field) => field.required && field.type !== 'certificateSignature'
  );
  const filledRequiredFields = requiredFields.filter((field) =>
    Boolean(field.value?.trim())
  );
  const hasValidationErrors = Object.keys(validationErrors).length > 0;
  const isComplete = !hasValidationErrors;

  const confirmExistingSignatureChange = () => {
    const hasExistingSignature = warnings.some((warning) =>
      warning.toLowerCase().includes('digital signature')
    );
    return (
      !hasExistingSignature ||
      window.confirm(
        '這份 PDF 含有既有數位簽章。任何匯出變更都可能使簽章失效，仍要繼續嗎？'
      )
    );
  };

  const generatePdf = async (): Promise<Uint8Array | null> => {
    if (!file || !appMode) return null;
    if (!confirmExistingSignatureChange()) return null;

    return PdfExportService.export(file, fields, appMode);
  };

  const handleExportPdf = async () => {
    if (!file || !appMode) return;

    setIsExporting(true);
    setExportStatus(null);
    try {
      const bytes = await generatePdf();
      if (!bytes) return;
      const blob = new Blob([bytes.slice().buffer as ArrayBuffer], {
        type: 'application/pdf',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const prefix = appMode === 'designer' ? 'template' : 'filled';
      link.href = url;
      link.download = `${prefix}-${file.name.replace(/\.pdf$/i, '')}.pdf`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
      setExportStatus({
        message:
          appMode === 'designer'
            ? 'AcroForm 範本已匯出，欄位仍可編輯。'
            : '已填寫 PDF 已匯出，欄位仍可編輯。',
        error: false,
      });
    } catch (error) {
      setExportStatus({
        message:
          error instanceof Error ? error.message : 'PDF 匯出失敗，請再試一次。',
        error: true,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleContinueToSigner = async () => {
    if (!file || !onContinueToSigner) return;

    setIsExporting(true);
    setExportStatus(null);
    try {
      const bytes = await generatePdf();
      if (!bytes) return;
      const templateFile = new File(
        [bytes.slice().buffer as ArrayBuffer],
        `template-${file.name.replace(/\.pdf$/i, '')}.pdf`,
        { type: 'application/pdf' }
      );
      await onContinueToSigner(templateFile);
    } catch (error) {
      setExportStatus({
        message:
          error instanceof Error
            ? error.message
            : '無法帶入簽名階段，請再試一次。',
        error: true,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const isGuidedDesigner =
    appMode === 'designer' && Boolean(onContinueToSigner);
  const isBusy = isExporting || isTransitioning;

  return (
    <ToolbarContainer aria-label="PDF 編輯工具列">
      {appMode === 'designer' && (
        <>
          <ToolButton
            $active={activeTool === 'select'}
            onClick={() => setActiveTool('select')}
            aria-label="選取工具"
            title="選取工具"
          >
            <MousePointer2 size={20} />
          </ToolButton>
          <Divider />
          {TOOLS.map((tool) => (
            <ToolButton
              key={tool.type}
              $active={activeTool === tool.type}
              onClick={() => setActiveTool(tool.type)}
              aria-label={tool.label}
              title={`${tool.label}：選擇後點擊頁面放置`}
            >
              {tool.icon}
            </ToolButton>
          ))}
          <Divider />
        </>
      )}

      {appMode === 'signer' && requiredFields.length > 0 && (
        <>
          <ProgressBadge>
            {isComplete && (
              <CheckCircle2 size={16} color={Theme.colors.success} />
            )}
            {filledRequiredFields.length} / {requiredFields.length} 個必填欄位
          </ProgressBadge>
          <Divider />
        </>
      )}

      {isGuidedDesigner ? (
        <>
          <ExportButton
            onClick={handleExportPdf}
            disabled={isBusy}
            title="下載可編輯的 AcroForm 範本 PDF"
          >
            <Download size={18} />
            <span>下載範本 PDF</span>
          </ExportButton>
          <ContinueButton
            $primary
            onClick={handleContinueToSigner}
            disabled={isBusy}
            title="將目前設計匯出為 AcroForm PDF 並帶入簽名階段"
          >
            {isBusy ? (
              <LoaderCircle size={18} className="spin" />
            ) : (
              <ArrowRight size={18} />
            )}
            <span>下一步</span>
          </ContinueButton>
        </>
      ) : (
        <ExportButton
          $primary
          onClick={handleExportPdf}
          disabled={isBusy || (appMode === 'signer' && !isComplete)}
          title={
            appMode === 'signer' && !isComplete
              ? '請先修正所有必填欄位'
              : undefined
          }
        >
          {isExporting ? (
            <LoaderCircle size={18} className="spin" />
          ) : appMode === 'designer' ? (
            <FileSignature size={18} />
          ) : (
            <Download size={18} />
          )}
          <span>{appMode === 'designer' ? '匯出範本 PDF' : '完成並匯出'}</span>
        </ExportButton>
      )}

      {exportStatus && (
        <StatusMessage $error={exportStatus.error} role="status">
          {exportStatus.message}
        </StatusMessage>
      )}
    </ToolbarContainer>
  );
};
