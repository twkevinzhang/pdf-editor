import React, { useState, createRef } from 'react';
import { readAsPDF, readAsDataURL, readAsImage } from '../utils/asyncReader';
import { ggID } from '../utils/helpers';
import { Pdf } from './usePdf';
import { AttachmentTypes } from '../entities';

type ActionEvent<T> = React.TouchEvent<T> | React.MouseEvent<T>;

export enum UploadTypes {
  PDF = 'pdf',
  IMAGE = 'image',
}

/**
 * @function useUploader
 *
 * @description This hook handles pdf and image uploads
 *
 * @
 * @param use UploadTypes
 */
export const usePdfUploader = ({
  afterUploadPdf,
}: {
  afterUploadPdf?: (upload: Pdf) => void;
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = createRef<HTMLInputElement>();

  const onClick = (event: ActionEvent<HTMLInputElement>) => {
    event.currentTarget.value = '';
  };

  const handleClick = () => {
    const input = inputRef.current;

    if (input) {
      setIsUploading(true);
      input.click();
    }
  };

  const upload = async (
    event: React.ChangeEvent<HTMLInputElement> & { dataTransfer?: DataTransfer }
  ) => {
    if (!isUploading) {
      return;
    }

    const files: FileList | undefined =
      event.currentTarget.files ||
      (event.dataTransfer && event.dataTransfer.files);
    if (!files) {
      setIsUploading(false);
      return;
    }

    const file = files[0];

    const result = await handler(file);

    if (afterUploadPdf) {
      afterUploadPdf(result as Pdf);
    }

    setIsUploading(false);

    async function handler(file: File) {
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

    return;
  };

  return {
    upload,
    onClick,
    inputRef,
    isUploading,
    handleClick,
  };
};
