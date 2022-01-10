import React, { useState, useEffect, useRef, CSSProperties, ReactNode } from 'react';

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
  children?: ReactNode | null;
}

export const Stone = (
  {
    style,
    translateX,
    translateY,
    position,
    children,
} : Props) => {
  return (
    <div
      style={{
        position: 'absolute',
        ...position,
        width: '3rem',
        height: '3rem',
        margin: 'auto',
        borderRadius: '9999px',
        transform: `translateX(${translateX}) translateY(${translateY}) rotate(0) skewX(0) skewY(0) scaleX(0.25) scaleY(0.25)`,
        ...style,
      }}>
      {children}
    </div>
  );
};
