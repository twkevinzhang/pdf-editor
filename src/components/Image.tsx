import React, { RefObject, useEffect, useState } from 'react';
import { Rnd, RndDragCallback, RndResizeCallback } from 'react-rnd';

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

      let scale = 1;
      if (canvasWidth > IMAGE_MAX_SIZE) {
        scale = IMAGE_MAX_SIZE / canvasWidth;
      }

      if (canvasHeight > IMAGE_MAX_SIZE) {
        scale = Math.min(scale, IMAGE_MAX_SIZE / canvasHeight);
      }

      const newCanvasWidth = canvasWidth * scale;
      const newCanvasHeight = canvasHeight * scale;

      setCanvasWidth(newCanvasWidth);
      setCanvasHeight(newCanvasHeight);

      canvas.width = newCanvasWidth;
      canvas.height = newCanvasHeight;

      context.drawImage(img, 0, 0, newCanvasWidth, newCanvasHeight);
      // canvas.toBlob((blob) => {
      //   if(updateImageAttachment)
      //     updateImageAttachment({
      //       file: blob as File,
      //       width: newCanvasWidth,
      //       height: newCanvasHeight,
      //     });
      // });
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
