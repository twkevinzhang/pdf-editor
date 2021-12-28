import React, { useState, useEffect, useRef } from 'react';
import { Image as Component } from '../components/Image';
import { Position, ResizableDelta, Rnd } from 'react-rnd';
import { DraggableData, DraggableEvent } from 'react-draggable';
import { Direction } from 're-resizable/lib/resizer';



interface Props {
  pageWidth: number;
  pageHeight: number;
  removeImage?: () => void;
  updateImageAttachment?: (imageObject: Partial<ImageAttachment>) => void;
}

export const DraggableImage = ({
  id,
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
    <Rnd
      default={{
        x: x,
        y: y,
        width: width,
        height: height,
      }}
      minWidth={100}
      minHeight={100}
      bounds="window"
      onDragStop={onDragStop}
      onResizeStop={onResizeStop}
    >
      {removeImage &&
        <div
          onClick={removeImage}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            right: 0,
            width: '3rem',
            height: '3rem',
            cursor: 'pointer',
            margin: 'auto',
            borderRadius: '9999px',
            transform: "translateX(0) translateY(-50%) rotate(0) skewX(0) skewY(0) scaleX(0.75) scaleY(0.75)",
            backgroundColor: "white"
          }}>
          <img
            style={{
              width: "100%",
              height: "100%",
            }}
            src="./react-pdf-editor/delete.svg" alt="delete object" />
        </div>
      }
      <Component
        img={img}
        canvasRef={canvasRef}
        width={width}
       height={height}/>
    </Rnd>
  );
};
