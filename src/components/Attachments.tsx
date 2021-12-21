import React, { useEffect } from 'react';
import { AttachmentTypes } from '../entities';
import { Text } from '../containers/Text';
import { useDrag } from '../hooks/useDrag';

interface Props {
  attachments: Attachment[];
  pdfName: string;
  pageDimensions: Dimensions;
  removeAttachment: (index: number) => void;
  updateAttachment: (index: number, attachment: Partial<Attachment>) => void;
}

export const Attachments: React.FC<Props> = ({
  attachments,
  pdfName,
  pageDimensions,
  removeAttachment,
  updateAttachment,
}) => {
  console.warn("render Attachments")

  const handleAttachmentUpdate = (index: number) => (
    attachment: Partial<Attachment>
  ) => updateAttachment(index, attachment);

  return (<>
      {attachments?.map((attachment, index) => {
        const key = `${pdfName}-${index}`;
        console.log(attachment)

        return (
          <Text
            key={key}
            x={attachment.x}
            y={attachment.y}
            width={attachment.width}
            height={attachment.height}
            pageWidth={pageDimensions.width}
            pageHeight={pageDimensions.height}
            updateTextAttachment={handleAttachmentUpdate(index)}
            {...(attachment as TextAttachment)}
          />
        );
      })}
    </>)
};
