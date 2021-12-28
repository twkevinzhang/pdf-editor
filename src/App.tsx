import React, { useEffect, useLayoutEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import {usePdfUploader} from "./hooks/usePdfUploader";
import {Pdf, usePdf} from "./hooks/usePdf";
import { Container, Button, Row, Col, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Page } from './components/Page';
import { useAttachments } from './hooks/useAttachments';
import { AttachmentTypes } from './entities';
import { ggID } from './utils/helpers';
import { Attachments } from './components/Attachments';
import { useImageUploader } from './hooks/useImageUploader';
import uuid from "uuid";
import { Candidate } from './containers/Candidate';
import { saveFile } from './utils/StorageService';
import { useDrawer } from './hooks/useDrawer';

const App: React.FC<{}> = () => {
  const { file, setPdf, pageIndex, isMultiPage, isFirstPage, isLastPage, currentPage, isSaving, savePdf, previousPage, nextPage, setDimensions, name, dimensions } = usePdf();
  const { save, allAttachment, setAllAttachment } = useDrawer();
  const { add: addAttachment, allPageAttachments, pageAttachments, reset, update, remove, setPageIndex } = useAttachments();

  const { inputRef, uploading, handleClick, fileOnChange } = usePdfUploader({
        after: (uploaded: Pdf)=>{
          setPdf(uploaded);
          const numberOfPages = uploaded.pages.length;
          reset(numberOfPages)
        },
    });

  const { inputRef: imgRef, uploading: imgUploading, handleClick: handleImgClick, fileOnChange: imgOnChange } = useImageUploader({
    afterUploadAttachment,
  });

  useEffect(() => setPageIndex(pageIndex), [pageIndex, setPageIndex]);

  const handleText = () => {
    const newTextAttachment: TextAttachment = {
      id: uuid.v4(),
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

  function afterUploadAttachment (attachment: ImageAttachment){
    save(attachment).then()
    addAttachment(attachment);
  }

  const hiddenInputs = (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        onChange={fileOnChange}
        style={{ display: 'none' }}
      />
      <input
        ref={imgRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={imgOnChange}
      />
    </>
  )

    return (
    <div className="App">
      {hiddenInputs}
      <Container
        style={{ margin: 30 }}
      >
      <Button onClick={handleClick}>upload</Button>
      <Button onClick={handleText}>add text</Button>
      <Button onClick={handleImgClick}>add image</Button>
      <Button onClick={async ()=> {
        await savePdf(allPageAttachments);
      }}>save</Button>

      <div>
        <Row>
          <Col sm={3}>
            {allAttachment.map(attachment=>{
              return <Candidate {...(attachment as ImageAttachment)}/>
            })}

          </Col>
          <Col sm={9}>
            <Row>
              <Col sm={1}>
                {isMultiPage && !isFirstPage && (
                  <Button onClick={previousPage} />
                )}
              </Col>
              <Col sm={8}>
                { currentPage && (
                  <Card
                    style={{
                      display: 'table', // for look more compact
                    }}
                  >
                    <div
                      style={{ position: 'relative' }}
                    >
                      <Page
                        dimensions={dimensions}
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
                    </div>
                  </Card>
                )}
              </Col>
              <Col sm={1}>
                {isMultiPage && !isLastPage && (
                  <Button onClick={nextPage} />
                )}
              </Col>
            </Row>
          </Col>
        </Row>

      </div>
      </Container>
    </div>
  );
}

export default App;
