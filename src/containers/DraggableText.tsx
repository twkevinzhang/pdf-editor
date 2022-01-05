import React, { useState, useRef, useEffect, createRef, CSSProperties } from 'react';
import { DragActions, TextMode } from '../entities';
import { DraggableData, DraggableEvent, DraggableEventHandler } from 'react-draggable';
import { Rnd } from 'react-rnd';
import { Translate, useDraggable } from '@dnd-kit/core';
import { Text } from '../components/Text';
import { Stone } from '../components/Stone';
import { BsPencil, BsXCircleFill } from 'react-icons/all';

interface Props {
  pageWidth: number;
  pageHeight: number;
  removeText: () => void;
  updateTextAttachment: (textObject: Partial<TextAttachment>) => void;
  translate?: Translate;
  size?: number,
  lineHeight?: number,
  fontFamily?: string,
  hidden?: boolean,
}

export const DraggableText = (
  {
    id,
   text,
   pageHeight,
   pageWidth,
   removeText,
   updateTextAttachment,
    translate,
    size,
    lineHeight,
    fontFamily,
    hidden = false,
}: TextAttachment & Props) => {
  const [content, setContent] = useState(text || '');
  const [editing, setEditing] = useState(false);

  const {attributes: draggableAttrs, node: inputRef, isDragging, listeners, setNodeRef} = useDraggable({
    id,
  });

  useEffect(()=>{
    if(editing){
      const input = inputRef.current;
      if (input) {
        input.focus();
        (input as HTMLInputElement).select();
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

  const onChangeText = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value;
    setContent(value);
  };

  function onEdit(){
    setEditing(true)
  }

  const onBlur = (e: any) =>{
    setEditing(false)
  }

  const editButton =
    <Stone
      position={{
        top: 0,
        right: 0,
      }}
      translateX={"50%"}
      translateY={"-50%"}
      style={{
        cursor: 'pointer',
        backgroundColor: '#1eb99d',
      }}
    >
      <BsPencil
        onClick={onEdit}
        style={{
          color:'white',
          width: "100%",
          height: "100%",
        }}/>
    </Stone>

  let textStyle: CSSProperties = {
    borderWidth: '0.3px',
    borderColor: 'gray',
    borderStyle: editing? 'solid': 'dashed',
  }

  const hiddenStyle: CSSProperties = hidden
    ? {visibility: 'hidden',}
    : {}

  return (
    <div
      style={{
        position: "absolute",
        'left': `${translate?.x ?? 0}px`,
        'top': `${translate?.y ?? 0}px`,
        ...hiddenStyle
      }}
    >
      {editing? null : editButton}
      <Text
        ref={setNodeRef}
        listeners={listeners}
        draggableAttrs={draggableAttrs}
        onBlur={onBlur}
        text={content}
        size={size}
        lineHeight= { lineHeight }
        fontFamily={fontFamily}
        editing={editing}
        onChangeText={onChangeText}
        style={textStyle}
      />
    </div>
  )
};
