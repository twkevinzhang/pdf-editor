import React, { CSSProperties, FocusEventHandler, forwardRef } from 'react';
import classNames from 'classnames';
import type {DraggableSyntheticListeners, Translate} from '@dnd-kit/core';

interface Props {
  border?: boolean;
  dragging?: boolean;
  listeners?: DraggableSyntheticListeners;
  translate?: Translate;
  text?: string;
  editing?: boolean;
  width?: number;
  height?: number;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  onChangeText?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  draggableAttrs?: object;
  size?: number;
  lineHeight?: number;
  fontFamily?: string;
  style?: CSSProperties;
}

export const Text = forwardRef<HTMLInputElement, Props>((
    {
      border = true,
      dragging = false,
      listeners,
      translate,
      onBlur,
      onChangeText,
      editing = false,
      width,
      height,
      text,
      draggableAttrs,
      size,
      lineHeight,
      fontFamily,
      style,
    },
    ref
  )=> {

  let borderStyle: CSSProperties = {
    borderWidth: '0.3px',
    borderColor: 'gray',
    borderStyle: editing? 'solid': 'dashed'
  }
  if(dragging) borderStyle = {
    borderStyle: 'none',
    borderWidth: 0,
  };

  return (
        <input
          type="text"
          onBlur={onBlur}
          ref={ref}
          onChange={onChangeText}
          readOnly={!editing}
          style={{
            fontSize: size,
            lineHeight,
            fontFamily,
            width: width || '100%',
            height,
            outline: 'none',
            padding: 0,
            boxSizing: 'border-box',
            margin: 0,
            backgroundColor: 'transparent',
            cursor: editing ? 'text': 'move' ,
            ...borderStyle,
            ...style,
          }}
          value={text}
          {...(editing? {} : listeners)}
          {...(editing? {} : draggableAttrs)}
        />
    );
  }
);

