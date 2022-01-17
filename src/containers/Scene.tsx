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
}

export const Scene = (
  {
    currentPage, dimensions, setDimensions ,children, scale = 1,
  }: Props) => {
  return (
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
  )
};
