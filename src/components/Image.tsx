import React, { RefObject } from 'react';
import Draggable, { DraggableEventHandler } from 'react-draggable';

interface Props {
  deleteImage: () => void;
  width: number;
  height: number;
  canvasRef: RefObject<HTMLCanvasElement>;
  onStop?: DraggableEventHandler;
}

export const Image: React.FC<Props> = ({
  canvasRef,
  width,
  height,
  onStop,
  deleteImage,
}) => {
  return (
      <Draggable
        onStop={onStop}>
        <div
          style={{
            position: 'absolute',
            border: '1px solid gray',
            top: '0px',
            left: '0px',
          }}
        >
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
          }}
        />
        </div>
      </Draggable>
  );
};
