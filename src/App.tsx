import React, { useEffect, useLayoutEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import {usePdfUploader} from "./hooks/usePdfUploader";
import {Pdf, usePdf} from "./hooks/usePdf";
import { Button } from 'semantic-ui-react';
import { Page } from './components/Page';
import { useAttachments } from './hooks/useAttachments';
import { AttachmentTypes } from './entities';
import { ggID } from './utils/helpers';
import { Attachments } from './components/Attachments';

const App: React.FC<{}> = () => {
  const { file, setPdf, pageIndex, isMultiPage, isFirstPage, isLastPage, currentPage, isSaving, savePdf, previousPage, nextPage, setDimensions, name, dimensions } = usePdf();
  const { add: addAttachment, allPageAttachments, pageAttachments, reset, update, remove, setPageIndex } = useAttachments();

  const { inputRef, uploading, handleClick, fileOnChange } = usePdfUploader({
        after: (uploaded: Pdf)=>{
          setPdf(uploaded);
          const numberOfPages = uploaded.pages.length;
          reset(numberOfPages)
        },
    });

  useEffect(() => setPageIndex(pageIndex), [pageIndex, setPageIndex]);

  const handleTextImage = () => {
    const newTextAttachment: TextAttachment = {
      id: ggID(),
      type: AttachmentTypes.TEXT,
      x: 0,
      y: 0,
      width: 120,
      height: 25,
      size: 16,
      lineHeight: 1.4,
      fontFamily: 'Times-Roman',
      text: 'Enter Text Here',
    };
    addAttachment(newTextAttachment);
  };

  const hiddenInputs = (
    <>
      <input
        ref={inputRef}
        type="file"
        name="pdf"
        id="pdf"
        accept="application/pdf"
        onChange={fileOnChange}
        style={{ display: 'none' }}
      />
    </>
  )

    return (
    <div className="App">
      {hiddenInputs}
      <Button onClick={handleClick}>upload</Button>
      <Button onClick={handleTextImage}>add text</Button>
      <Button onClick={async ()=> {
        await savePdf(allPageAttachments);
      }}>save</Button>

      <Page
        setDimensions={setDimensions}
        page={currentPage}
      />

      { dimensions && (
        <Attachments
          pdfName={name}
          removeAttachment={remove}
          updateAttachment={update}
          pageDimensions={dimensions}
          attachments={pageAttachments}
        />
      )}

      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
