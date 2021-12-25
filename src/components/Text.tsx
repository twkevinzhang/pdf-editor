import React, { RefObject } from 'react';
import { TextMode } from '../entities';
import { Rnd, RndDragCallback } from 'react-rnd';

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
  onDragStop?: RndDragCallback;
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
  onDragStop,
  lineHeight,
}) => {
  return (
    <Rnd
      default={{
        x: 0,
        y: 0,
        width: width,
        height: height,
      }}
      onDragStop={onDragStop}
      enableResizing={false}
    >
      <div
        onDoubleClick={onDoubleClick}
        style={{
          border: '1px solid gray',
          fontFamily: 'Times-Roman',
          fontSize: '16px',
          lineHeight: '1.4',
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
    </Rnd>
  );
};
