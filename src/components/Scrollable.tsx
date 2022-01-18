import React, { createRef, CSSProperties, FocusEventHandler, forwardRef, ReactNode } from 'react';
import classNames from 'classnames';
import type {DraggableSyntheticListeners, Translate} from '@dnd-kit/core';
import { MouseContext } from './MouseContext';
import { ScrollContext } from '../contexts/ScrollContext';
import { defaultCoordinates } from '@dnd-kit/core';

interface Props {
  style?: CSSProperties;
  children?:ReactNode | null,
}

export const Scrollable = (
  {
    children,
    style,
  }: Props
) =>{
  const ref = createRef<HTMLDivElement>();

  return <ScrollContext.Provider value={ref}>
    <div
      ref={ref}
      className="row flex-nowrap"
      style={{
        overflowX: 'scroll',
        overflowY: 'scroll',
        height: '93vh',
        ...style
      }}
    >
      {children}
    </div>
  </ScrollContext.Provider>

}