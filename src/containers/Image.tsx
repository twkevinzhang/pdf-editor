import React, { useState, useEffect, useRef } from 'react';
import { Image as Component } from '../components/Image';
import { DraggableData, DraggableEvent } from 'react-draggable';

const IMAGE_MAX_SIZE = 300;

interface Props {
  pageWidth: number;
  pageHeight: number;
  removeImage: () => void;
  updateImageAttachment: (imageObject: Partial<ImageAttachment>) => void;
}

export const Image = ({
  img,
  width,
  height,
  pageWidth,
  removeImage,
  pageHeight,
  updateImageAttachment,
}: ImageAttachment & Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasWidth, setCanvasWidth] = useState(width);
  const [canvasHeight, setCanvasHeight] = useState(height);

  const onStop =(e: DraggableEvent,  data: DraggableData) =>{
    updateImageAttachment({
      x: data.x,
      y: data.y,
    });
  }

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
      canvas.toBlob((blob) => {
        updateImageAttachment({
          file: blob as File,
          width: newCanvasWidth,
          height: newCanvasHeight,
        });
      });
    };

    renderImage(img);
  }, [img]);

  const deleteImage = () => {
    removeImage();
  };

  return (
    <Component
      onStop={onStop}
      deleteImage={deleteImage}
      canvasRef={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
    />
  );
};
