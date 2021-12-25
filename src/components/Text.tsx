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
  onChangeText,
  onDoubleClick,
  onStop,
  lineHeight,
}) => {
  return (
      <Draggable
        onStop={onStop}>
        <div
          onDoubleClick={onDoubleClick}
          style={{
            width,
            border: '1px solid gray',
            height,
            fontFamily: 'Times-Roman',
            fontSize: '16px',
            lineHeight: '1.4',
            top: '0px',
            left: '0px',
            overflowWrap: 'break-word',
            padding: '0px',
            position: 'absolute',
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
  );
};
