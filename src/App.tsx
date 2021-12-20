import React from 'react';
import logo from './logo.svg';
import './App.css';
import {usePdfUploader} from "./hooks/usePdfUploader";
import {Pdf, usePdf} from "./hooks/usePdf";
import { Button } from 'semantic-ui-react';

const App: React.FC<{}> = () => {
    const { file, initialize, pageIndex, isMultiPage, isFirstPage, isLastPage, currentPage, isSaving, savePdf, previousPage, nextPage, setDimensions, name, dimensions } = usePdf();

    const { inputRef, uploading, handleClick, fileOnChange } = usePdfUploader({
        after: (uploaded: Pdf)=>{
          setPdf(uploaded);
            const numberOfPages = uploaded.pages.length;
            console.log(numberOfPages)
        },
    });

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
