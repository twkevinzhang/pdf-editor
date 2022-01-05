import React, { useEffect, useRef, useState } from 'react';
import { Page } from '../components/Page';
import { Attachments } from '../components/Attachments';
import { mockPlacements } from '../models/MockPlacements';
import { Card } from 'react-bootstrap';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';

interface Props {
  currentPage: any;
  dimensions?: Dimensions;
  setDimensions?: ({ width, height }: Dimensions) => void;
  children?: React.ReactNode | null;
}

export const Scene = (
  {
    currentPage, dimensions, setDimensions ,children
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
        />
        {children}
      </Card>
  )
};
