import React, {
  useReducer,
  useCallback,
  useState,
  useEffect,
  createRef,
  RefObject,
} from 'react';
import { Pdf } from './usePdf';
import { getMovePosition } from '../utils/helpers';

export const useMouse = ({
  ref,
  onClick,
}: {
  ref: RefObject<any>;
  onClick: (event: MouseEvent, mouseCover: boolean) => void;
}) => {
  useEffect(() => {
    const input = ref.current;
    let mouseC = false;
    if (input) {
      input.addEventListener('mouseover', (e: MouseEvent) => {
        mouseC = true;
      });
      input.addEventListener('mouseout', (e: MouseEvent) => {
        mouseC = false;
      });
    }

    window.addEventListener('mouseup', (e: MouseEvent) => {
      if (onClick) onClick(e, mouseC);
    });
  }, []);
};
