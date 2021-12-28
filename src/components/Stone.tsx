import React, { useState, useEffect, useRef, CSSProperties } from 'react';

interface Position {
  left?: number;
  top?: number;
  right?: number;
  bottom?: number;
}

interface Props {
  position: Position
  style?: CSSProperties
  translateX: string;
  translateY: string;
}

export const Stone = (props: React.PropsWithChildren<Props>) => {
  const style = props.style? props.style : {}
  return (
    <div
      style={{
        position: 'absolute',
        ...props.position,
        width: '3rem',
        height: '3rem',
        margin: 'auto',
        borderRadius: '9999px',
        transform: `translateX(${props.translateX}) translateY(${props.translateY}) rotate(0) skewX(0) skewY(0) scaleX(0.25) scaleY(0.25)`,
        ...style,
      }}>
      {props.children}
    </div>
  );
};
