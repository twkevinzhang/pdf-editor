import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { FileText, Layers } from 'lucide-react';
import { Theme } from '../../styles/DesignSystem';
import { useDocument } from '../../application/DocumentStore';

const SidebarContainer = styled.aside<{ $signer: boolean }>`
  width: 220px;
  flex: 0 0 220px;
  background: rgba(255, 255, 255, 0.86);
  backdrop-filter: blur(20px);
  border-right: 1px solid ${Theme.colors.border};
  display: flex;
  flex-direction: column;
  padding: 24px 0;
  overflow-y: auto;

  @media (max-width: 980px) {
    ${(props) =>
      props.$signer ? 'display: none;' : 'width: 190px; flex-basis: 190px;'}
  }

  @media (max-width: 760px) {
    display: none;
  }
`;

const SidebarTitle = styled.div`
  padding: 0 22px;
  font-size: 19px;
  font-weight: 750;
  margin-bottom: 24px;
  color: #1d1d1f;
`;

const SectionHeader = styled.div`
  padding: 0 22px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${Theme.colors.secondary};
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 14px;
`;

const ThumbnailContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 0 22px;
`;

const ThumbnailItem = styled.button<{ $active?: boolean }>`
  width: 100%;
  aspect-ratio: 1 / 1.4;
  padding: 0;
  background: #fff;
  border-radius: ${Theme.radius.small};
  border: 2px solid
    ${(props) => (props.$active ? Theme.colors.primary : Theme.colors.border)};
  cursor: pointer;
  overflow: hidden;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;

  &:hover,
  &:focus-visible {
    border-color: ${Theme.colors.primary};
  }
`;

const PageNumber = styled.div`
  position: absolute;
  bottom: 8px;
  right: 8px;
  font-size: 10px;
  font-weight: 600;
  color: ${Theme.colors.secondary};
  background: rgba(255, 255, 255, 0.88);
  padding: 2px 6px;
  border-radius: 4px;
`;

const FieldCount = styled.div`
  margin: 22px;
  padding: 12px;
  border-radius: ${Theme.radius.medium};
  background: #f5f5f7;
  color: ${Theme.colors.secondary};
  font-size: 12px;
  line-height: 1.5;
  display: flex;
  gap: 8px;
`;

export const Sidebar: React.FC = () => {
  const { pdfDocument, fields, appMode } = useDocument();
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [activePage, setActivePage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    const generateThumbnails = async () => {
      if (!pdfDocument) return;
      const images: string[] = [];
      for (
        let pageNumber = 1;
        pageNumber <= pdfDocument.numPages;
        pageNumber += 1
      ) {
        if (cancelled) return;
        const page = await pdfDocument.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 0.2 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const context = canvas.getContext('2d');
        if (!context) continue;
        await page.render({ canvasContext: context, viewport, canvas }).promise;
        images.push(canvas.toDataURL());
        if (!cancelled) setThumbnails([...images]);
      }
    };
    void generateThumbnails();
    return () => {
      cancelled = true;
    };
  }, [pdfDocument]);

  const goToPage = (pageNumber: number) => {
    setActivePage(pageNumber);
    document
      .getElementById(`pdf-page-${pageNumber}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <SidebarContainer $signer={appMode === 'signer'}>
      <SidebarTitle>PDF AcroForm</SidebarTitle>
      <SectionHeader>
        <Layers size={14} /> 頁面
      </SectionHeader>

      <ThumbnailContainer>
        {thumbnails.map((url, index) => (
          <ThumbnailItem
            type="button"
            key={index}
            $active={index + 1 === activePage}
            onClick={() => goToPage(index + 1)}
            aria-label={`前往第 ${index + 1} 頁`}
          >
            <img
              src={url}
              alt={`第 ${index + 1} 頁縮圖`}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <PageNumber>{index + 1}</PageNumber>
          </ThumbnailItem>
        ))}
      </ThumbnailContainer>

      <FieldCount>
        <FileText size={16} />
        <span>
          {fields.length} 個可辨識欄位
          <br />
          {fields.filter((field) => field.source === 'external').length}{' '}
          個外部欄位已保留
        </span>
      </FieldCount>
    </SidebarContainer>
  );
};
