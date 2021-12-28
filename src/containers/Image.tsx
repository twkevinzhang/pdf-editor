import React, { useState, useEffect, useRef } from 'react';
import { Image as Component } from '../components/Image';
import { Position, ResizableDelta } from 'react-rnd';
import { DraggableData, DraggableEvent } from 'react-draggable';
import { Direction } from 're-resizable/lib/resizer';

const IMAGE_MAX_SIZE = 300;

interface Props {
  pageWidth: number;
  pageHeight: number;
  removeImage?: () => void;
  updateImageAttachment?: (imageObject: Partial<ImageAttachment>) => void;
}

export const Image = ({
  x,
  y,
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
        if(updateImageAttachment)
        updateImageAttachment({
          file: blob as File,
          width: newCanvasWidth,
          height: newCanvasHeight,
        });
      });
    };

    renderImage(img);
  }, [img]);

  const onDragStop =(e: DraggableEvent,  data: DraggableData) =>{
    if(updateImageAttachment)
    updateImageAttachment({
      x: data.x,
      y: data.y,
    });
  }

  const onResizeStop =(e: MouseEvent | TouchEvent, dir: Direction, ref: HTMLElement, delta: ResizableDelta, position: Position) =>{
    function strToInt(strPx: string): number{
      const strInt= strPx.replace('px','')
      const int= parseInt(strInt)
      if(int){
        return int
      }else{
        throw new Error(strPx+ " can't parse to int: " + int + "when parse "+ strInt)
      }
    }

    if(updateImageAttachment)
    updateImageAttachment({
      x: position.x,
      y: position.y,
      width: strToInt(ref.style.width),
      height: strToInt(ref.style.height),
    });
  }

  return (
    <Component
      x={x}
      y={y}
      onDragStop={onDragStop}
      onResizeStop={onResizeStop}
      deleteImage={removeImage}
      canvasRef={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
    />
  );
};
