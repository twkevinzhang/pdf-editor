import React, { useState, useEffect, useRef } from 'react';
import { Image } from './Image';
import { Position, ResizableDelta } from 'react-rnd';
import { DraggableData, DraggableEvent } from 'react-draggable';
import { Direction } from 're-resizable/lib/resizer';

export const Candidate = (attachment :  Attachment) => {

  return (
    <Image
      {...(attachment as ImageAttachment)}
      pageWidth={0}
      pageHeight={0}
    />
  );
};
