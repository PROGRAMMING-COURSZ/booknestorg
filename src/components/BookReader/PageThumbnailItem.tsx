import React, { useEffect, useRef, useState } from 'react';
import { PDFDocumentProxy } from 'pdfjs-dist';

interface PageThumbnailItemProps {
  pdfDoc: PDFDocumentProxy | null;
  pageNum: number;
  isActive: boolean;
  onSelect: (page: number) => void;
}

export const PageThumbnailItem: React.FC<PageThumbnailItemProps> = ({
  pdfDoc,
  pageNum,
  isActive,
  onSelect,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current || rendered) return;

    let isMounted = true;

    pdfDoc.getPage(pageNum).then((page) => {
      if (!isMounted || !canvasRef.current) return;

      const viewport = page.getViewport({ scale: 0.25 });
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d', { alpha: false });

      if (!context) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      context.fillStyle = '#FFFFFF';
      context.fillRect(0, 0, viewport.width, viewport.height);

      page
        .render({
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        })
        .promise.then(() => {
          if (isMounted) setRendered(true);
        })
        .catch(() => {});
    });

    return () => {
      isMounted = false;
    };
  }, [pdfDoc, pageNum, rendered]);

  return (
    <button
      type="button"
      id={`page-thumb-${pageNum}`}
      onClick={() => onSelect(pageNum)}
      className={`group w-full flex flex-col items-center p-2 rounded-2xl border transition-all text-left cursor-pointer ${
        isActive
          ? 'bg-[#f0f0ea] border-[#5A5A40] ring-2 ring-[#5A5A40]/30 shadow-xs'
          : 'bg-white hover:bg-[#f5f5f0] border-[#e5e5de]'
      }`}
    >
      <div className="w-full aspect-[1/1.4] bg-[#f5f5f0] rounded-xl overflow-hidden flex items-center justify-center shadow-2xs border border-[#e5e5de]/60">
        <canvas ref={canvasRef} className="w-full h-full object-contain" />
      </div>
      <span
        className={`mt-2 text-[11px] font-medium ${
          isActive ? 'text-[#5A5A40] font-bold' : 'text-[#8c8c82] group-hover:text-[#2d2d2b]'
        }`}
      >
        Page {pageNum}
      </span>
    </button>
  );
};
