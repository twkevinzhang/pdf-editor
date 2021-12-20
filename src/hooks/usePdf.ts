import { useState, useCallback } from 'react';
import { save } from '../utils/pdf';

export interface Pdf {
  name: string;
  file: File;
  pages: Promise<any>[];
}

export const usePdf = () => {
  const [name, setName] = useState('');
  const [pageIndex, setPageIndex] = useState(-1);
  const [dimensions, setDimensions] = useState<Dimensions>();
  const [file, setFile] = useState<File>();
  const [pages, setPages] = useState<any>([]);
  const [isMultiPage, setIsMultiPage] = useState(false);
  const [isFirstPage, setIsFirstPage] = useState(false);
  const [isLastPage, setIsLastPage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const setDimensionsHandler = useCallback(setDimensions, [setDimensions]);

  return {
    isMultiPage,
    isFirstPage,
    isLastPage,
    isSaving,
    currentPage: pages[pageIndex],
    dimensions,
    setDimensions: setDimensionsHandler,
    name,
    setName,
    pageIndex,
    setPageIndex,
    file,
    setFile,
    pages,
    nextPage: () => {
      const newPageIndex = pageIndex + 1;
      setPageIndex(pageIndex + 1);
      setIsFirstPage(newPageIndex === 0);
      setIsLastPage(newPageIndex === pages.length - 1);
    },
    savePdf: async (attachments: Attachments[]) => {
      if (isSaving || !file) return;

      setIsSaving(true);

      try {
        await save(file, attachments, name);
      } catch (e) {
        console.log(e);
      } finally {
        setIsSaving(false);
      }
    },
    setPdf: ({ name, file, pages: _pages }: Pdf) => {
      const multi = _pages.length > 1;
      setName(name);
      setFile(file);
      setPages(_pages);
      setPageIndex(0);
      setIsMultiPage(multi);
      setIsFirstPage(true);
      setIsLastPage(_pages.length === 1);
    },
    previousPage: () => {
      const newPageIndex = pageIndex - 1;
      setPageIndex(newPageIndex);
      setIsFirstPage(newPageIndex === 0);
      setIsLastPage(newPageIndex === pages.length - 1);
    },
  };
};
