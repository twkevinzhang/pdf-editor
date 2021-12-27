import React, { RefObject } from 'react';
import { Rnd, RndDragCallback, RndResizeCallback } from 'react-rnd';

interface Props {
  x:number,
  y:number,
  deleteImage: () => void;
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
