import React from 'react';

export const MouseContext = React.createContext<MyMouseEvent>({
  active: false,
  activePosition: { x: 0, y: 0 },
  elementDimensions: { height: 0, width: 0 },
  elementOffset: { left: 0, top: 0 },
  itemDimensions: { height: 0, width: 0 },
  itemPosition: { x: 0, y: 0 },
  itemRef: undefined,
  onLoadRefresh() {
  },
  passivePosition: { x: 0, y: 0 },
  prevActivePosition: { x: 0, y: 0 }
});