import React, { useState, useEffect, useRef, createRef, useReducer } from 'react';
import { Image as Component } from '../components/Image';
import { Position, ResizableDelta, Rnd } from 'react-rnd';
import { DraggableData, DraggableEvent } from 'react-draggable';
import { Direction } from 're-resizable/lib/resizer';
import { DraggableImage } from './DraggableImage';
import { readAsDataURL, readAsImage } from '../utils/asyncReader';
import uuid from 'uuid';
import { AttachmentTypes } from '../entities';


interface Props {
  attachment: ImageAttachment
  addAttachment?: (attachment: Attachment) => void;
}

export const Candidate = (
  {
    attachment,
    addAttachment,
}: Props) => {
  const [trap, setTrap] = useState(false);

  function handleAttachmentUpdate(imageObject: Partial<ImageAttachment>){
    const imageAttachment: ImageAttachment = {
      ...attachment,
      id:  uuid.v4(),
      x: (imageObject.x || 0) , // TODO: don't hardcore -330 , use offsetFromParent
      y: imageObject.y || 0,
    };

    if(addAttachment)
    addAttachment(imageAttachment)

    forceUpdate()
  }

  function forceUpdate(){
    const b = trap
    setTrap(!b)
    setTrap(b)
  }

  if(trap){
    return (<></>)
  }else {
    return (
      <DraggableImage
        pageWidth={0}
        pageHeight={0}
        updateImageAttachment={handleAttachmentUpdate}
        {...(attachment)} />
    );
  }
};
