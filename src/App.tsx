import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import * as pdfjs from 'pdfjs-dist';
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Circle,
  FileCheck2,
  FileUp,
  Layout,
  LoaderCircle,
  PenTool,
  Play,
  RotateCcw,
} from 'lucide-react';
import { DocumentProvider, useDocument } from './application/DocumentStore';
import { CanvasArea, MainLayout, Theme } from './styles/DesignSystem';
import { DesignerToolbar } from './components/Designer/Toolbar';
import { PDFPage } from './components/Designer/PDFPage';
import { Inspector } from './components/Designer/Inspector';
import { Sidebar } from './components/Designer/Sidebar';

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const SpinningLoader = styled(LoaderCircle)`
  animation: ${spin} 1s linear infinite;
`;

const HomeContainer = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  box-sizing: border-box;
  padding: 32px;
  gap: 30px;
  overflow: hidden;
  background: radial-gradient(
      circle at 50% 0%,
      rgba(0, 113, 227, 0.15),
      transparent 33%
    ),
    linear-gradient(145deg, #f8f9fc 0%, #f3f5f9 56%, #eef2f8 100%);
`;

const Hero = styled.div`
  width: min(100%, 640px);
  text-align: center;
`;

const Eyebrow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 11px;
  border-radius: 999px;
  background: rgba(0, 113, 227, 0.09);
  color: #0067cc;
  font-size: 12px;
  font-weight: 760;
  letter-spacing: 0.05em;
  text-transform: uppercase;
`;

const StartButton = styled.button`
  width: min(100%, 460px);
  min-height: 82px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-top: 26px;
  border: 0;
  border-radius: 24px;
  background: linear-gradient(135deg, #0078ee, #005fc2);
  color: white;
  box-shadow: 0 16px 36px rgba(0, 96, 194, 0.26);
  cursor: pointer;
  font-size: clamp(23px, 4vw, 29px);
  font-weight: 760;
  letter-spacing: -0.02em;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover,
  &:focus-visible {
    transform: translateY(-3px);
    box-shadow: 0 22px 42px rgba(0, 96, 194, 0.32);
    outline: none;
  }

  @media (max-width: 680px) {
    width: 100%;
    min-height: 66px;
    border-radius: 19px;
  }
`;

const ShortcutSection = styled.section`
  width: min(100%, 460px);
  padding-top: 4px;
  text-align: center;
`;

const ShortcutLabel = styled.div`
  margin-bottom: 11px;
  color: ${Theme.colors.secondary};
  font-size: 12px;
  font-weight: 650;
`;

const ShortcutActions = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;

  @media (max-width: 460px) {
    flex-direction: column;
  }
`;

const ShortcutButton = styled.button`
  flex: 1;
  min-height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 10px 14px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.68);
  color: #54575d;
  cursor: pointer;
  font-size: 14px;
  font-weight: 650;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;

  &:hover,
  &:focus-visible {
    border-color: rgba(0, 113, 227, 0.34);
    background: white;
    color: ${Theme.colors.primary};
    outline: none;
  }
`;

const UploadScreen = styled.main`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  box-sizing: border-box;
  padding: 96px 24px 32px;
  gap: 24px;
  text-align: center;
`;

const UploadPlaceholder = styled.label<{ $loading: boolean }>`
  width: min(520px, calc(100vw - 48px));
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 52px 36px;
  border: 2px dashed ${Theme.colors.border};
  border-radius: ${Theme.radius.large};
  cursor: ${(props) => (props.$loading ? 'wait' : 'pointer')};
  transition: all 0.25s;
  color: ${Theme.colors.secondary};
  background: white;
  box-shadow: ${Theme.shadows.soft};

  &:hover {
    border-color: ${Theme.colors.primary};
    background: rgba(0, 113, 227, 0.025);
  }
