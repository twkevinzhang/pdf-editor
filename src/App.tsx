import React from 'react';
import logo from './logo.svg';
import './App.css';
import {UploadTypes, usePdfUploader} from "./hooks/usePdfUploader";
import {Pdf, usePdf} from "./hooks/usePdf";

const App: React.FC<{}> = () => {
    const { file, initialize, pageIndex, isMultiPage, isFirstPage, isLastPage, currentPage, isSaving, savePdf, previousPage, nextPage, setDimensions, name, dimensions } = usePdf();

    const { inputRef, handleClick, isUploading, onClick, upload } = usePdfUploader({
        afterUploadPdf: (pdfDetails: Pdf)=>{
            initialize(pdfDetails);
            const numberOfPages = pdfDetails.pages.length;
            console.log(numberOfPages)
        },
    });

    return (
    <div className="App">

      <input
          ref={inputRef}
          type="file"
          name="pdf"
          id="pdf"
          accept="application/pdf"
          onChange={upload}
          onClick={handleClick}
      />

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
