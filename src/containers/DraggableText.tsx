import React, { useState, useRef, useEffect, createRef, CSSProperties } from 'react';
import { Text as Component } from '../components/Text';
import { DragActions, TextMode } from '../entities';
import { DraggableData, DraggableEvent, DraggableEventHandler } from 'react-draggable';
import { Rnd } from 'react-rnd';

interface Props {
  pageWidth: number;
  pageHeight: number;
  removeText: () => void;
  updateTextAttachment: (textObject: Partial<TextAttachment>) => void;
}

export const DraggableText = ({
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
  const [dragging, setDragging] = useState(false);

  useEffect(()=>{
    if(editing){
      const input = inputRef.current;
      if (input) {
        input.focus();
        input.select();
      }
    }else{
      document.getSelection()?.removeAllRanges();
      if(content === ''){
        removeText()
      }else{
        const lines = [content];
        updateTextAttachment({
          lines,
          text: content,
        });
      }
    }
  },[editing])

  const onDragStop =(e: DraggableEvent,  data: DraggableData) =>{
    setDragging(false)
    updateTextAttachment({
      x: data.x,
      y: data.y,
    });
  }

  const onDragStart = (e: DraggableEvent,  data: DraggableData) =>{
    setDragging(true)
  }

  const onChangeText = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value;
    setContent(value);
  };

  function onDoubleClick(){
    setEditing(true)
  }

  const onBlur = (e: any) =>{
    setEditing(false)
  }

  let textStyle : CSSProperties = {}
  if(!dragging){
    textStyle = {
      border: '0.3px dashed gray',
    }
  }

  const textComponent = <Component
    onBlur={onBlur}
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
    style={textStyle}
  />

  let component = <></>
  if(editing){
    component = <div
      style={{
        position: 'absolute',
        top: y,
        left: x,
        width,
        height,
      }}
    >
      {textComponent}
    </div>
  }else{
    component = <Rnd
      default={{
        x: x,
        y: y,
        width: width,
        height: height,
      }}
      onDragStart={onDragStart}
      onDragStop={onDragStop}
      enableResizing={false}
      enableUserSelectHack={false}
    >
      {textComponent}
    </Rnd>
  }

  return component
};
