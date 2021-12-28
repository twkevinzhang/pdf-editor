import React, { RefObject, useEffect, useState } from 'react';
import { Rnd, RndDragCallback, RndResizeCallback } from 'react-rnd';
import { scale } from '../utils/helpers';

interface Props {
  canvasRef: RefObject<HTMLCanvasElement>;
  img: HTMLImageElement;
  width: number;
  height: number;
}

const IMAGE_MAX_SIZE = 300;

export const Image: React.FC<Props> = (
  {
  canvasRef,
    width,
    height,
    img,
}: {} & Props) => {
  const [canvasWidth, setCanvasWidth] = useState(width);
  const [canvasHeight, setCanvasHeight] = useState(height);

  useEffect(() => {
    const renderImage = (img: HTMLImageElement) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext('2d');
      if (!context) return;

      const {width: newCanvasWidth, height: newCanvasHeight } = scale(
        canvasWidth,
        canvasHeight,
        IMAGE_MAX_SIZE,
        1
      )
      setCanvasWidth(newCanvasWidth);
      setCanvasHeight(newCanvasHeight);

      canvas.width = newCanvasWidth;
      canvas.height = newCanvasHeight;

      context.drawImage(img, 0, 0, newCanvasWidth, newCanvasHeight);
    };

    renderImage(img);
  }, [img]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
      }}
    />
);
};
