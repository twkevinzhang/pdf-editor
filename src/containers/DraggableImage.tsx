import React, { useState, useEffect, useRef, CSSProperties } from 'react';
import { Image as Component } from '../components/Image';
import { Position, ResizableDelta, Rnd } from 'react-rnd';
import { DraggableData, DraggableEvent } from 'react-draggable';
import { Direction } from 're-resizable/lib/resizer';
import { BsFillCircleFill, BsXCircleFill } from 'react-icons/all';
import { Stone } from '../components/Stone';



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
  const [dragging, setDragging] = useState<boolean>(false)

  const onDragStart = (e: DraggableEvent,  data: DraggableData) =>{
    setDragging(true)
  }

  const onDragStop =(e: DraggableEvent,  data: DraggableData) =>{
    setDragging(false)
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

  const deleteButton =
    <Stone
      position={{
        left: 0,
        top: 0,
        right: 0,
      }}
      translateX={"0"}
      translateY={"-50%"}
      style={{
        zIndex: "1000",
        cursor: 'pointer',
        backgroundColor: 'white',
      }}
    >
      <BsXCircleFill
        onClick={removeImage}
        style={{
          color:'rgb(245, 101, 101)',
          width: "100%",
          height: "100%",
        }}/>
    </Stone>

  const stone =
    <BsFillCircleFill
      style={{
        color:'#90cdf4',
        width: "100%",
        height: "100%",
      }}
    />

  const leftTop =
    <Stone
      position={{
        left: 0,
        top: 0,
      }}
      translateX={"-50%"}
      translateY={"-50%"}
    >
      {stone}
    </Stone>

  const rightTop =
    <Stone
      position={{
        right: 0,
        top: 0,
      }}
      translateX={"50%"}
      translateY={"-50%"}
    >
      {stone}
    </Stone>

  const leftBottom =
    <Stone
      position={{
        left: 0,
        bottom: 0,
      }}
      translateX={"-50%"}
      translateY={"50%"}
    >
      {stone}
    </Stone>

  const rightBottom =
    <Stone
      position={{
        right: 0,
        bottom: 0,
      }}
      translateX={"50%"}
      translateY={"50%"}
    >
      {stone}
    </Stone>

  let imageStyle: CSSProperties = {
    border:'0.3px dashed gray',
  }
  if(dragging){
    imageStyle= {
      ...imageStyle,
      outline: `${width/2}px solid rgba(0, 0, 0, 0.3)`,
      outlineOffset: `-${width/2}px`,
      overflow: "hidden",
      position: "relative",
    }
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
      onDragStart={onDragStart}
      onDragStop={onDragStop}
      onResizeStop={onResizeStop}
    >
      {!dragging && (
        <>
          {leftTop}
          {removeImage && deleteButton}
          {rightTop}
          {leftBottom}
          {rightBottom}
        </>
      )}
      <Component
        style={imageStyle}
        img={img}
        canvasRef={canvasRef}
        width={width}
        height={height}/>
    </Rnd>
  );
};