`;

const BackButton = styled.button`
  position: fixed;
  top: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid ${Theme.colors.border};
  padding: 9px 14px;
  border-radius: ${Theme.radius.medium};
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  z-index: 1100;
  font-weight: 650;
  box-shadow: ${Theme.shadows.soft};

  &:hover {
    background: #fff;
  }

  @media (max-width: 980px) {
    top: 16px;
    left: 14px;
    width: 42px;
    height: 42px;
    padding: 0;
    justify-content: center;

    span {
      display: none;
    }
  }

  @media (max-width: 700px) {
    top: 12px;
    left: 10px;
    width: 36px;
    height: 36px;
  }
`;

const MessagePanel = styled.div<{ $error?: boolean }>`
  width: min(620px, calc(100vw - 48px));
  box-sizing: border-box;
  padding: 13px 15px;
  border-radius: ${Theme.radius.medium};
  border: 1px solid
    ${(props) => (props.$error ? 'rgba(255,59,48,.3)' : 'rgba(255,159,10,.35)')};
  color: ${(props) => (props.$error ? '#9e1c16' : '#7a4b00')};
  background: ${(props) => (props.$error ? '#fff2f1' : '#fff8e8')};
  font-size: 13px;
  line-height: 1.55;
  text-align: left;
`;

const WorkspaceNotice = styled(MessagePanel)`
  margin-bottom: 20px;
  width: min(760px, 100%);
`;

const DocumentBadge = styled.div`
  max-width: 760px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${Theme.colors.secondary};
  font-size: 13px;
`;

const WorkflowProgress = styled.ol`
  width: min(100%, 760px);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  margin: 0 0 20px;
  padding: 0;
  list-style: none;

  @media (max-width: 700px) {
    gap: 8px;
    margin-bottom: 14px;
  }
`;

const WorkflowStep = styled.li<{ $active: boolean; $complete: boolean }>`
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 13px;
  border-radius: 14px;
  background: ${(props) =>
    props.$active || props.$complete
      ? 'rgba(0, 113, 227, 0.1)'
      : 'rgba(255,255,255,.58)'};
  color: ${(props) =>
    props.$active || props.$complete ? '#005ebf' : Theme.colors.secondary};
  font-size: 13px;
  font-weight: ${(props) => (props.$active ? 760 : 620)};
  box-shadow: inset 0 0 0 1px
    ${(props) =>
      props.$active || props.$complete
        ? 'rgba(0,113,227,.16)'
        : 'rgba(0,0,0,.06)'};

  @media (max-width: 700px) {
    padding: 9px 10px;
    font-size: 12px;
  }
`;

const StepMark = styled.span<{ $active: boolean; $complete: boolean }>`
  width: 23px;
  height: 23px;
  flex: 0 0 23px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: ${(props) =>
    props.$active || props.$complete ? Theme.colors.primary : 'transparent'};
  color: ${(props) =>
    props.$active || props.$complete ? '#fff' : Theme.colors.secondary};
  border: 1px solid
    ${(props) =>
      props.$active || props.$complete
        ? Theme.colors.primary
        : Theme.colors.border};
  font-size: 12px;
