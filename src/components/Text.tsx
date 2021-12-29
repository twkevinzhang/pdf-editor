import React, { CSSProperties, FocusEventHandler, RefObject, useEffect, useState } from 'react';
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
  onDoubleClick?: () => void;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  onChangeText: (e: React.ChangeEvent<HTMLInputElement>) => void;
  style?: CSSProperties;
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
  lineHeight,
  style,
  onBlur
}) => {
  return (

      <div
        onDoubleClick={onDoubleClick}
        style={{
          overflowWrap: 'break-word',
          padding: '0px',
          position: 'absolute',
          ...(style || {}),
        }}
      >
        <input
          type="text"
          onBlur={onBlur}
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
  );
};
