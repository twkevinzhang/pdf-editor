import React, { MouseEventHandler, useEffect, useRef, useState } from 'react';
import { Page } from '../components/Page';
import { Attachments } from '../components/Attachments';
import { mockPlacements } from '../models/MockPlacements';
import { Card } from 'react-bootstrap';
import uuid from 'uuid';

interface Props {
  currentPage: any;
  dimensions?: Dimensions;
  setDimensions?: ({ width, height }: Dimensions) => void;
  children?: React.ReactNode | null;
  scale?:number;
  handleAttachment?: Attachment;
  addAttachment?: (attachment: Attachment) => void;
  active? : any,
  activePosition? : any,
  prevActivePosition? : any,
  passivePosition? : any,
  elementDimensions? : any,
  elementOffset? : any,
  itemPosition? : any,
}

export const Scene = (
  {
    currentPage, dimensions, setDimensions ,children, scale = 1, handleAttachment, addAttachment,
    active,
    activePosition,
    prevActivePosition,
    passivePosition,
    elementDimensions,
    elementOffset,
    itemPosition,
  }: Props) => {
  const handleClick = ()=> {
    if (handleAttachment && addAttachment) {
      addAttachment({
        ...handleAttachment,
        id: uuid.v4(),
        x: passivePosition.x / scale,
        y: passivePosition.y / scale,
      })
    }
  }

  return (
    <div
      onClick={handleClick}
    >
    <Card
      style={{
        display: 'table', // for look more compact
      }}
    >
      <Page
        dimensions={dimensions}
        setDimensions={setDimensions}
        page={currentPage}
        scale={scale}
      />
      {children}
    </Card>
    </div>
  )
};
