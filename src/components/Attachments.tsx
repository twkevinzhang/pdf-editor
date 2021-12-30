import React, { ReactNode, useEffect, useState } from 'react';
import { AttachmentTypes } from '../entities';
import { DraggableText } from '../containers/DraggableText';
import { DraggableImage } from '../containers/DraggableImage';
import {
  defaultCoordinates,
  DndContext, DragOverlay,
  KeyboardSensor, Modifiers,
  MouseSensor, PointerActivationConstraint,
  TouchSensor,
  Translate,
  useSensor, useSensors,
} from '@dnd-kit/core';
import { DragEndEvent } from '@dnd-kit/core/dist/types';
import { Droppable } from '../containers/Droppable';
import { Text } from './Text';
import { Placements } from './Placements';

interface Props {
  placements: Placement[];
  attachments: Attachment[];
  pageDimensions: Dimensions;
  removeAttachment: (id: string) => void;
  updateAttachment: (id: string, attachment: Partial<Attachment>) => void;
}

export const Attachments: React.FC<Props> = (
  {
    placements,
  attachments,
  pageDimensions,
    removeAttachment,
  updateAttachment,
}) => {
  const [initialWindowScroll, setInitialWindowScroll] = useState(defaultCoordinates);
  const [dragging, setDragging] = useState<string>('');

  const handleAttachmentUpdate = (id: string) => (
    attachment: Partial<Attachment>
  ) => updateAttachment(id, attachment );

  function getAttachmentJsx(attachment: Attachment, key?: string,){
    if (attachment.type === AttachmentTypes.IMAGE) {
      return (
        <DraggableImage
          key={key}
          pageWidth={pageDimensions.width}
          pageHeight={pageDimensions.height}
          removeImage={() => removeAttachment(attachment.id)}
          updateImageAttachment={handleAttachmentUpdate(attachment.id)}
          {...(attachment as ImageAttachment)}
        />
      );
    }else{
      return (
        <DraggableText
          key={key}
          translate={{x: attachment.x, y: attachment.y}}
          pageWidth={pageDimensions.width}
          pageHeight={pageDimensions.height}
          removeText={() => removeAttachment(attachment.id)}
          updateTextAttachment={handleAttachmentUpdate(attachment.id)}
          {...(attachment as TextAttachment)}
        />
      )
    }
  }

  function getAttachmentsJsx(attachments: Attachment[]) {
    const result = attachments.map(a => {
      const key = a.id;
      return getAttachmentJsx(a, key)
    })

    if(!result.length){
      return null
    }else{
      return result
    }
  }

  let snapshot : ReactNode = null
  let attachment: Attachment | null = null
  if(dragging.length){
    attachment = attachments.find(a=> a.id === dragging) || null
    if(attachment as TextAttachment){
      snapshot = <Text dragging={true} {...attachment} />
    }else if(attachment as ImageAttachment) {

    }
  }
  return (
    <DndContext
      onDragStart={event => {
        setDragging(event.active.id)
        setInitialWindowScroll({
          x: window.scrollX,
          y: window.scrollY,
        });
      }}
      onDragEnd={event => {
        updateAttachment(event.active.id, {
          x: event.delta.x + (attachment?.x || 0)  - initialWindowScroll.x,
          y: event.delta.y + (attachment?.y || 0)  - initialWindowScroll.y,
          column_id: event.over?.id
        })
        setDragging('')
        setInitialWindowScroll(defaultCoordinates);
      }}
      onDragCancel={() => setDragging('')}
    >

      {/* 有欄位的 */}
      <Placements
        placements={placements}
        attachments={attachments}
      />

      {/* 沒有欄位，只有絕對位置的 */}
      {getAttachmentsJsx(attachments)}

      <DragOverlay>
        {snapshot}
      </DragOverlay>
    </DndContext>
  )
};
