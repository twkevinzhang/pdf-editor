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

interface Props {
  attachment: ImageAttachment
  addAttachment?: (attachment: Attachment) => void;
}

const IMAGE_MAX_SIZE = 120

export const Candidate = (
  {
    attachment,
    addAttachment,
}: Props) => {
  const {width, height } = scaleTo(
    attachment.width,
    attachment.height,
    IMAGE_MAX_SIZE,
  )

  return (
    <div
      onClick={e=>{
        if(addAttachment)
        addAttachment({
          ...attachment,
          id: uuid.v4()
        })}
      }
      style={{
        margin: '0.5rem',
        float: 'left',
      }}
    >
    <Image
      {...attachment}
      width={width}
      height={height}
      style={{
        cursor: 'pointer'
      }}
    />
    </div>
  )
};
