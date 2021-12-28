import React, { useState, createRef } from 'react';
import { readAsPDF, readAsDataURL, readAsImage } from '../utils/asyncReader';
import { Pdf } from './usePdf';
import { AttachmentTypes } from '../entities';

export const usePdfUploader = ({
  after,
}: {
  after?: (uploaded: Pdf) => void;
}) => {
  const [uploading, setUploading] = useState(false);
  const inputRef = createRef<HTMLInputElement>();

  return {
    inputRef,
    uploading,
    handleClick: () => {
      const input = inputRef.current;
      if (input) {
        input.value = '';
        setUploading(true);
        input.click();
      }
    },
    fileOnChange: async (
      event: React.ChangeEvent<HTMLInputElement> & {
        dataTransfer?: DataTransfer;
      }
    ) => {
      if (!uploading) {
        return;
      }

      const files: FileList | undefined =
        event.currentTarget.files ||
        (event.dataTransfer && event.dataTransfer.files);
      if (!files) {
        setUploading(false);
        return;
      }

      const file = files[0];
      const pdf = await handler(file);
      if (after) after(pdf);

      setUploading(false);

      async function handler(file: File): Promise<Pdf> {
        try {
          const pdf = await readAsPDF(file);
          return {
            file,
            name: file.name,
            pages: Array(pdf.numPages)
              .fill(0)
              .map((_, index) => pdf.getPage(index + 1)),
          } as Pdf;
        } catch (error) {
          console.log('Failed to load pdf', error);
          throw new Error('Failed to load PDF');
        }
      }
    },
  };
};
