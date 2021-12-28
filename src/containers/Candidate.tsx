import React, { useState, useEffect, useRef, createRef, useReducer } from 'react';
import { Image, Image as Component } from '../components/Image';
import { Position, ResizableDelta, Rnd } from 'react-rnd';
import { DraggableData, DraggableEvent } from 'react-draggable';
import { Direction } from 're-resizable/lib/resizer';
import { DraggableImage } from './DraggableImage';
import { readAsDataURL, readAsImage } from '../utils/asyncReader';
import uuid from 'uuid';
import { AttachmentTypes } from '../entities';
import { scale } from '../utils/helpers';

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
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const {width, height } = scale(
    attachment.width,
    attachment.height,
    IMAGE_MAX_SIZE,
    1
  )

  return (
    <div
      onClick={e=>{
        if(addAttachment)
        addAttachment(attachment)}
      }
      style={{
        margin: '0.5rem',
        float: 'left',
        width,
        height,
        cursor: 'pointer'
      }}
    >
    <Image
      {...attachment}
      canvasRef={canvasRef}
    />
    </div>
  )
};
