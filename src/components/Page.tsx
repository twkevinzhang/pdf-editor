import React, { useEffect, useRef, useState } from 'react';

interface Props {
  page: any;
  dimensions?: Dimensions;
  setDimensions?: ({ width, height }: Dimensions) => void;
}

export const Page = ({ page, dimensions, setDimensions }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [width, setWidth] = useState(dimensions?.width || 0);
  const [height, setHeight] = useState(dimensions?.height || 0);

  useEffect(() => {
    renderPage();
    async function renderPage(){
      const _page = await page;
      const canvas = canvasRef.current
      if (_page) {
        const context = canvas?.getContext('2d');
        const viewport = _page.getViewport({ scale: 1 });

        setWidth(viewport.width);
        setHeight(viewport.height);

        if (context) {
          await _page.render({
            canvasContext: canvas?.getContext('2d'),
            viewport,
          }).promise;

          const newDimensions = {
            width: viewport.width,
            height: viewport.height,
          };

          if(setDimensions) setDimensions(newDimensions as Dimensions);
        }
      }
    }
  }, [page, setDimensions]);

  return (
    <div>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
