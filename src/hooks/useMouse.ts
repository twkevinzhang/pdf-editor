import React, { useReducer, useCallback, useState, useEffect } from 'react';
import { Pdf } from './usePdf';
import { getMovePosition } from '../utils/helpers';

export const useMouse = ({ onUp }: { onUp: (event: MouseEvent) => void }) => {
  useEffect(() => {
    window.removeEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseup', handleMouseUp);
  }, [onUp]);

  const handleMouseUp = (event: MouseEvent) => {
    onUp(event);
    window.removeEventListener('mouseup', handleMouseUp);
  };
};
