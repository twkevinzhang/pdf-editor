import React, { RefObject } from 'react';
import { defaultCoordinates } from '@dnd-kit/core';
import { Coordinates } from '@dnd-kit/utilities/dist/coordinates/types';

export const ScrollContext = React.createContext<RefObject<HTMLDivElement> | null>(null);