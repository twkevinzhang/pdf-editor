import React, { useEffect, useLayoutEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import {usePdfUploader} from "./hooks/usePdfUploader";
import {Pdf, usePdf} from "./hooks/usePdf";
import { Container, Button, Row, Col, Card, Navbar, Nav, NavDropdown } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Page } from './components/Page';
import { useAttachments } from './hooks/useAttachments';
import { AttachmentTypes } from './entities';
import { Attachments as PageAttachments } from './components/Attachments';
import { useImageUploader } from './hooks/useImageUploader';
import uuid from "uuid";
import { Candidate } from './containers/Candidate';
import { saveFile } from './utils/StorageService';
import { useDrawer } from './hooks/useDrawer';

import { BsChatLeftText, BsChevronLeft, BsChevronRight, BsFillImageFill } from 'react-icons/bs';
import { mockPlacements } from './models/MockPlacements';
import { Scene } from './containers/Scene';
import { scaleTo } from './utils/helpers';

const IMAGE_MAX_SIZE = 80;
const App: React.FC<{}> = () => {
  const [ scale, setScale ] = useState(1.65);
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
    addScaledAttachment(newTextAttachment)
  };

  const addScaledAttachment = (attachment: Attachment) => {
    addAttachment(getScaledAttachment(attachment));
  };

  function afterUploadAttachment (attachment: ImageAttachment){
    save(attachment).then()
    addScaledAttachment(attachment)
  }

  function getScaledAttachment(attachment: Attachment):Attachment{
    if(attachment.type === AttachmentTypes.TEXT){
      attachment= getScaledText(attachment as TextAttachment)
    }else if(attachment.type === AttachmentTypes.IMAGE){
      attachment=  getScaledImage(attachment as ImageAttachment)
    }
   return attachment;
  }

  function getScaledText(attachment: TextAttachment): TextAttachment{
    return {
      ...attachment,
      x: attachment.x * scale,
      y: attachment.y * scale,
      width: attachment.width * scale,
      height: attachment.height * scale,
      size: attachment.size? attachment.size * scale : undefined,
    }
  }

  function getScaledImage(attachment: ImageAttachment): ImageAttachment{
    const { width, height } = scaleTo(
      attachment.width,
      attachment.height,
      IMAGE_MAX_SIZE,
    )
    return {
      ...attachment,
      x: attachment.x * scale,
      y: attachment.y * scale,
      width: width * scale,
      height: height * scale,
    }
  }

  function getUnscaledAllPageAttachments(_allPageAttachments: Attachments[]):Attachments[]{
    return _allPageAttachments.map(_pageAttachments => _pageAttachments.map(_allAttachment => getUnscaledAttachment(_allAttachment)))
  }

  function getUnscaledAttachment(attachment: Attachment):Attachment{
    if(attachment.type === AttachmentTypes.TEXT){
      attachment= getUnscaledText(attachment as TextAttachment)
    }else if(attachment.type === AttachmentTypes.IMAGE){
      attachment=  getUnscaledImage(attachment as ImageAttachment)
    }
    return attachment;
  }

  function getUnscaledText(attachment: TextAttachment): TextAttachment{
    return {
      ...attachment,
      x: attachment.x / scale,
      y: attachment.y / scale,
      width: attachment.width / scale,
      height: attachment.height / scale,
      size: attachment.size ? attachment.size / scale : undefined ,
    }
  }

  function getUnscaledImage(attachment: ImageAttachment): ImageAttachment{
    return {
      ...attachment,
      x: attachment.x / scale,
      y: attachment.y / scale,
      width: attachment.width / scale,
      height:attachment. height / scale,
    }
  }

  const handleSave = () => savePdf(getUnscaledAllPageAttachments(allPageAttachments))

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

      <Container>
        <Row style={{
          padding: '10px'
        }}>
          <Col xs={2}>
            <Navbar.Brand href="#home" style={{
              display: 'flex',
              justifyContent: 'center',
            }}>PDF-Editor</Navbar.Brand>
          </Col>
          <Col xs={8}>
            <Row>
              <Col>
                <Button style={previousButtonStyle} className='rounded-circle' variant="outline-dark" onClick={previousPage}><BsChevronLeft /></Button>
              </Col>
              <Col xs={8}>
                {isPdfLoaded && (
                  <>
                    <Button onClick={handleText}><BsChatLeftText /></Button>{" "}
                    <Button onClick={handleImgClick}><BsFillImageFill /></Button>
                  </>
                )}
              </Col>
              <Col>
                <Button style={nextPageStyle} className='rounded-circle' variant="outline-dark" onClick={nextPage}><BsChevronRight /></Button>
              </Col>
            </Row>
          </Col>
          <Col>
            <Nav>
              {isPdfLoaded && (<>
                <Nav.Link onClick={handleClick}>Upload New</Nav.Link>
                <Nav.Link onClick={handleSave}>Save</Nav.Link>
              </>)}
            </Nav>
          </Col>
        </Row>

      </Container>

      <Container fluid>
      <div style={{
        marginTop: '10px'
      }}>
        {!isPdfLoaded && (<>
        <Row className='justify-content-center'>
          <div>
            <h3>上傳一份 Pdf！</h3>
            <Button onClick={handleClick}>Upload</Button>
          </div>
        </Row>
        </>)}
        <Row>
          <Col sm={3}>
            {isPdfLoaded && (<>
            <h3>插入一些圖片吧！</h3>
            <p>這些圖片被儲存在 local 的 IndexedDB</p>
            {allAttachment
              .filter(attachment=>attachment.type === AttachmentTypes.IMAGE)
              .map(attachment=>
                <Candidate
                  key={attachment.id}
                  attachment={(attachment as ImageAttachment)}
                  addAttachment={addScaledAttachment}
                />
              )
            }
            </>)}

          </Col>
          <Col sm={9}>
            { currentPage && (
              <Scene
                currentPage={currentPage}
                dimensions={dimensions}
                setDimensions={setDimensions}
                scale={scale}
                >
                { dimensions && (
                  <PageAttachments
                    removeAttachment={remove}
                    updateAttachment={update}
                    pageDimensions={dimensions}
                    attachments={pageAttachments}
                    placements={mockPlacements()}
                    scale={scale}
                  />
                )}
              </Scene>
            )}
          </Col>
        </Row>

      </div>
      </Container>
    </div>
  );
}

export default App;