`;

const SignatureApp: React.FC = () => {
  const {
    pdfDocument,
    setFile,
    appMode,
    entryMode,
    workflowStep,
    isTransitioning,
    startWorkflow,
    enterShortcut,
    handoffToSigner,
    returnToDesigner,
    restartWorkflow,
    status,
    error,
    warnings,
    fields,
    file,
  } = useDocument();
  const [pages, setPages] = useState<pdfjs.PDFPageProxy[]>([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadPages = async () => {
      if (!pdfDocument) {
        setPages([]);
        return;
      }
      const loadedPages: pdfjs.PDFPageProxy[] = [];
      for (
        let pageNumber = 1;
        pageNumber <= pdfDocument.numPages;
        pageNumber += 1
      ) {
        const page = await pdfDocument.getPage(pageNumber);
        if (cancelled) return;
        loadedPages.push(page);
      }
      setPages(loadedPages);
    };
    void loadPages();
    return () => {
      cancelled = true;
    };
  }, [pdfDocument]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) void setFile(selectedFile);
    event.target.value = '';
  };

  const handleReturnToDesigner = () => {
    void returnToDesigner();
  };

  const handleHandoffToSigner = async (templateFile: File) => {
    await handoffToSigner(templateFile);
  };

  const isGuided = entryMode === 'guided';
  const pageScale = getPageScale(windowWidth, appMode);

  if (!appMode) {
    return (
      <HomeContainer>
        <Hero>
          <Eyebrow>
            <Circle size={8} fill="currentColor" /> Guided PDF workflow
          </Eyebrow>
          <h1
            style={{
              fontSize: 'clamp(42px, 7vw, 62px)',
              margin: '18px 0 12px',
            }}
          >
            PDF AcroForm
          </h1>
          <p style={{ color: Theme.colors.secondary, fontSize: 17, margin: 0 }}>
            先設計，再簽名。全程只使用同一份可編輯 PDF。
          </p>
          <StartButton
            onClick={startWorkflow}
            aria-label="Start：開始設計與簽名流程"
          >
            Start <Play size={24} fill="currentColor" />
          </StartButton>
        </Hero>

        <ShortcutSection aria-label="快速入口">
          <ShortcutLabel>已有明確工作？可直接進入單一步驟。</ShortcutLabel>
          <ShortcutActions>
            <ShortcutButton onClick={() => enterShortcut('designer')}>
              <Layout size={17} /> 只設計
            </ShortcutButton>
            <ShortcutButton onClick={() => enterShortcut('signer')}>
              <PenTool size={17} /> 直接簽名
            </ShortcutButton>
          </ShortcutActions>
        </ShortcutSection>
      </HomeContainer>
    );
  }

  const isReady = status === 'ready' && Boolean(pdfDocument);
  const modeLabel = appMode === 'designer' ? 'Designer' : 'Signer';
  const isReturningToDesigner = isGuided && appMode === 'signer';

  return (
    <MainLayout>
      <BackButton
        onClick={
          isReturningToDesigner ? handleReturnToDesigner : restartWorkflow
        }
        disabled={isTransitioning}
        aria-label={isReturningToDesigner ? '返回設計階段' : '重新開始流程'}
      >
        {isReturningToDesigner ? (
          <ArrowLeft size={18} />
        ) : (
          <RotateCcw size={17} />
        )}
        <span>{isReturningToDesigner ? '返回設計' : '重新開始'}</span>
      </BackButton>

      {!isReady ? (
        <UploadScreen>
          {isGuided && <WorkflowStepper step={workflowStep ?? appMode} />}
          <div>
            <h1 style={{ fontSize: 32, margin: '0 0 10px' }}>
              {appMode === 'designer'
                ? '上傳 PDF 開始設計'
                : '上傳 PDF 開始填寫'}
            </h1>
            <p style={{ color: Theme.colors.secondary, margin: 0 }}>
              {appMode === 'designer'
                ? '既有 AcroForm 會被讀取並保留；外部欄位在 Designer 中為唯讀。'
                : 'Signer 會直接讀取 PDF 內的 AcroForm，不需要 JSON 設定檔。'}
            </p>
          </div>

          <UploadPlaceholder $loading={status === 'loading' || isTransitioning}>
            <input
              type="file"
              hidden
              disabled={status === 'loading' || isTransitioning}
              accept="application/pdf,.pdf"
              onChange={handleFileChange}
            />
            {status === 'loading' || isTransitioning ? (
              <SpinningLoader size={48} color={Theme.colors.primary} />
            ) : (
              <FileUp size={48} color={Theme.colors.primary} />
            )}
            <div>
              <div style={{ fontSize: 18, fontWeight: 650, color: '#1d1d1f' }}>
                {isTransitioning
                  ? '正在帶入下一個階段…'
                  : status === 'loading'
                  ? '正在解析 PDF 與 AcroForm…'
                  : '選擇一份 PDF'}
              </div>
              <div style={{ fontSize: 13, marginTop: 6 }}>
                PDF 是唯一的欄位持久化與交換格式
              </div>
            </div>
          </UploadPlaceholder>

          {error && (
            <MessagePanel $error role="alert">
              <strong>無法載入文件：</strong> {error}
            </MessagePanel>
          )}
        </UploadScreen>
      ) : (
        <>
          <Sidebar />
          <CanvasArea>
            <DesignerToolbar
              onContinueToSigner={
                isGuided && appMode === 'designer'
                  ? handleHandoffToSigner
                  : undefined
              }
              isTransitioning={isTransitioning}
            />
            {isGuided && <WorkflowStepper step={workflowStep ?? appMode} />}
            <DocumentBadge>
              <FileCheck2 size={16} />
              <span>
                {file?.name} · {pdfDocument?.numPages} 頁 · {fields.length}{' '}
                個支援欄位
              </span>
            </DocumentBadge>

            {isTransitioning && (
              <WorkspaceNotice role="status">
                正在將設計好的 AcroForm PDF 帶入簽名階段…
              </WorkspaceNotice>
            )}

            {warnings.length > 0 && (
              <WorkspaceNotice role="status">
                <div style={{ display: 'flex', gap: 9 }}>
                  <AlertTriangle
                    size={17}
                    style={{ flex: '0 0 auto', marginTop: 2 }}
                  />
                  <div>
                    <strong>相容性提醒</strong>
                    <ul style={{ margin: '5px 0 0', paddingLeft: 18 }}>
                      {warnings.map((warning, index) => (
                        <li key={`${warning}-${index}`}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </WorkspaceNotice>
            )}

            {appMode === 'signer' && fields.length === 0 && (
              <WorkspaceNotice role="status">
                這份 PDF 沒有可辨識或支援的 AcroForm
                欄位，因此目前沒有可填寫內容。不支援的欄位仍會原樣保留。
              </WorkspaceNotice>
            )}

            <div style={{ width: '100%', maxWidth: 1000 }}>
              {pages.map((page) => (
                <PDFPage key={page.pageNumber} page={page} scale={pageScale} />
              ))}
            </div>
          </CanvasArea>
          <Inspector />
        </>
      )}
    </MainLayout>
  );
};

const WorkflowStepper: React.FC<{ step: 'designer' | 'signer' }> = ({
  step,
}) => {
  const designComplete = step === 'signer';
  return (
    <WorkflowProgress aria-label="設計與簽名流程">
      <WorkflowStep $active={step === 'designer'} $complete={designComplete}>
        <StepMark $active={step === 'designer'} $complete={designComplete}>
          {designComplete ? <Check size={14} strokeWidth={3} /> : '1'}
        </StepMark>
        <span aria-current={step === 'designer' ? 'step' : undefined}>
          設計階段
        </span>
      </WorkflowStep>
      <WorkflowStep $active={step === 'signer'} $complete={false}>
        <StepMark $active={step === 'signer'} $complete={false}>
          2
        </StepMark>
        <span aria-current={step === 'signer' ? 'step' : undefined}>
          簽名階段
        </span>
      </WorkflowStep>
    </WorkflowProgress>
  );
};

function getPageScale(
  width: number,
  mode: 'designer' | 'signer' | null
): number {
  if (width <= 480) return 0.5;
  if (width <= 700) return mode === 'signer' ? 0.58 : 0.62;
  if (width <= 980) return mode === 'signer' ? 0.84 : 0.65;
  if (width <= 1300) return 1;
  return 1.15;
}

export default function App() {
  return (
    <DocumentProvider>
      <SignatureApp />
    </DocumentProvider>
  );
}
