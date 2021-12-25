import React, { RefObject } from 'react';
import Draggable, { DraggableEventHandler } from 'react-draggable';
import { Resizable, ResizableBox, ResizeCallbackData } from 'react-resizable';
import 'react-resizable/css/styles.css'
import { Rnd, RndDragCallback, RndResizeCallback } from 'react-rnd';

interface Props {
  deleteImage: () => void;
  width: number;
  height: number;
  canvasRef: RefObject<HTMLCanvasElement>;
  onDragStop?: RndDragCallback;
  onResizeStop?: RndResizeCallback;
}

export const Image: React.FC<Props> = ({
  canvasRef,
  width,
  height,
  onDragStop,
  onResizeStop,
}) => {
  return (
    <Rnd
      default={{
        x: 0,
        y: 0,
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
