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

interface Props {
  placements: Placement[];
  attachments: Attachment[];
  scale?:number;
}

export const Placements: React.FC<Props> = (
  {
    placements,
    attachments,
    scale=1,
}) => {

  function getHiddenPlaceholder(attachments: Attachment[]) {
    const result = attachments.map(a => {
      const key = a.id;
      return (<div hidden key={key} />)
    })

    if(!result.length){
      return null
    }else{
      return result
    }
  }

  return (
    <>
      {placements.map(placement => {
        const id = placement.id
        return <Droppable
          key={id}
          {...placement}
          width={placement.width * scale}
          height={placement.height * scale}
          x={placement.x * scale}
          y={placement.y * scale}
        >
          {getHiddenPlaceholder(attachments?.filter(a => a.column_id === id))}
        </Droppable>
      })}
    </>
  )
};
