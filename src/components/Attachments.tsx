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

const IMAGE_WIDTH_MAX_SIZE = 90;
const IMAGE_HEIGHT_MAX_SIZE = 50;
export const Attachments: React.FC<Props> = (
  {
    placements,
  attachments,
  pageDimensions,
    removeAttachment,
  updateAttachment,
    scale=1,
}) => {
  const [initialWindowScroll, setInitialWindowScroll] = useState(defaultCoordinates);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const scaledAttachments: Attachment[] = attachments.map(a=>getScaledAttachment(a))
  const scaledPlacements: Placement[] = placements.map(p=>({
    ...p,
    width: p.width * scale,
    height: p.height * scale,
    x: p.x * scale,
    y: p.y * scale,
  }))

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 1,
    },
  });

  let snapshot: ReactNode = null
  if(draggingId) {
    const scaled = scaledAttachments.find(a => a.id === draggingId)!
    if (scaled.type === AttachmentTypes.TEXT) {
      snapshot = <Text {...scaled as TextAttachment} />
    } else if (scaled.type === AttachmentTypes.IMAGE) {
      snapshot = <Image {...scaled as ImageAttachment} />
    }
  }else{
    snapshot = null
  }

  const handleAttachmentUpdate = (id: string) => (
    attachment: Partial<Attachment>
  ) => updateAttachment(id, attachment);

  function resizeImage(newWidth: number, newHeight: number, attachmentId: string){
    handleAttachmentUpdate(attachmentId)({
      width: newWidth / scale,
      height: newHeight / scale,
    })
  }

  function getAttachmentJsx(attachment: Attachment, key?: string,){
    if (attachment.type === AttachmentTypes.IMAGE) {
      return (
        <DraggableImage
          key={key}
          hidden={draggingId === attachment.id}
          pageWidth={pageDimensions.width}
          pageHeight={pageDimensions.height}
          removeImage={() => removeAttachment(attachment.id)}
          // resizeImage={(w, h )=> resizeImage(w, h, attachment.id)}
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

  function getScaledAttachment(attachment: Attachment):Attachment{
    if(attachment.type === AttachmentTypes.TEXT){
      attachment= getScaledText(attachment as TextAttachment)
    }else if(attachment.type === AttachmentTypes.IMAGE){
      attachment= getScaledImage(attachment as ImageAttachment)
    }
    return attachment;
  }

  function getScaledText(attachment: TextAttachment): TextAttachment{
    return {
      ...attachment,
      x: attachment.x * scale,
      y: attachment.y * scale,
      width: attachment.width * scale,
      height: attachment.height * scale,
      size: attachment.size? attachment.size * scale : undefined,
    }
  }

  function getScaledImage(attachment: ImageAttachment): ImageAttachment{
    const { width, height } = scaleTo(
      attachment.width,
      attachment.height,
      IMAGE_WIDTH_MAX_SIZE,
      IMAGE_HEIGHT_MAX_SIZE
    )
    return {
      ...attachment,
      x: attachment.x * scale,
      y: attachment.y * scale,
      width: width * scale,
      height: height * scale,
    }
  }

  return (
    <DndContext
      sensors={[mouseSensor]}
      onDragStart={event => {
        setDraggingId(event.active.id)
        setInitialWindowScroll({
          x: window.scrollX,
          y: window.scrollY,
        });
      }}
      onDragEnd={event => {
        const attachment = attachments.find(a=> a.id === draggingId)!
        let updated : Partial<Attachment>
        if(event.over){
          const coverId = event.over.id
          const placement= placements.find(p=> p.id === coverId)!
          const { width, height } = scaleTo(
            attachment.width,
            attachment.height,
            placement.width,
            placement.height,
          )
          updated = {
            x: placement.x,
            y: placement.y,
            column_id: coverId,
            width: width,
            height: height,
          }
        }else{
          updated = {
            x: event.delta.x / scale + (attachment.x || 0)  - initialWindowScroll.x / scale,
            y: event.delta.y / scale + (attachment.y || 0)  - initialWindowScroll.y / scale,
            column_id: undefined,
          }
        }
        handleAttachmentUpdate(event.active.id)(updated)
        setDraggingId(null)
      }}
      onDragCancel={() => setDraggingId(null)}
    >
      <Placements
        placements={scaledPlacements}
        attachments={attachments}
      />

      {scaledAttachments.map(a => {
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
