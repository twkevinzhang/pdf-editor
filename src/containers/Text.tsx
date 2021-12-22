import React, { useState, useRef, useEffect } from 'react';
import { Text as Component } from '../components/Text';
import { getMovePosition } from '../utils/helpers';
import { DragActions, TextMode } from '../entities';
import { DraggableData, DraggableEvent, DraggableEventHandler } from 'react-draggable';

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
  const [textMode, setTextMode] = useState<TextMode>(TextMode.COMMAND);

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

  const toggleEditMode = () => {
    const input = inputRef.current;
    const mode =
      textMode === TextMode.COMMAND ? TextMode.INSERT : TextMode.COMMAND;

    setTextMode(mode);

    if (input && mode === TextMode.INSERT) {
      input.focus();
      input.select();
    } else {
      prepareTextAndUpdate();
    }
  };

  const onChangeText = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value;
    setContent(value);
  };

  return (
    <Component
      text={content}
      width={width}
      height={height}
      mode={textMode}
      size={size}
      lineHeight={lineHeight}
      inputRef={inputRef}
      fontFamily={fontFamily}
      initY={y}
      onChangeText={onChangeText}
      initX={x}
      toggleEditMode={toggleEditMode}
      onStop={onStop}
    />
  );
};
