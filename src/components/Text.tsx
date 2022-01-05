import React, { CSSProperties, FocusEventHandler, forwardRef } from 'react';
import classNames from 'classnames';
import type {DraggableSyntheticListeners, Translate} from '@dnd-kit/core';

interface Props {
  listeners?: DraggableSyntheticListeners;
  draggableAttrs?: object;
  text?: string;
  editing?: boolean;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  onChangeText?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  size?: number;
  lineHeight?: number;
  fontFamily?: string;
  style?: CSSProperties;
}

export const Text = forwardRef<HTMLInputElement, Props>((
    {
      listeners,
      draggableAttrs,
      onBlur,
      onChangeText,
      editing = false,
      text,
      size,
      lineHeight,
      fontFamily,
      style,
    },
    ref
  )=> {
  const dragAttrs = {
    ...listeners,
    ...draggableAttrs,
  }

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
            outline: 'none',
            padding: 0,
            margin: 0,
            cursor: editing ? 'text': 'move' ,
            border: 'unset',
            backgroundColor: 'unset',
            ...style,
          }}
          value={text}
          size={text?.length || 5}
          {...(editing? {} : dragAttrs)}
        />
    );
  }
);

