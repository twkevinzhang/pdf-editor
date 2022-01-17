import React, { MouseEventHandler, useEffect, useRef, useState } from 'react';
import { Page } from './Page';
import { Attachments } from './Attachments';
import { mockPlacements } from '../models/MockPlacements';
import { Card } from 'react-bootstrap';
import uuid from 'uuid';
import { getResizedAttachment, whichPlacement } from '../utils/helpers';

interface Props {
  children?: React.ReactNode | null;
  onClick?: (x: number, y: number) => void;
  handleAttachment?: Attachment;
  addAttachment?: (attachment: Attachment) => void;
  scale: number;
  active? : any,
  activePosition? : any,
  prevActivePosition? : any,
  passivePosition? : any,
  elementDimensions? : any,
  elementOffset? : any,
  itemPosition? : any,
}

export const InPageClick = (
  {
    children,
    onClick,
    handleAttachment,
    addAttachment,
    scale =1,
    active,
    activePosition,
    prevActivePosition,
    passivePosition,
    elementDimensions,
    elementOffset,
    itemPosition,
  }: Props) => {
  const handleClick = ()=> {
    let { x, y } = passivePosition
    if (handleAttachment && addAttachment) {
      x = x/scale
      y = y/scale
      let placement= whichPlacement(x, y, mockPlacements())
      if(placement){
        const attachment = getResizedAttachment(handleAttachment, placement);
        addAttachment({
          ...attachment,
          id: uuid.v4(),
        })
      }else{
        addAttachment({
          ...handleAttachment,
          x,
          y,
          id: uuid.v4(),
        })
      }
    }
    if(onClick)
      onClick(passivePosition.x, passivePosition.y)
  }
  return <div
    onClick={handleClick}
  >
    {children}
  </div>
};
