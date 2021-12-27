import React, { RefObject, useEffect, useState } from 'react';
import { TextMode } from '../entities';
import { Rnd, RndDragCallback } from 'react-rnd';

interface Props {
  x: number,
  y: number,
  inputRef: RefObject<HTMLInputElement>;
  text?: string;
  editing: boolean;
  width: number;
  size?: number;
  height: number;
  lineHeight?: number;
  fontFamily?: string;
  onDoubleClick?: () => void;
  onDragStop?: RndDragCallback;
  onDrag?: RndDragCallback;
  onChangeText: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Text: React.FC<Props> = ({
  x,
  y,
  text,
  width,
  height,
  inputRef,
  editing,
  size,
  fontFamily,
  onChangeText,
  onDoubleClick,
  onDrag,
  onDragStop,
  lineHeight,
}) => {
  return (
    <Rnd
      default={{
        x: x,
        y: y,
        width: width,
        height: height,
      }}
      onDragStop={onDragStop}
      enableResizing={false}
      onDrag={onDrag}
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
