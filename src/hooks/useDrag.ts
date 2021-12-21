import React, { useReducer, useCallback, useState, useEffect } from 'react';
import { Pdf } from './usePdf';
import { getMovePosition } from '../utils/helpers';

export const useDrag = ({
  startX,
  startY,
  width,
  height,
  pageHeight,
  pageWidth,
}: {
  startX: number;
  startY: number;
  width: number;
  height: number;
  pageHeight: number;
  pageWidth: number;
}) => {
  const [positionLeft, setPositionLeft] = useState(0);
  const [positionTop, setPositionTop] = useState(0);
  const [movementX, setMovementX] = useState(0);
  const [movementY, setMovementY] = useState(0);

  useEffect(() => {
    const { top, left } = getMovePosition(
      startX,
      startY,
      movementX,
      movementY,
      width,
      height,
      pageWidth,
      pageHeight
    );
    console.log('useDrag useEffect left top', movementX, movementY);
    setPositionLeft(positionLeft + movementX);
    setPositionTop(positionTop + movementY);
  }, [movementX, movementY]);

  const handleMousedown = (event: React.MouseEvent<HTMLDivElement>) => {
    window.addEventListener('mousemove', handleMousemove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleMousemove = (event: MouseEvent) => {
    setMovementX(event.movementX);
    setMovementY(event.movementY);
  };

  const handleMouseUp = (event: MouseEvent) => {
    window.removeEventListener('mousemove', handleMousemove);
    window.removeEventListener('mouseup', handleMouseUp);
  };

  return {
    handleMousedown,
    positionLeft,
    positionTop,
  };
};
