import React, { useEffect } from 'react';
import { AttachmentTypes } from '../entities';
import { DraggableText } from '../containers/DraggableText';
import { DraggableImage } from '../containers/DraggableImage';

interface Props {
  attachments: Attachment[];
  pdfName: string;
  pageDimensions: Dimensions;
  removeAttachment: (id: string) => void;
  updateAttachment: (index: number, attachment: Partial<Attachment>) => void;
}

export const Attachments: React.FC<Props> = ({
  attachments,
  pdfName,
  pageDimensions,
  removeAttachment,
  updateAttachment,
}) => {
  const handleAttachmentUpdate = (index: number) => (
    attachment: Partial<Attachment>
  ) => updateAttachment(index, attachment);

  return (<>
      {attachments?.map((attachment, index) => {
        const key = attachment.id;

        if (attachment.type === AttachmentTypes.IMAGE) {
          return (
            <DraggableImage
              key={key}
              pageWidth={pageDimensions.width}
              pageHeight={pageDimensions.height}
              removeImage={() => removeAttachment(attachment.id)}
              updateImageAttachment={handleAttachmentUpdate(index)}
              {...(attachment as ImageAttachment)}
            />
          );
        }else{
          return (
            <DraggableText
              key={key}
              pageWidth={pageDimensions.width}
              pageHeight={pageDimensions.height}
              removeText={() => removeAttachment(attachment.id)}
              updateTextAttachment={handleAttachmentUpdate(index)}
              {...(attachment as TextAttachment)}
            />
          )
        }
      })}
    </>)
};
