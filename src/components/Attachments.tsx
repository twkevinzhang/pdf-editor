import React, { useEffect, useState } from 'react';
import { AttachmentTypes } from '../entities';
import { DraggableText } from '../containers/DraggableText';
import { DraggableImage } from '../containers/DraggableImage';
import {
  defaultCoordinates,
  DndContext,
  KeyboardSensor, Modifiers,
  MouseSensor, PointerActivationConstraint,
  TouchSensor,
  Translate,
  useSensor, useSensors,
} from '@dnd-kit/core';
import { DragEndEvent } from '@dnd-kit/core/dist/types';

interface Props {
  attachments: Attachment[];
  pageDimensions: Dimensions;
  getAttachment: (id: string) => Attachment | undefined;
  removeAttachment: (id: string) => void;
  updateAttachment: (id: string, attachment: Partial<Attachment>) => void;
  activationConstraint?: PointerActivationConstraint;
}

export const Attachments: React.FC<Props> = (
  {
  attachments,
  pageDimensions,
    getAttachment,
    removeAttachment,
  updateAttachment,
   activationConstraint,
}) => {
  const [translateSet, setTranslateSet] = useState<{
    id: string;
    initialTranslate: Translate;
    translate: Translate;
  }>({id:"", initialTranslate: defaultCoordinates, translate: defaultCoordinates});
  const [initialWindowScroll, setInitialWindowScroll] = useState(defaultCoordinates);
  const mouseSensor = useSensor(MouseSensor, { activationConstraint });
  const touchSensor = useSensor(TouchSensor, { activationConstraint });
  const keyboardSensor = useSensor(KeyboardSensor, {});
  const sensors = useSensors(mouseSensor, touchSensor, keyboardSensor);

  const handleAttachmentUpdate = (id: string) => (
    attachment: Partial<Attachment>
  ) => updateAttachment(id, attachment );

  return (
    <DndContext
      sensors={sensors}
      onDragStart={event => {
        setInitialWindowScroll({
          x: window.scrollX,
          y: window.scrollY,
        });
        const attachment= getAttachment(event.active.id)
        const initialTranslate = {
          ...defaultCoordinates,
          ...attachment
        }
        setTranslateSet({
          id: event.active.id,
          initialTranslate,
          translate: initialTranslate,
        });
      }}
      onDragMove={event => {
        setTranslateSet(({initialTranslate}) => ({
          id: event.active.id,
          initialTranslate,
          translate: {
            x: initialTranslate.x + event.delta.x - initialWindowScroll.x,
            y: initialTranslate.y + event.delta.y - initialWindowScroll.y,
          },
        }));
      }}
      onDragEnd={event => {
        updateAttachment(event.active.id, translateSet.translate)
        setTranslateSet({
          id: event.active.id,
          translate: translateSet.translate,
          initialTranslate: translateSet.translate,
        });
        setInitialWindowScroll(defaultCoordinates);
      }}
      onDragCancel={event => {
        setTranslateSet(({initialTranslate}) => ({
          id: event.active.id,
          translate: initialTranslate,
          initialTranslate,
        }));
        setInitialWindowScroll(defaultCoordinates);
      }}
    >
        {attachments?.map(attachment => {
          const key = attachment.id;

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
                translate={
                  translateSet.id === attachment.id
                   ? {x: translateSet.translate.x, y:translateSet.translate.y}
                   : {x: attachment.x, y: attachment.y}
                }
                pageWidth={pageDimensions.width}
                pageHeight={pageDimensions.height}
                removeText={() => removeAttachment(attachment.id)}
                updateTextAttachment={handleAttachmentUpdate(attachment.id)}
                {...(attachment as TextAttachment)}
              />
            )
          }
        })}
    </DndContext>
  )
};
