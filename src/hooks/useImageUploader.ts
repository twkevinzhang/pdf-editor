import React, { useState, createRef } from 'react';
import { readAsPDF, readAsDataURL, readAsImage } from '../utils/asyncReader';
import { ggID } from '../utils/helpers';
import { Pdf } from './usePdf';
import { AttachmentTypes } from '../entities';

export const useImageUploader = ({
  afterUploadAttachment,
}: {
  afterUploadAttachment?: (upload: Attachment) => void;
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

      const result = await handler(file);

      if (afterUploadAttachment) {
        console.log('===> was this also called');
        afterUploadAttachment(result as ImageAttachment);
      }
      setUploading(false);

      async function handler(file: File): Promise<ImageAttachment> {
        try {
          const url = await readAsDataURL(file);
          const img = await readAsImage(url as string);
          const id = ggID();
          const { width, height } = img;

          const imageAttachemnt: ImageAttachment = {
            id,
            type: AttachmentTypes.IMAGE,
            width,
            height,
            x: 0,
            y: 0,
            img,
            file,
          };
          return imageAttachemnt;
        } catch (error) {
          console.log('Failed to load image', error);
          throw new Error('Failed to load image');
        }
      }
    },
  };
};
