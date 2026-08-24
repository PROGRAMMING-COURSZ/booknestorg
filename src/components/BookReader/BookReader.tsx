import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PDFDocumentProxy } from 'pdfjs-dist';
import { useDrag } from '@use-gesture/react';
import { motion, AnimatePresence } from 'motion/react';
import {
  pdfjsLib,
  initPdfWorker,
  getCachedPageImage,
  setCachedPageImage,
  fetchAndValidatePdfData,
  resolvePublicUrl,
} from '../../utils/pdfUtils';
import { Book, Bookmark, ReaderColorTheme, ReaderTransitionEffect } from '../../types/book';
import { getBookProgress, saveBookProgress } from '../../utils/readingProgress';
import {
  getBookBookmarks,
  toggleBookmark,
  deleteBookmark,
  isPageBookmarked,
} from '../../utils/bookmarkUtils';
import { ReaderToolbar } from '../ReaderToolbar/ReaderToolbar';
import { PageThumbnailItem } from './PageThumbnailItem';
import { PdfPageCanvas } from './PdfPageCanvas';
import { BookmarksDrawer } from './BookmarksDrawer';
import { LoadingState } from '../LoadingState/LoadingState';
import { ErrorState } from '../ErrorState/ErrorState';
import { useFullscreen } from '../../hooks/useFullscreen';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  X,
  BookmarkCheck,
  Bookmark as BookmarkIcon,
  Sparkles,
  Layers,
} from 'lucide-react';

interface BookReaderProps {
  book: Book;
}

