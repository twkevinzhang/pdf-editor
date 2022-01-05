import React, { useEffect, useLayoutEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import {usePdfUploader} from "./hooks/usePdfUploader";
import {Pdf, usePdf} from "./hooks/usePdf";
import { Container, Button, Row, Col, Card, Navbar, Nav, NavDropdown } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Page } from './components/Page';
import { useAttachments } from './hooks/useAttachments';
import { AttachmentTypes } from './entities';
import { Attachments } from './components/Attachments';
import { useImageUploader } from './hooks/useImageUploader';
import uuid from "uuid";
import { Candidate } from './containers/Candidate';
import { saveFile } from './utils/StorageService';
import { useDrawer } from './hooks/useDrawer';

import { BsChatLeftText, BsChevronLeft, BsChevronRight, BsFillImageFill } from 'react-icons/bs';
import { mockPlacements } from './models/MockPlacements';

const App: React.FC<{}> = () => {
  const { file, setPdf, pageIndex, isMultiPage, isFirstPage, isLastPage, currentPage, isSaving, savePdf, previousPage, nextPage, setDimensions, name, dimensions } = usePdf();
  const { save, allAttachment, setAllAttachment } = useDrawer();
  const { add: addAttachment, allPageAttachments, pageAttachments, reset, update, remove, setPageIndex } = useAttachments();
  const isPdfLoaded = !!file

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

  const handleSave = () => savePdf(allPageAttachments)

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

  let previousButtonStyle= {}
  if(!isMultiPage || isFirstPage){
    previousButtonStyle={
      visibility:'hidden'
    }
  }

  let nextPageStyle= {}
  if(!isMultiPage || isLastPage){
    nextPageStyle={
      visibility:'hidden'
    }
  }

    return (
    <div className="App">
      {hiddenInputs}

      <Navbar bg="light" expand="lg">
        <Container>
          <Navbar.Brand href="#home">PDF-Editor</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav>

            </Nav>
          </Navbar.Collapse>
          <Navbar.Toggle />
          <Navbar.Collapse className='justify-content-between'>
            <Nav>
              <Button style={previousButtonStyle} className='rounded-circle' variant="outline-dark" onClick={previousPage}><BsChevronLeft /></Button>
            </Nav>
            <div>
              {isPdfLoaded && (
                <>
                  <Button onClick={handleText}><BsChatLeftText /></Button>{" "}
                  <Button onClick={handleImgClick}><BsFillImageFill /></Button>
                </>
              )}
            </div>
            <Nav>
              <Button style={nextPageStyle} className='rounded-circle' variant="outline-dark" onClick={nextPage}><BsChevronRight /></Button>
            </Nav>
          </Navbar.Collapse>
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            <Nav>
              {isPdfLoaded && (<>
              <Nav.Link onClick={handleClick}>Upload New</Nav.Link>
              <Nav.Link onClick={handleSave}>Save</Nav.Link>
              </>)}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container
        style={{ margin: 30 }}
      >
      <div>
        {!isPdfLoaded && (<>
        <Row className='justify-content-center'>
          <div>
            <h3>上傳一份 Pdf！</h3>
            <Button onClick={handleClick}>Upload</Button>
          </div>
        </Row>
        </>)}
        <Row>
          <Col sm={4}>
            {isPdfLoaded && (<>
            <h3>插入一些圖片吧！</h3>
            <p>這些圖片被儲存在 local 的 IndexedDB</p>
            {allAttachment
              .filter(attachment=>attachment.type === AttachmentTypes.IMAGE)
              .map(attachment=>
                <Candidate
                  key={attachment.id}
                  attachment={(attachment as ImageAttachment)}
                  addAttachment={addAttachment}
                />
              )
            }
            </>)}

          </Col>
          <Col sm={8}>
            { currentPage && (
              <Card
                style={{
                  display: 'table', // for look more compact
                }}
              >
                  <Page
                    dimensions={dimensions}
                    setDimensions={setDimensions}
                    page={currentPage}
                  />
                  { dimensions && (
                    <Attachments
                      removeAttachment={remove}
                      updateAttachment={update}
                      pageDimensions={dimensions}
                      attachments={pageAttachments}
                      placements={mockPlacements()}
                    />
                  )}
              </Card>
            )}
          </Col>
        </Row>

      </div>
      </Container>
    </div>
  );
}

export default App;
