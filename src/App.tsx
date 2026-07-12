import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import * as pdfjs from 'pdfjs-dist';
import {
  AlertTriangle,
  ArrowLeft,
  FileCheck2,
  FileUp,
  Layout,
  LoaderCircle,
  PenTool,
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
  gap: 36px;
  background: radial-gradient(
      circle at 50% 10%,
      rgba(0, 113, 227, 0.12),
      transparent 34%
    ),
    #f5f5f7;
`;

const ModeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 300px));
  gap: 24px;

  @media (max-width: 680px) {
    width: min(100%, 360px);
    grid-template-columns: 1fr;
  }
`;

const ModeCard = styled.button`
  appearance: none;
  background: white;
  padding: 36px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: ${Theme.radius.large};
  box-shadow: ${Theme.shadows.medium};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  color: inherit;

  &:hover,
  &:focus-visible {
    transform: translateY(-5px);
    box-shadow: 0 14px 34px rgba(0, 0, 0, 0.13);
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

const SignatureApp: React.FC = () => {
  const {
    pdfDocument,
    setFile,
    appMode,
    setAppMode,
    resetDocument,
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

  const pageScale = getPageScale(windowWidth, appMode);

  if (!appMode) {
    return (
      <HomeContainer>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(38px, 7vw, 56px)', margin: 0 }}>
            PDF AcroForm
          </h1>
          <p style={{ color: Theme.colors.secondary, fontSize: 17 }}>
            以單一 PDF 建立、填寫並保存可編輯表單欄位
          </p>
        </div>
        <ModeGrid>
          <ModeCard onClick={() => setAppMode('designer')}>
            <Layout size={58} color={Theme.colors.primary} />
            <div>
              <h2 style={{ fontSize: 23, margin: '0 0 8px' }}>Designer</h2>
              <p style={{ color: Theme.colors.secondary, margin: 0 }}>
                在 PDF 中配置 AcroForm 欄位
              </p>
            </div>
          </ModeCard>
          <ModeCard onClick={() => setAppMode('signer')}>
            <PenTool size={58} color={Theme.colors.success} />
            <div>
              <h2 style={{ fontSize: 23, margin: '0 0 8px' }}>Signer</h2>
              <p style={{ color: Theme.colors.secondary, margin: 0 }}>
                直接讀取並填寫 PDF 內的欄位
              </p>
            </div>
          </ModeCard>
        </ModeGrid>
      </HomeContainer>
    );
  }

  const isReady = status === 'ready' && Boolean(pdfDocument);
  const modeLabel = appMode === 'designer' ? 'Designer' : 'Signer';

  return (
    <MainLayout>
      <BackButton onClick={resetDocument} aria-label={`離開 ${modeLabel}`}>
        <ArrowLeft size={18} /> <span>離開 {modeLabel}</span>
      </BackButton>

      {!isReady ? (
        <UploadScreen>
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

          <UploadPlaceholder $loading={status === 'loading'}>
            <input
              type="file"
              hidden
              disabled={status === 'loading'}
              accept="application/pdf,.pdf"
              onChange={handleFileChange}
            />
            {status === 'loading' ? (
              <SpinningLoader size={48} color={Theme.colors.primary} />
            ) : (
              <FileUp size={48} color={Theme.colors.primary} />
            )}
            <div>
              <div style={{ fontSize: 18, fontWeight: 650, color: '#1d1d1f' }}>
                {status === 'loading'
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
            <DesignerToolbar />
            <DocumentBadge>
              <FileCheck2 size={16} />
              <span>
                {file?.name} · {pdfDocument?.numPages} 頁 · {fields.length}{' '}
                個支援欄位
              </span>
            </DocumentBadge>

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
