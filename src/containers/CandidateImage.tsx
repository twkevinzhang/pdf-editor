import React, { useState, useEffect, useRef, createRef, useReducer } from 'react';
import { Image, Image as Component } from '../components/Image';
import { Position, ResizableDelta, Rnd } from 'react-rnd';
import { DraggableData, DraggableEvent } from 'react-draggable';
import { Direction } from 're-resizable/lib/resizer';
import { DraggableImage } from './DraggableImage';
import { readAsDataURL, readAsImage } from '../utils/asyncReader';
import uuid from 'uuid';
import { AttachmentTypes } from '../entities';
import { scaleTo } from '../utils/helpers';
import { Candidate } from './Candidate';

interface Props {
  attachment: ImageAttachment
  addAttachment?: (attachment: Attachment) => void;
  scale?: number;
}

const IMAGE_MAX_SIZE = 80;
export const CandidateImage = (
  {
    attachment,
    addAttachment,
    scale = 1,
}: Props) => {
  function getScaledImage(attachment: ImageAttachment): ImageAttachment{
    const { width, height } = scaleTo(
      attachment.width,
      attachment.height,
      IMAGE_MAX_SIZE,
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
    <Candidate
      onClick={e=>{
        if(addAttachment)
          addAttachment({
            ...attachment,
            id: uuid.v4()
          })}
      }
    >
      <Image
        {...getScaledImage(attachment)}
        style={{
          cursor: 'pointer'
        }}
      />
    </Candidate>
  )
};
