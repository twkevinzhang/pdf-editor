import React, { useState, useRef, useEffect } from 'react';
import { Text as Component } from '../components/Text';
import { getMovePosition } from '../utils/helpers';
import { DragActions, TextMode } from '../entities';
import { DraggableData, DraggableEvent, DraggableEventHandler } from 'react-draggable';
import { useMouse } from '../hooks/useMouse';

interface Props {
  pageWidth: number;
  pageHeight: number;
  updateTextAttachment: (textObject: Partial<TextAttachment>) => void;
}

export const Text = ({
   x,
   y,
   text,
   width,
   height,
   lineHeight,
   size,
   fontFamily,
   pageHeight,
   pageWidth,
   updateTextAttachment,
           }: TextAttachment & Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState(text || '');
  const [editing, setEditing] = useState(false);

  const onStop =(e: DraggableEvent,  data: DraggableData) =>{
    updateTextAttachment({
      x: data.x,
      y: data.y,
    });
  }

  const prepareTextAndUpdate = () => {
    // Deselect any selection when returning to command mode
    document.getSelection()?.removeAllRanges();

    const lines = [content];
    updateTextAttachment({
      lines,
      text: content,
    });
  };

  const onChangeText = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value;
    setContent(value);
  };

  function onDoubleClick(){
    const input = inputRef.current;
    setEditing(true)
    if (input) {
      input.focus();
      input.select();
    }
  }

  useMouse({onUp:()=>{
      if(editing){
        setEditing(false)
        prepareTextAndUpdate();
      }
  }});

  return (
    <Component
      text={content}
      width={width}
      height={height}
      editing={editing}
      size={size}
      lineHeight={lineHeight}
      inputRef={inputRef}
      fontFamily={fontFamily}
      initY={y}
      onChangeText={onChangeText}
      initX={x}
      onDoubleClick={onDoubleClick}
      onStop={onStop}
    />
  );
};
