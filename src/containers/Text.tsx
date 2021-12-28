import React, { useState, useRef, useEffect, createRef } from 'react';
import { Text as Component } from '../components/Text';
import { DragActions, TextMode } from '../entities';
import { DraggableData, DraggableEvent, DraggableEventHandler } from 'react-draggable';
import { useMouse } from '../hooks/useMouse';

interface Props {
  pageWidth: number;
  pageHeight: number;
  removeText: () => void;
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
   removeText,
   updateTextAttachment,
           }: TextAttachment & Props) => {
  const inputRef = createRef<HTMLInputElement>();
  const [content, setContent] = useState(text || '');
  const [editing, setEditing] = useState(false);

  useMouse({ref: inputRef, onClick:(e:MouseEvent, mouseCover: boolean)=>{
      if(!mouseCover){
        setEditing(false)
      }
  }});

  useEffect(()=>{
    if(!editing){
      document.getSelection()?.removeAllRanges();
      if(content === ''){
        removeText()
      }
    }
  },[editing])

  const onDragStop =(e: DraggableEvent,  data: DraggableData) =>{
    updateTextAttachment({
      x: data.x,
      y: data.y,
    });
  }

  function onDrag (e: DraggableEvent,  data: DraggableData) {
    if(editing) setEditing(false);
  }

  const onChangeText = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value;
    setContent(value);
    const lines = [content];
    updateTextAttachment({
      lines,
      text: content,
    });
  };

  function onDoubleClick(){
    setEditing(true)
    const input = inputRef.current;
    if (input) {
      input.focus();
      input.select();
    }
  }

  return (
    <Component
      x={x}
      y={y}
      text={content}
      width={width}
      height={height}
      editing={editing}
      size={size}
      lineHeight={lineHeight}
      inputRef={inputRef}
      fontFamily={fontFamily}
      onChangeText={onChangeText}
      onDoubleClick={onDoubleClick}
      onDragStop={onDragStop}
      onDrag={onDrag}
    />
  );
};
