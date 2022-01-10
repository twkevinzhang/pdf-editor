import React, { CSSProperties, ReactNode, useEffect, useState } from 'react';
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
import { Image } from './Image';
import { scaleTo } from '../utils/helpers';
import { createPortal } from 'react-dom';

interface Props {
  placements: Placement[];
  attachments: Attachment[];
  pageDimensions: Dimensions;
  removeAttachment: (id: string) => void;
  updateAttachment: (id: string, attachment: Partial<Attachment>) => void;
  scale?:number;
}

export const Attachments: React.FC<Props> = (
  {
    placements,
  attachments,
  pageDimensions,
    removeAttachment,
  updateAttachment,
    scale,
}) => {
  const [initialWindowScroll, setInitialWindowScroll] = useState(defaultCoordinates);
  const [draggingAttach, setDraggingAttach] = useState<Attachment | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<ReactNode | null>(null);

  useEffect(()=>{
      if(draggingId){
        const attachment = attachments.find(a=> a.id === draggingId) || null
        let snapshot : ReactNode = null
        if(attachment?.type === AttachmentTypes.TEXT){
          snapshot = <Text {...attachment as TextAttachment} />
        }else if(attachment?.type === AttachmentTypes.IMAGE) {
          snapshot = <Image {...attachment as ImageAttachment} />
        }
        setDraggingAttach(attachment)
        setSnapshot(snapshot)
      }
    }
    , [draggingId])

  const handleAttachmentUpdate = (id: string) => (
    attachment: Partial<Attachment>
  ) => updateAttachment(id, attachment );

  function getAttachmentJsx(attachment: Attachment, key?: string,){
    if (attachment.type === AttachmentTypes.IMAGE) {
      return (
        <DraggableImage
          key={key}
          hidden={draggingId === attachment.id}
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
          hidden={draggingId === attachment.id}
          pageWidth={pageDimensions.width}
          pageHeight={pageDimensions.height}
          removeText={() => removeAttachment(attachment.id)}
          updateTextAttachment={handleAttachmentUpdate(attachment.id)}
          {...(attachment as TextAttachment)}
        />
      )
    }
  }

  return (
    <DndContext
      onDragStart={event => {
        setDraggingId(event.active.id)
        setInitialWindowScroll({
          x: window.scrollX,
          y: window.scrollY,
        });
      }}
      onDragEnd={event => {
        let updated= {}
        if(event.over){
          const coverId = event.over.id
          const placement= placements.find(p=> p.id === coverId)!
          updated = {
            x: placement.x * (scale || 1),
            y: placement.y * (scale || 1),
            column_id: coverId,
          }
        }else{
          updated = {
            x: event.delta.x + (draggingAttach?.x || 0)  - initialWindowScroll.x,
            y: event.delta.y + (draggingAttach?.y || 0)  - initialWindowScroll.y,
            column_id: null,
          }
        }
        updateAttachment(event.active.id, updated)
        setDraggingId('')
      }}
      onDragCancel={() => setDraggingId('')}
    >
      <Placements
        placements={placements}
        attachments={attachments}
        scale={scale}
      />

      {attachments.map(a => {
        const key = a.id;
        return getAttachmentJsx(a, key)
      })}

      {createPortal(
        <DragOverlay>
          {snapshot}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  )
};
