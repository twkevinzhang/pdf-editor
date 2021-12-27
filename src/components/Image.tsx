import React, { RefObject } from 'react';
import { Rnd, RndDragCallback, RndResizeCallback } from 'react-rnd';

interface Props {
  x:number,
  y:number,
  deleteImage?: () => void;
  width: number;
  height: number;
  canvasRef: RefObject<HTMLCanvasElement>;
  onDragStop?: RndDragCallback;
  onResizeStop?: RndResizeCallback;
}

export const Image: React.FC<Props> = ({
  x,
  y,
  canvasRef,
  width,
  height,
  onDragStop,
  onResizeStop,
  deleteImage,
}) => {
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
      <div
        onClick={deleteImage}
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
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
      }}
    />
</Rnd>
);
};
