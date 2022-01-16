import React, { useEffect, useState } from 'react';
import './App.css';
import { Pdf, usePdf } from './hooks/usePdf';
import { Button, Col, Container, Nav, Row } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useAttachments } from './hooks/useAttachments';
import { AttachmentTypes } from './entities';
import { Attachments as PageAttachments } from './components/Attachments';
import { UploadTypes, useUploader } from './hooks/useUploader';
import uuid from 'uuid';
import { CandidateImage } from './containers/CandidateImage';
import { useDrawer } from './hooks/useDrawer';

import { BsChevronLeft, BsChevronRight, BsFillCloudDownloadFill, BsFillCloudUploadFill } from 'react-icons/bs';
import { mockPlacements } from './models/MockPlacements';
import { Scene } from './containers/Scene';
import { scaleTo } from './utils/helpers';
import { CandidateText } from './containers/CandidateText';
import { saveImageFile } from './utils/StorageService';
import ReactInputPosition from "react-input-position";

const App: React.FC<{}> = () => {
  const [ scale, setScale ] = useState(1.65);
  const [ drawerWidth, setDrawerWidth ] = useState(350);
  const [ handleAttachment, setHandleAttachment ] = useState<Attachment | undefined>();
  const { file, setPdf, pageIndex, isMultiPage, isFirstPage, isLastPage, currentPage, isSaving, savePdf, previousPage, nextPage, setDimensions, name, dimensions } = usePdf();
  const { allCandidates, removeAllImages, refresh: refreshDrawer } = useDrawer();
  const { addAttachment, allPageAttachments, pageAttachments, resetAttachments, updateAttachments, removeAttachments, setPageIndex } = useAttachments();
  const isPdfLoaded = !!file

  const { inputRef: pdfRef, handleUpload: handlePdfUpload, fileOnChange: pdfOnChange } = useUploader({
    use: UploadTypes.PDF,
    afterUploadPdf: (uploaded: Pdf)=>{
      setPdf(uploaded);
      const numberOfPages = uploaded.pages.length;
      resetAttachments(numberOfPages)
    }
  });

  const { inputRef: imgRef, handleUpload: handleImageUpload, fileOnChange: imgOnChange } = useUploader({
    use: UploadTypes.IMAGE,
    afterUploadImage: (attachment: ImageAttachment)=>{
        saveImageFile(attachment.file, attachment.id).then(()=>refreshDrawer());
        addAttachment(attachment)
      }
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
    addAttachment(newTextAttachment)
  };

  const handleSave = () => savePdf(allPageAttachments)

  const message =
    handleAttachment? "點擊 PDF 的某處來新增附件": "這些圖片被儲存在 local 的 IndexedDB。"

  const hiddenInputs = (
    <>
      <input
        ref={pdfRef}
        type="file"
        accept="application/pdf"
        onChange={pdfOnChange}
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

      <Container fluid>
      <div style={{
        marginTop: '10px'
      }}>
        {!isPdfLoaded && (<>
        <Row className='justify-content-center mt-lg-5'>
          <div>
            <h3>上傳一份 Pdf！</h3>
            <Button onClick={handlePdfUpload}><BsFillCloudUploadFill /> Upload</Button>
          </div>
        </Row>
        </>)}
        <Row>
          <Col style={{
            position: 'fixed',
            width: drawerWidth,
          }}>
            {isPdfLoaded && (<>
              <h3>加入附件</h3>
              <p>
                {message}
                <Button variant="link" onClick={removeAllImages}>清空圖片</Button>
              </p>
              <CandidateText scale={scale} onClick={handleText}>
                新增文字
              </CandidateText>
              {allCandidates
                .filter(attachment=>attachment.type === AttachmentTypes.IMAGE)
                .map(attachment=>{
                  return <CandidateImage
                    key={attachment.id}
                    active={handleAttachment?.id === attachment.id}
                    onClick={()=>{
                      setHandleAttachment(attachment)
                    }}
                    attachment={attachment as ImageAttachment}
                    scale={scale}
                  />
                })
              }
              <CandidateText scale={scale} onClick={handleImageUpload}>
                上傳圖片
              </CandidateText>
            </>)}
          </Col>
          <Col style={{
            position: 'relative',
            left: drawerWidth,
          }}>
            <div className="pt-2 pb-2 d-flex justify-content-between" style={{
              width: dimensions?.width || 0,
            }}>
              <div>
                <Button style={previousButtonStyle} className='rounded-circle' variant="outline-dark" onClick={previousPage}><BsChevronLeft /></Button>
              </div>
              <div>
                {isPdfLoaded && (<Nav className="justify-content-center">
                  <Nav.Link onClick={handlePdfUpload}><BsFillCloudUploadFill /> Upload New</Nav.Link>
                  <Nav.Link onClick={handleSave}><BsFillCloudDownloadFill /> Save </Nav.Link>
                </Nav>)}
              </div>

              <div>
                <Button style={nextPageStyle} className='rounded-circle' variant="outline-dark" onClick={nextPage}><BsChevronRight /></Button>
              </div>
            </div>
            { currentPage && (
              <ReactInputPosition
                trackPassivePosition={true}
                cursorStyle={handleAttachment ? undefined : 'default'}
              >
              <Scene
                currentPage={currentPage}
                dimensions={dimensions}
                setDimensions={setDimensions}
                scale={scale}
                handleAttachment={handleAttachment}
                addAttachment={addAttachment}
                >
                { dimensions && (
                  <PageAttachments
                    removeAttachment={removeAttachments}
                    updateAttachment={updateAttachments}
                    pageDimensions={dimensions}
                    attachments={pageAttachments}
                    placements={mockPlacements()}
                    scale={scale}
                  />
                )}
              </Scene>
              </ReactInputPosition>
            )}
          </Col>
        </Row>

      </div>
      </Container>
    </div>
  );
}

export default App;
