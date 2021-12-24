import React, { RefObject } from 'react';
import { TextMode } from '../entities';
import Draggable, { DraggableEventHandler } from 'react-draggable';

interface Props {
  inputRef: RefObject<HTMLInputElement>;
  text?: string;
  editing: boolean;
  width: number;
  size?: number;
  height: number;
  lineHeight?: number;
  fontFamily?: string;
  initY: number;
  initX: number;
  onDoubleClick: () => void;
  onStop?: DraggableEventHandler;
  onChangeText: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Text: React.FC<Props> = ({
  text,
  width,
  height,
  inputRef,
  editing,
  size,
  fontFamily,
  initY,
  initX,
  onChangeText,
                                        onDoubleClick,
  onStop,
  lineHeight,
}) => {
  return (
    <div
      onDoubleClick={onDoubleClick}
      style={{
        position: 'absolute',
      }}
    >
      <Draggable
        defaultPosition={{x: initX, y: initY}}
        onStop={onStop}>
        <div
          style={{
            width,
            border: 1,
            fontFamily,
            fontSize: size,
            lineHeight,
            borderColor: 'gray',
            borderStyle: 'solid',
            wordWrap: 'break-word',
            padding: 0,
          }}
        >
          <input
            type="text"
            ref={inputRef}
            onChange={onChangeText}
            readOnly={!editing}
            style={{
              width: '100%',
              borderStyle: 'none',
              borderWidth: 0,
              fontFamily,
              fontSize: size,
              outline: 'none',
              padding: 0,
              boxSizing: 'border-box',
              lineHeight,
              height,
              margin: 0,
              backgroundColor: 'transparent',
              cursor: editing ? 'text': 'move' ,
            }}
            value={text}
          />
        </div>
      </Draggable>
    </div>
  );
};
