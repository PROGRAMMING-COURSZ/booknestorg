import React, { useRef, useEffect, useState } from 'react';
import { PDFDocumentProxy, RenderTask } from 'pdfjs-dist';
import { ReaderColorTheme } from '../../types/book';
import { getCachedPageImage, setCachedPageImage } from '../../utils/pdfUtils';

interface PdfPageCanvasProps {
  pdfDoc: PDFDocumentProxy;
  pageNum: number;
  zoom: number;
  colorTheme: ReaderColorTheme;
  maxWidth?: number;
  className?: string;
  id?: string;
  onRenderStart?: () => void;
  onRenderComplete?: () => void;
}

export const PdfPageCanvas: React.FC<PdfPageCanvasProps> = ({
  pdfDoc,
  pageNum,
  zoom,
  colorTheme,
  maxWidth,
  className = '',
  id,
  onRenderStart,
  onRenderComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cacheKey = `${pdfDoc?.fingerprints?.[0] || 'doc'}_${pageNum}_${zoom.toFixed(2)}_${colorTheme}_${Math.round(maxWidth || 800)}`;
  
  const initialCached = getCachedPageImage(cacheKey);
  const [cachedSnapshot, setCachedSnapshot] = useState<string | null>(initialCached?.dataUrl || null);
  const [isRendering, setIsRendering] = useState<boolean>(!initialCached);
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let currentRenderTask: RenderTask | null = null;

    const render = async () => {
      if (!pdfDoc || pageNum < 1 || pageNum > pdfDoc.numPages) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const cached = getCachedPageImage(cacheKey);
      if (cached) {
        setCachedSnapshot(cached.dataUrl);
      }

      setRenderError(null);
      onRenderStart?.();

      try {
        const page = await pdfDoc.getPage(pageNum);
        if (!isMounted || !canvasRef.current) return;

        const context = canvas.getContext('2d', { alpha: false });
        if (!context) return;

        const unscaledViewport = page.getViewport({ scale: 1.0 });
        const availableWidth =
          maxWidth ||
          (canvas.parentElement?.clientWidth
            ? Math.min(canvas.parentElement.clientWidth, 860)
            : Math.min(window.innerWidth - 32, 860));

        const fitScale = availableWidth / unscaledViewport.width;
        const effectiveScale = Math.max(0.35, Math.min(3.0, fitScale * zoom));
        const viewport = page.getViewport({ scale: effectiveScale });

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        // Reset canvas transform matrix
        context.setTransform(1, 0, 0, 1, 0, 0);

        // Warm background fill
        if (colorTheme === 'sepia') {
          context.fillStyle = '#FDFCFA';
        } else if (colorTheme === 'calm') {
          context.fillStyle = '#FBFDFB';
        } else {
          context.fillStyle = '#FFFFFF';
        }
        context.fillRect(0, 0, canvas.width, canvas.height);

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
          transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined,
        };

        const renderTask = page.render(renderContext);
        currentRenderTask = renderTask;

        await renderTask.promise;
        if (isMounted) {
          setIsRendering(false);
          // Cache the rendered page data URL for instant zero-latency page-turns next time
          try {
            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            setCachedPageImage(cacheKey, dataUrl, viewport.width, viewport.height);
            setCachedSnapshot(dataUrl);
          } catch {
            // ignore serialization error
          }
          onRenderComplete?.();
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        const errorObj = err as { name?: string; message?: string };
        if (errorObj?.name !== 'RenderingCancelledException') {
          console.warn(`Render error on page ${pageNum}:`, err);
          setRenderError(errorObj?.message || 'Could not render page');
        }
        setIsRendering(false);
      }
    };

    render();

    return () => {
      isMounted = false;
      if (currentRenderTask) {
        try {
          currentRenderTask.cancel();
        } catch {
          // ignore cancellation exception
        }
      }
    };
  }, [pdfDoc, pageNum, zoom, colorTheme, maxWidth, cacheKey, onRenderStart, onRenderComplete]);

  return (
    <div className="relative flex items-center justify-center overflow-hidden">
      {/* If rendering for the very first time without cache, show subtle non-intrusive indicator */}
      {isRendering && !cachedSnapshot && (
        <div className="absolute inset-0 bg-[#f5f5f0]/40 backdrop-blur-2xs flex items-center justify-center z-10 rounded-lg">
          <div className="w-5 h-5 border-2 border-[#5A5A40]/30 border-t-[#5A5A40] rounded-full animate-spin" />
        </div>
      )}

      {renderError && (
        <div className="p-4 text-center text-xs text-[#8c8c82]">
          <p>Unable to display page {pageNum}</p>
        </div>
      )}

      <canvas
        ref={canvasRef}
        id={id}
        className={`block mx-auto max-w-full h-auto select-none transition-opacity duration-150 ${className}`}
      />
    </div>
  );
};