export const BookReader: React.FC<BookReaderProps> = ({ book }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [stageWidth, setStageWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : 800
  );

  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(() => {
    const saved = getBookProgress(book.id);
    return saved && saved.lastPage >= 1 ? saved.lastPage : 1;
  });
  const [totalPages, setTotalPages] = useState<number>(book.pageCount || 1);
  const [resumedNotice, setResumedNotice] = useState<number | null>(null);
  const [zoom, setZoom] = useState<number>(1.0);
  const [colorTheme, setColorTheme] = useState<ReaderColorTheme>('light');
  const [transitionEffect, setTransitionEffect] = useState<ReaderTransitionEffect>('curl');
  const [showThumbnails, setShowThumbnails] = useState<boolean>(false);
  const [showBookmarksDrawer, setShowBookmarksDrawer] = useState<boolean>(false);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => getBookBookmarks(book.id));
  const [bookmarkToast, setBookmarkToast] = useState<{ message: string; type: 'add' | 'remove' } | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Page turn transition direction ('next' | 'prev' | null)
  const [turnDirection, setTurnDirection] = useState<'next' | 'prev' | null>(null);

  // Real-time touch drag offset from @use-gesture/react
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Two-page spread state (Default enabled on larger laptop/tablet screens)
  const [isTwoPageMode, setIsTwoPageMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return false;
  });

  const { isFullscreen, toggleFullscreen } = useFullscreen(containerRef);

  // Synchronize bookmarks across tabs and window updates
  useEffect(() => {
    setBookmarks(getBookBookmarks(book.id));

    const handleBookmarksUpdated = (e: CustomEvent<{ bookId: string; bookmarks: Bookmark[] }>) => {
      if (e.detail && e.detail.bookId === book.id) {
        setBookmarks(e.detail.bookmarks);
      }
    };

    window.addEventListener('booknest-bookmarks-updated' as any, handleBookmarksUpdated);
    return () => {
      window.removeEventListener('booknest-bookmarks-updated' as any, handleBookmarksUpdated);
    };
  }, [book.id]);

  // Track stage dimensions for dynamic canvas scaling
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setStageWidth(containerRef.current.clientWidth);
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Initialize and load the PDF document
  useEffect(() => {
    initPdfWorker();
    let isMounted = true;
    setIsLoadingPdf(true);
    setError(null);

    const saved = getBookProgress(book.id);
    const initialSavedPage = saved && saved.lastPage >= 1 ? saved.lastPage : 1;
    setCurrentPage(initialSavedPage);

    const version = pdfjsLib.version || '6.2.108';

    async function loadPdf() {
      try {
        const pdfBytes = await fetchAndValidatePdfData(book.file);
        if (!isMounted) return;

        const loadingTask = pdfjsLib.getDocument({
          data: pdfBytes,
          cMapUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/cmaps/`,
          cMapPacked: true,
        });

        const doc = await loadingTask.promise;
        if (!isMounted) {
          try {
            doc.cleanup();
          } catch {
            // ignore
          }
          return;
        }

        setPdfDoc(doc);
        setTotalPages(doc.numPages);
        setIsLoadingPdf(false);

        // Auto-navigate to last read page if valid
        if (saved && saved.lastPage > 1 && saved.lastPage <= doc.numPages) {
          setCurrentPage(saved.lastPage);
          setResumedNotice(saved.lastPage);
          setTimeout(() => {
            setResumedNotice(null);
          }, 4500);
        }
      } catch (err: any) {
        if (
          !isMounted ||
          err?.name === 'AbortException' ||
          err?.message?.includes('aborted') ||
          err?.message?.includes('cancelled')
        ) {
          return;
        }
        console.error('Error loading PDF document:', err);
        setError(
          err.message || 'Could not load PDF document. Please ensure demo books are generated using "npm run generate-demo".'
        );
        setIsLoadingPdf(false);
      }
    }

    loadPdf();

    return () => {
      isMounted = false;
    };
  }, [book.id, book.file]);

  // Persist current reading page to cookies and local storage
  useEffect(() => {
    if (pdfDoc && currentPage >= 1 && totalPages >= 1) {
      saveBookProgress(book.id, currentPage, totalPages);
    }
  }, [book.id, currentPage, totalPages, pdfDoc]);

  // Compute pages for 2-page spread
  const leftPageNum = isTwoPageMode
    ? currentPage % 2 === 1
      ? currentPage
      : Math.max(1, currentPage - 1)
    : currentPage;
  const rightPageNum = leftPageNum + 1;
  const hasRightPage = isTwoPageMode && rightPageNum <= totalPages;

  const singlePageMaxWidth = Math.min(stageWidth - 48, 860);
  const twoPageMaxPageWidth = Math.min((stageWidth - 110) / 2, 580);

  const isCurrentPageBookmarked = isPageBookmarked(book.id, currentPage);

  // Bookmark toggle action
  const handleToggleCurrentBookmark = useCallback(() => {
    const result = toggleBookmark(book.id, currentPage, `Page ${currentPage}`);
    setBookmarks(result.bookmarks);
    if (result.isBookmarked) {
      setBookmarkToast({
        message: `Bookmarked Page ${currentPage}`,
        type: 'add',
      });
    } else {
      setBookmarkToast({
        message: `Removed bookmark for Page ${currentPage}`,
        type: 'remove',
      });
    }
    setTimeout(() => {
      setBookmarkToast(null);
    }, 2800);
  }, [book.id, currentPage]);

  const handleDeleteBookmark = useCallback(
    (bookmarkId: string) => {
      const updated = deleteBookmark(book.id, bookmarkId);
      setBookmarks(updated);
    },
    [book.id]
  );

  // Background prefetching of adjacent pages for instant visual replacement
  useEffect(() => {
    if (!pdfDoc || isLoadingPdf) return;

    const prefetchTimer = setTimeout(async () => {
      const pagesToPrefetch = isTwoPageMode
        ? [leftPageNum - 2, leftPageNum - 1, rightPageNum + 1, rightPageNum + 2]
        : [currentPage - 1, currentPage + 1];

      for (const p of pagesToPrefetch) {
        if (p >= 1 && p <= totalPages) {
          const targetWidth = isTwoPageMode ? twoPageMaxPageWidth : singlePageMaxWidth;
          const key = `${pdfDoc?.fingerprints?.[0] || 'doc'}_${p}_${zoom.toFixed(2)}_${colorTheme}_${Math.round(targetWidth)}`;
          if (!getCachedPageImage(key)) {
            try {
              const page = await pdfDoc.getPage(p);
              const unscaledViewport = page.getViewport({ scale: 1.0 });
              const fitScale = targetWidth / unscaledViewport.width;
              const effectiveScale = Math.max(0.35, Math.min(3.0, fitScale * zoom));
              const viewport = page.getViewport({ scale: effectiveScale });

              const canvas = document.createElement('canvas');
              const dpr = Math.min(window.devicePixelRatio || 1, 2);
              canvas.width = Math.floor(viewport.width * dpr);
              canvas.height = Math.floor(viewport.height * dpr);
              const ctx = canvas.getContext('2d', { alpha: false });
              if (ctx) {
                ctx.fillStyle =
                  colorTheme === 'sepia'
                    ? '#FDFCFA'
                    : colorTheme === 'calm'
                    ? '#FBFDFB'
                    : '#FFFFFF';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                await page.render({
                  canvasContext: ctx,
                  viewport: viewport,
                  transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined,
                }).promise;
                const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
                setCachedPageImage(key, dataUrl, viewport.width, viewport.height);
              }
            } catch {
              // ignore prefetch background error
            }
          }
        }
      }
    }, 200);

    return () => clearTimeout(prefetchTimer);
  }, [
    pdfDoc,
    currentPage,
    isTwoPageMode,
    leftPageNum,
    rightPageNum,
    totalPages,
    zoom,
    colorTheme,
    singlePageMaxWidth,
    twoPageMaxPageWidth,
    isLoadingPdf,
  ]);

  // Navigation handlers
  const goToPage = useCallback(
    (pageNum: number) => {
      const clamped = Math.max(1, Math.min(totalPages, pageNum));
      if (clamped === currentPage) return;
      setTurnDirection(clamped > currentPage ? 'next' : 'prev');
      setCurrentPage(clamped);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [currentPage, totalPages]
  );

  const prevPage = useCallback(() => {
    setTurnDirection('prev');
    if (isTwoPageMode) {
      goToPage(Math.max(1, leftPageNum - 2));
    } else {
      goToPage(currentPage - 1);
    }
  }, [isTwoPageMode, leftPageNum, currentPage, goToPage]);

  const nextPage = useCallback(() => {
    setTurnDirection('next');
    if (isTwoPageMode) {
      goToPage(Math.min(totalPages, leftPageNum + 2));
    } else {
      goToPage(currentPage + 1);
    }
  }, [isTwoPageMode, leftPageNum, totalPages, currentPage, goToPage]);

  // Zoom handlers
  const handleZoomIn = () => setZoom((prev) => Math.min(2.5, +(prev + 0.15).toFixed(2)));
  const handleZoomOut = () => setZoom((prev) => Math.max(0.6, +(prev - 0.15).toFixed(2)));
  const handleResetZoom = () => setZoom(1.0);

  // Toggle Two-Page Mode
  const toggleTwoPageMode = () => {
    setIsTwoPageMode((prev) => !prev);
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = document.activeElement?.tagName;
      if (target === 'INPUT' || target === 'TEXTAREA' || target === 'SELECT') {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
        case 'PageUp':
        case 'h':
          e.preventDefault();
          prevPage();
          break;
        case 'ArrowRight':
        case 'PageDown':
        case 'l':
        case ' ':
          e.preventDefault();
          nextPage();
          break;
        case '+':
        case '=':
          e.preventDefault();
          handleZoomIn();
          break;
        case '-':
        case '_':
          e.preventDefault();
          handleZoomOut();
          break;
        case '0':
          e.preventDefault();
          handleResetZoom();
          break;
        case 'b':
        case 'B':
          e.preventDefault();
          handleToggleCurrentBookmark();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevPage, nextPage, toggleFullscreen, handleToggleCurrentBookmark]);

  // Touch & Mouse Drag Gesture Library Integration with @use-gesture/react
  const bindDrag = useDrag(
    ({ active, movement: [mx, my], velocity: [vx], direction: [dx], cancel, first }) => {
      // If the user's initial motion is mostly vertical, let native scrolling work and cancel horizontal gesture
      if (first && Math.abs(my) > Math.abs(mx) * 1.25) {
        cancel();
        return;
      }

      if (active) {
        setIsDragging(true);
        // Rubber-band resistance at boundaries (first or last page)
        const isAtStart = currentPage <= 1 && mx > 0;
        const isAtEnd =
          (isTwoPageMode ? leftPageNum + 2 > totalPages : currentPage >= totalPages) && mx < 0;
        const effectiveOffset = isAtStart || isAtEnd ? mx * 0.22 : mx;
        setDragOffset(effectiveOffset);
      } else {
        setIsDragging(false);
        // Swipe threshold: 45px drag displacement or flick velocity > 0.35
        const canGoNext = isTwoPageMode ? leftPageNum + 1 < totalPages : currentPage < totalPages;
        const canGoPrev = currentPage > 1;

        const isSwipeNext = (mx < -45 || (vx > 0.35 && dx < 0)) && canGoNext;
        const isSwipePrev = (mx > 45 || (vx > 0.35 && dx > 0)) && canGoPrev;

        if (isSwipeNext) {
          nextPage();
        } else if (isSwipePrev) {
          prevPage();
        }

        setDragOffset(0);
      }
    },
    {
      filterTaps: true,
      axis: 'x',
      preventScroll: true,
      pointer: { touch: true, mouse: false },
    }
  );

  // Dynamic Smooth Page Turn & Slide-Out / Page-Curl Animation Variants
  const getPageVariants = () => {
    if (transitionEffect === 'slide') {
      return {
        initial: (dir: 'next' | 'prev' | null) => ({
          x: dir === 'next' ? '80%' : dir === 'prev' ? '-80%' : '0%',
          opacity: 0.6,
          scale: 0.96,
          rotate: dir === 'next' ? 1.5 : dir === 'prev' ? -1.5 : 0,
        }),
        animate: {
          x: '0%',
          opacity: 1,
          scale: 1,
          rotate: 0,
          transition: {
            type: 'spring',
            stiffness: 280,
            damping: 28,
            mass: 0.9,
          },
        },
        exit: (dir: 'next' | 'prev' | null) => ({
          x: dir === 'next' ? '-90%' : dir === 'prev' ? '90%' : '0%',
          opacity: 0,
          scale: 0.94,
          rotate: dir === 'next' ? -2.5 : dir === 'prev' ? 2.5 : 0,
          transition: {
            duration: 0.22,
            ease: [0.32, 0, 0.67, 0],
          },
        }),
      };
    }

    if (transitionEffect === 'fade') {
      return {
        initial: () => ({
          opacity: 0.1,
          scale: 0.98,
        }),
        animate: {
          opacity: 1,
          scale: 1,
          transition: {
            duration: 0.22,
            ease: 'easeOut',
          },
        },
        exit: () => ({
          opacity: 0,
          scale: 0.98,
          transition: {
            duration: 0.16,
            ease: 'easeIn',
          },
        }),
      };
    }

    // Default 'curl' (3D Page Curl with Paper Lift & Depth)
    return {
      initial: (dir: 'next' | 'prev' | null) => ({
        x: dir === 'next' ? 65 : dir === 'prev' ? -65 : 0,
        rotateY: dir === 'next' ? 28 : dir === 'prev' ? -28 : 0,
        transformOrigin: dir === 'next' ? 'right center' : 'left center',
        opacity: 0.5,
        scale: 0.96,
      }),
      animate: {
        x: 0,
        rotateY: 0,
        opacity: 1,
        scale: 1,
        transition: {
          type: 'spring',
          stiffness: 260,
          damping: 25,
          mass: 0.85,
        },
      },
      exit: (dir: 'next' | 'prev' | null) => ({
        x: dir === 'next' ? -85 : dir === 'prev' ? 85 : 0,
        rotateY: dir === 'next' ? -38 : dir === 'prev' ? 38 : 0,
        transformOrigin: dir === 'next' ? 'left center' : 'right center',
        opacity: 0,
        scale: 0.94,
        transition: {
          duration: 0.24,
          ease: [0.4, 0, 0.2, 1],
        },
      }),
    };
  };

  const pageVariants = getPageVariants();

  // Theme styling definitions
  const themeBgClasses = {
    light: 'bg-[#fdfdfa] text-[#2d2d2b]',
    sepia: 'bg-[#f5ebd7] text-[#2d2d2b]',
    calm: 'bg-[#f0f5ee] text-[#243324]',
  };

  const pageContainerThemes = {
    light: 'bg-white border-[#e5e5de] shadow-sm',
    sepia: 'bg-[#fdfaf3] border-[#dec8a7] shadow-sm sepia-[0.08]',
    calm: 'bg-[#f7faf6] border-[#d5e2d5] shadow-sm',
  };

  if (isLoadingPdf) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <LoadingState type="reader" message={`Opening "${book.title}"...`} />
      </div>
    );
  }

  if (error || !pdfDoc) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <ErrorState
          title="Could not open this PDF"
          message={error || 'Failed to load PDF document'}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  // Live drag visual transform for interactive touch responsiveness
  const liveDragStyle = isDragging
    ? {
        transform: `translateX(${dragOffset * 0.5}px) rotate(${dragOffset * 0.015}deg)`,
        transition: 'none',
      }
    : undefined;

  return (
    <div
      ref={containerRef}
      id="booknest-reader-container"
      className={`min-h-screen flex flex-col transition-colors duration-200 relative ${themeBgClasses[colorTheme]}`}
    >
      {/* Top Main Reader Toolbar */}
      <ReaderToolbar
        bookTitle={book.title}
        bookAuthor={book.author}
        bookFilename={book.filename}
        pdfUrl={book.file}
        currentPage={currentPage}
        totalPages={totalPages}
        zoom={zoom}
        isFullscreen={isFullscreen}
        colorTheme={colorTheme}
        transitionEffect={transitionEffect}
        showThumbnailsDrawer={showThumbnails}
        showBookmarksDrawer={showBookmarksDrawer}
        isCurrentPageBookmarked={isCurrentPageBookmarked}
        bookmarkCount={bookmarks.length}
        isTwoPageMode={isTwoPageMode}
        onPageChange={goToPage}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        onToggleFullscreen={toggleFullscreen}
        onThemeChange={setColorTheme}
        onTransitionEffectChange={setTransitionEffect}
        onToggleThumbnails={() => {
          setShowThumbnails(!showThumbnails);
          if (!showThumbnails) setShowBookmarksDrawer(false);
        }}
        onToggleBookmarksDrawer={() => {
          setShowBookmarksDrawer(!showBookmarksDrawer);
          if (!showBookmarksDrawer) setShowThumbnails(false);
        }}
        onToggleBookmark={handleToggleCurrentBookmark}
        onToggleTwoPageMode={toggleTwoPageMode}
      />

      {/* Bookmarks Slide-Out Drawer */}
      <BookmarksDrawer
        isOpen={showBookmarksDrawer}
        onClose={() => setShowBookmarksDrawer(false)}
        bookmarks={bookmarks}
        currentPage={currentPage}
        colorTheme={colorTheme}
        onSelectBookmark={(pageNum) => {
          goToPage(pageNum);
        }}
        onDeleteBookmark={handleDeleteBookmark}
        onAddCurrentPageBookmark={handleToggleCurrentBookmark}
        isCurrentPageBookmarked={isCurrentPageBookmarked}
      />

      {/* Floating Bookmark Toast Feedback */}
      <AnimatePresence>
        {bookmarkToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.92 }}
            id="bookmark-toast-notification"
            className="fixed top-16 right-4 sm:right-8 z-50 px-4 py-2.5 rounded-full bg-[#5A5A40] text-white shadow-xl flex items-center gap-2.5 text-xs font-semibold backdrop-blur-xs border border-white/20"
          >
            {bookmarkToast.type === 'add' ? (
              <BookmarkCheck className="w-4 h-4 text-[#dec8a7]" />
            ) : (
              <BookmarkIcon className="w-4 h-4 text-white/70" />
            )}
            <span>{bookmarkToast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Reader Stage Area with Touch Gestures & 3D Page Turn Stage */}
      <div className="flex-1 flex relative overflow-hidden page-turn-stage">
        {/* Thumbnails Sidebar Drawer */}
        {showThumbnails && (
          <aside
            id="reader-thumbnails-sidebar"
            className={`w-64 sm:w-72 border-r flex flex-col z-30 shrink-0 ${
              colorTheme === 'calm'
                ? 'bg-[#e7f0e5] border-[#d5e2d5]'
                : colorTheme === 'sepia'
                ? 'bg-[#f5ebd7] border-[#dec8a7]'
                : 'bg-[#f5f5f0] border-[#e5e5de]'
            }`}
          >
            <div className="p-3.5 border-b border-inherit flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#5A5A40]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#5A5A40]">
                  Pages ({totalPages})
                </span>
              </div>
              <button
                type="button"
                id="close-thumbnails-btn"
                onClick={() => setShowThumbnails(false)}
                className="p-1 rounded-full text-[#8c8c82] hover:text-[#2d2d2b] hover:bg-[#e5e5de]/50 transition-colors cute-btn cursor-pointer"
                aria-label="Close thumbnails sidebar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                <PageThumbnailItem
                  key={pNum}
                  pdfDoc={pdfDoc}
                  pageNum={pNum}
                  isActive={
                    isTwoPageMode
                      ? pNum === leftPageNum || pNum === rightPageNum
                      : pNum === currentPage
                  }
                  onSelect={(selected) => {
                    goToPage(selected);
                  }}
                />
              ))}
            </div>
          </aside>
        )}

        {/* Center PDF Stage with @use-gesture/react Swipe & Cool Page Curl / Slide-out Transitions */}
        <main
          {...bindDrag()}
          id="reader-canvas-stage"
          className="flex-1 overflow-auto flex flex-col items-center justify-start p-3 sm:p-6 lg:p-8 min-h-0 relative select-none cursor-grab active:cursor-grabbing touch-pan-y"
        >
          {/* Quick prev/next floating buttons for desktop/tablets */}
          <button
            type="button"
            id="floating-prev-btn"
            onClick={prevPage}
            disabled={currentPage <= 1}
            className="hidden md:flex fixed left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full items-center justify-center shadow-lg border border-[#e5e5de] bg-white/95 text-[#5A5A40] hover:bg-[#f5f5f0] hover:text-[#2d2d2b] cute-btn disabled:opacity-0 disabled:pointer-events-none cursor-pointer"
            aria-label="Previous Page"
            title="Previous Page (Left Arrow or Swipe Right)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            type="button"
            id="floating-next-btn"
            onClick={nextPage}
            disabled={currentPage >= totalPages}
            className="hidden md:flex fixed right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full items-center justify-center shadow-lg border border-[#e5e5de] bg-white/95 text-[#5A5A40] hover:bg-[#f5f5f0] hover:text-[#2d2d2b] cute-btn disabled:opacity-0 disabled:pointer-events-none cursor-pointer"
            aria-label="Next Page"
            title="Next Page (Right Arrow or Swipe Left)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Interactive Touch Drag Swipe Feedback Cue */}
          {isDragging && Math.abs(dragOffset) > 20 && (
            <div
              id="swipe-hint-indicator"
              className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-[#5A5A40]/95 text-white text-xs font-semibold shadow-xl backdrop-blur-xs flex items-center gap-2 pointer-events-none animate-fade-in"
            >
              {dragOffset < 0 ? (
                <>
                  <span>
                    Turn to Page{' '}
                    <strong>{isTwoPageMode ? leftPageNum + 2 : currentPage + 1}</strong>
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#dec8a7]" />
                </>
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4 text-[#dec8a7]" />
                  <span>
                    Turn to Page{' '}
                    <strong>{isTwoPageMode ? Math.max(1, leftPageNum - 2) : currentPage - 1}</strong>
                  </span>
                </>
              )}
            </div>
          )}

          {/* Resumed from last read page notice banner */}
          {resumedNotice && (
            <div
              id="reader-resumed-notice"
              className="mb-4 inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#5A5A40] text-[#fdfdfa] text-xs shadow-md animate-fade-in transition-all"
            >
              <BookmarkCheck className="w-4 h-4 text-[#dec8a7]" />
              <span>
                Resumed reading from <strong>Page {resumedNotice}</strong> of {totalPages}
              </span>
              <button
                type="button"
                id="reader-jump-p1-btn"
                onClick={() => {
                  goToPage(1);
                  setResumedNotice(null);
                }}
                className="ml-2 text-[11px] underline font-medium hover:text-[#dec8a7] transition-colors cursor-pointer"
              >
                Go to Page 1
              </button>
              <button
                type="button"
                onClick={() => setResumedNotice(null)}
                className="p-0.5 rounded-full hover:bg-white/20 transition-colors ml-1 cursor-pointer"
                aria-label="Dismiss notice"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Animated Page Container with Smooth Visual Replacement */}
          <div
            className="w-full flex flex-col items-center justify-center"
            style={liveDragStyle}
          >
            <AnimatePresence mode="popLayout" custom={turnDirection}>
              {isTwoPageMode ? (
                /* TWO-PAGE SPREAD VIEW (Open Book with 3D Center Spine & Page-Turn Shading) */
                <motion.div
                  key={`spread-${leftPageNum}`}
                  custom={turnDirection}
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  id="pdf-two-page-spread-container"
                  className="book-spread-container relative w-full flex flex-col items-center max-w-6xl page-turn-card"
                >
                  <div
                    id="pdf-open-book-spread"
                    className={`book-spread-book flex flex-row items-stretch justify-center relative overflow-hidden border ${
                      colorTheme === 'calm'
                        ? 'bg-[#f7faf6] border-[#d5e2d5]'
                        : colorTheme === 'sepia'
                        ? 'bg-[#fcf8f0] border-[#dec8a7]'
                        : 'bg-white border-[#e5e5de]'
                    }`}
                  >
                    {/* 3D Center Spine Crease & Fold Gradient */}
                    <div className="book-spine-crease" aria-hidden="true" />

                    {/* Left Page of Open Book */}
                    <div
                      id="book-left-page-container"
                      className="book-page-left flex-1 flex flex-col items-center justify-between p-2 sm:p-4 bg-transparent border-r border-[#e5e5de]/50 relative"
                    >
                      {isDragging && dragOffset > 0 && (
                        <div className="page-curl-shadow page-curl-shadow-left" />
                      )}

                      <div className="w-full flex items-center justify-center overflow-hidden">
                        <PdfPageCanvas
                          pdfDoc={pdfDoc}
                          pageNum={leftPageNum}
                          zoom={zoom}
                          colorTheme={colorTheme}
                          maxWidth={twoPageMaxPageWidth}
                          id="pdf-canvas-left"
                          className="shadow-2xs rounded-l-md"
                        />
                      </div>
                      <div className="w-full mt-2 pt-1 border-t border-[#e5e5de]/40 flex items-center justify-between px-2 text-[10px] text-[#8c8c82] font-mono">
                        <span className="truncate max-w-[150px]">{book.title}</span>
                        <div className="flex items-center gap-1">
                          {isPageBookmarked(book.id, leftPageNum) && (
                            <BookmarkIcon className="w-2.5 h-2.5 fill-[#dec8a7] text-[#5A5A40]" />
                          )}
                          <span>Page {leftPageNum}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Page of Open Book */}
                    <div
                      id="book-right-page-container"
                      className="book-page-right flex-1 flex flex-col items-center justify-between p-2 sm:p-4 bg-transparent relative"
                    >
                      {isDragging && dragOffset < 0 && (
                        <div className="page-curl-shadow page-curl-shadow-right" />
                      )}

                      {hasRightPage ? (
                        <>
                          <div className="w-full flex items-center justify-center overflow-hidden">
                            <PdfPageCanvas
                              pdfDoc={pdfDoc}
                              pageNum={rightPageNum}
                              zoom={zoom}
                              colorTheme={colorTheme}
                              maxWidth={twoPageMaxPageWidth}
                              id="pdf-canvas-right"
                              className="shadow-2xs rounded-r-md"
                            />
                          </div>
                          <div className="w-full mt-2 pt-1 border-t border-[#e5e5de]/40 flex items-center justify-between px-2 text-[10px] text-[#8c8c82] font-mono">
                            <div className="flex items-center gap-1">
                              {isPageBookmarked(book.id, rightPageNum) && (
                                <BookmarkIcon className="w-2.5 h-2.5 fill-[#dec8a7] text-[#5A5A40]" />
                              )}
                              <span>Page {rightPageNum}</span>
                            </div>
                            <span className="truncate max-w-[150px]">
                              {book.author || 'BookNest'}
                            </span>
                          </div>
                        </>
                      ) : (
                        /* Blank end page if book ends on odd page */
                        <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8 text-[#8c8c82]">
                          <div className="w-12 h-12 rounded-full bg-[#f5f5f0] flex items-center justify-center mb-3 text-[#5A5A40]">
                            <BookmarkCheck className="w-6 h-6" />
                          </div>
                          <p className="font-serif-book italic text-sm text-[#5A5A40]">
                            End of Book
                          </p>
                          <p className="text-xs text-[#8c8c82] mt-1">Thank you for reading</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* SINGLE PAGE VIEW with Smooth Page Curl / Slide-Out Animations */
                <motion.div
                  key={`page-${currentPage}`}
                  custom={turnDirection}
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  id="pdf-rendered-page-wrapper"
                  className={`relative rounded-2xl p-2 sm:p-4 overflow-hidden transition-colors duration-150 page-turn-card ${pageContainerThemes[colorTheme]}`}
                >
                  {/* Bookmark Ribbon on top-right of page if bookmarked */}
                  {isCurrentPageBookmarked && (
                    <div
                      id="page-bookmark-ribbon"
                      className="absolute top-0 right-6 z-30 w-7 h-10 bg-[#5A5A40] text-white shadow-md flex items-center justify-center rounded-b-sm border-t-0 border border-white/30"
                      title="This page is bookmarked"
                    >
                      <BookmarkIcon className="w-4 h-4 fill-[#dec8a7] text-white" />
                    </div>
                  )}

                  {/* Dynamic Shading on Page Curl */}
                  {transitionEffect === 'curl' && turnDirection && (
                    <div
                      className={`page-curl-layer ${
                        turnDirection === 'next'
                          ? 'page-curl-layer-next'
                          : 'page-curl-layer-prev'
                      }`}
                    />
                  )}

                  {isDragging && (
                    <div
                      className={`page-curl-shadow ${
                        dragOffset < 0 ? 'page-curl-shadow-right' : 'page-curl-shadow-left'
                      }`}
                      style={{ opacity: Math.min(1, Math.abs(dragOffset) / 60) }}
                    />
                  )}

                  <PdfPageCanvas
                    pdfDoc={pdfDoc}
                    pageNum={currentPage}
                    zoom={zoom}
                    colorTheme={colorTheme}
                    maxWidth={singlePageMaxWidth}
                    id="pdf-active-canvas"
                    className="rounded-xl shadow-xs"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Cozy bottom reading indicator info */}
          <div className="mt-5 mb-20 sm:mb-8 text-center">
            <p className="text-xs text-[#8c8c82] font-medium flex items-center justify-center gap-2">
              <span className="font-bold text-[#5A5A40]">
                {isTwoPageMode
                  ? `Pages ${leftPageNum}${hasRightPage ? ` – ${rightPageNum}` : ''} of ${totalPages}`
                  : `Page ${currentPage} of ${totalPages}`}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Layers className="w-3 h-3" />
                Swipe, click or use arrow keys ({transitionEffect === 'curl' ? '3D Page Curl' : 'Slide-Out'} transition)
              </span>
            </p>
          </div>
        </main>
      </div>

      {/* Mobile Sticky Bottom Floating Controls */}
      <nav
        id="reader-mobile-bottom-bar"
        className={`sm:hidden fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-md px-3 py-2 flex items-center justify-between ${
          colorTheme === 'calm'
            ? 'bg-[#f0f5ee]/95 border-[#d5e2d5] text-[#243324]'
            : colorTheme === 'sepia'
            ? 'bg-[#f5ebd7]/95 border-[#dec8a7] text-[#2d2d2b]'
            : 'bg-[#fdfdfa]/95 border-[#e5e5de] text-[#2d2d2b]'
        }`}
      >
        <button
          type="button"
          id="mobile-prev-page-btn"
          onClick={prevPage}
          disabled={currentPage <= 1}
          className="p-2 rounded-full bg-[#f5f5f0] disabled:opacity-30 text-[#5A5A40] active:scale-95 transition-transform cute-btn cursor-pointer"
          aria-label="Previous Page"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold font-mono">
            {isTwoPageMode
              ? `${leftPageNum}-${hasRightPage ? rightPageNum : leftPageNum}`
              : currentPage}{' '}
            / {totalPages}
          </span>
          <button
            type="button"
            id="mobile-thumbs-btn"
            onClick={() => {
              setShowThumbnails(!showThumbnails);
              if (!showThumbnails) setShowBookmarksDrawer(false);
            }}
            className="px-2 py-1 text-xs font-medium rounded-full bg-[#f5f5f0] text-[#5A5A40] cute-btn cursor-pointer"
            aria-label="Toggle Page Thumbnails"
          >
            Pages
          </button>
          <button
            type="button"
            id="mobile-bookmarks-btn"
            onClick={() => {
              setShowBookmarksDrawer(!showBookmarksDrawer);
              if (!showBookmarksDrawer) setShowThumbnails(false);
            }}
            className={`px-2 py-1 text-xs font-medium rounded-full cute-btn cursor-pointer flex items-center gap-1 ${
              bookmarks.length > 0
                ? 'bg-[#5A5A40] text-white'
                : 'bg-[#f5f5f0] text-[#5A5A40]'
            }`}
            aria-label="Toggle Bookmarks Drawer"
          >
            <BookmarkIcon className="w-3 h-3 fill-current" />
            <span>{bookmarks.length}</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            id="mobile-bookmark-toggle-btn"
            onClick={handleToggleCurrentBookmark}
            className={`p-2 rounded-full cute-btn cursor-pointer ${
              isCurrentPageBookmarked
                ? 'bg-[#5A5A40] text-[#dec8a7]'
                : 'bg-[#f5f5f0] text-[#5A5A40]'
            }`}
            title="Bookmark this page"
            aria-label="Bookmark this page"
          >
            <BookmarkIcon className={`w-4 h-4 ${isCurrentPageBookmarked ? 'fill-current' : ''}`} />
          </button>

          <button
            type="button"
            id="mobile-zoom-out-btn"
            onClick={handleZoomOut}
            disabled={zoom <= 0.6}
            className="p-2 rounded-full bg-[#f5f5f0] disabled:opacity-30 text-[#5A5A40] cute-btn cursor-pointer"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <button
            type="button"
            id="mobile-zoom-in-btn"
            onClick={handleZoomIn}
            disabled={zoom >= 2.5}
            className="p-2 rounded-full bg-[#f5f5f0] disabled:opacity-30 text-[#5A5A40] cute-btn cursor-pointer"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            type="button"
            id="mobile-next-page-btn"
            onClick={nextPage}
            disabled={currentPage >= totalPages}
            className="p-2 rounded-full bg-[#5A5A40] text-white disabled:opacity-30 active:scale-95 transition-transform cute-btn cursor-pointer"
            aria-label="Next Page"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </nav>
    </div>
  );
};
