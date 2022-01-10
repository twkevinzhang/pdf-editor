import React, { useState, useEffect, useRef, createRef, useReducer, ReactNode, MouseEventHandler } from 'react';
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
import { Button } from 'react-bootstrap';

interface Props {
  children?:ReactNode | null,
  onClick?: MouseEventHandler;
  scale?: number;
}

export const CandidateText = (
  {
    onClick,
    children,
    scale,
  }: Props) => {
  return (
    <Candidate>
      <Button
        style={{
          width: '100%',
          height: '5rem',
        }}
        onClick={onClick}>
        {children}
      </Button>
    </Candidate>
  )
};
