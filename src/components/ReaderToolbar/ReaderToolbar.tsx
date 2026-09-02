import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Download,
  LayoutGrid,
  Sun,
  Coffee,
  Leaf,
  BookOpen,
  FileText,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Menu,
} from 'lucide-react';
import { ReaderColorTheme } from '../../types/book';

interface ReaderToolbarProps {
  bookTitle: string;
  bookAuthor?: string;
  bookFilename: string;
  pdfUrl: string;
  currentPage: number;
  totalPages: number;
  zoom: number;
  isFullscreen: boolean;
  colorTheme: ReaderColorTheme;
  showThumbnailsDrawer: boolean;
  showBookmarksDrawer?: boolean;
  isCurrentPageBookmarked?: boolean;
  bookmarkCount?: number;
  isTwoPageMode: boolean;
  onPageChange: (page: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onToggleFullscreen: () => void;
  onThemeChange: (theme: ReaderColorTheme) => void;
  onToggleThumbnails: () => void;
  onToggleBookmarksDrawer?: () => void;
  onToggleBookmark?: () => void;
  onToggleTwoPageMode: () => void;
  isCompleted?: boolean;
  onMarkCompleted?: () => void;
}

export const ReaderToolbar: React.FC<ReaderToolbarProps> = ({
  bookTitle,
  bookAuthor,
  bookFilename,
  pdfUrl,
  currentPage,
  totalPages,
  zoom,
  isFullscreen,
  colorTheme,
  showThumbnailsDrawer,
  showBookmarksDrawer = false,
  isCurrentPageBookmarked = false,
  bookmarkCount = 0,
  isTwoPageMode,
  onPageChange,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onToggleFullscreen,
  onThemeChange,
  onToggleThumbnails,
  onToggleBookmarksDrawer,
  onToggleBookmark,
  onToggleTwoPageMode,
  isCompleted = false,
  onMarkCompleted,
}) => {
  const [pageInput, setPageInput] = useState<string>(String(currentPage));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Keep input synced when page changes externally
  React.useEffect(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(pageInput, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      onPageChange(pageNum);
    } else {
      setPageInput(String(currentPage));
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    const cleanDownloadName = `${bookTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
    link.download = cleanDownloadName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isCalm = colorTheme === 'calm';
  const isSepia = colorTheme === 'sepia';

  const toolbarBg = isCalm
    ? 'bg-[#f0f5ee]/95 border-[#d5e2d5] text-[#243324]'
    : isSepia
    ? 'bg-[#f5ebd7]/95 border-[#dec8a7] text-[#2d2d2b]'
    : 'bg-[#fdfdfa]/95 border-[#e5e5de] text-[#2d2d2b]';

  const btnBg = isCalm
    ? 'hover:bg-[#e2ece0] text-[#3d5a3d] hover:text-[#1e2d1e]'
    : isSepia
    ? 'hover:bg-[#ead9be] text-[#5A5A40] hover:text-[#2d2d2b]'
    : 'hover:bg-[#f0f0ea] text-[#5A5A40] hover:text-[#2d2d2b]';

  return (
    <header
      id="reader-main-toolbar"
      className={`sticky top-0 z-40 w-full border-b backdrop-blur-md transition-colors duration-200 ${toolbarBg}`}
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4 h-14 flex items-center justify-between gap-2">
        {/* Left Section: Back to Library & Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 sm:flex-initial">
          <Link
            to="/"
            id="reader-back-button"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cute-btn shrink-0 ${btnBg}`}
            title="Back to BookNest Library"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden md:inline">Library</span>
          </Link>

          <div className="min-w-0 pr-2">
            <h1
              id="reader-book-title"
              className="font-serif-book font-bold text-xs sm:text-sm truncate leading-tight text-inherit"
              title={bookTitle}
            >
              {bookTitle}
            </h1>
            {bookAuthor && (
              <p className="text-[10px] text-[#8c8c82] truncate hidden sm:block">
                {bookAuthor}
              </p>
            )}
          </div>
        </div>

        {/* Center Section: Page Navigation */}
        <div className="hidden sm:flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            type="button"
            id="reader-prev-page-btn"
            onClick={() => onPageChange(currentPage - (isTwoPageMode ? 2 : 1))}
            disabled={currentPage <= 1}
            className={`p-1.5 sm:px-3 sm:py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-all cute-btn disabled:opacity-30 disabled:pointer-events-none cursor-pointer ${btnBg}`}
            aria-label="Previous Page"
            title="Previous Page (Left Arrow)"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Prev</span>
          </button>

          {/* Page Jumper Input Form */}
          <form
            onSubmit={handlePageInputSubmit}
            className="flex items-center gap-1 text-xs"
          >
            <input
              type="text"
              id="reader-page-number-input"
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onBlur={() => {
                const num = parseInt(pageInput, 10);
                if (num >= 1 && num <= totalPages) {
                  onPageChange(num);
                } else {
                  setPageInput(String(currentPage));
                }
              }}
              className={`w-10 sm:w-12 text-center py-1 rounded-full text-xs font-semibold border ${
                isCalm
                  ? 'bg-[#e5eee3] border-[#d5e2d5] text-[#243324]'
                  : isSepia
                  ? 'bg-[#ead9be] border-[#dec8a7] text-[#2d2d2b]'
                  : 'bg-[#f5f5f0] border-[#e5e5de] text-[#2d2d2b]'
              } focus:outline-none focus:ring-1 focus:ring-[#5A5A40]`}
              aria-label="Current Page Number"
            />
            <span className="text-[#8c8c82] text-xs select-none">/ {totalPages || 1}</span>
          </form>

          <button
            type="button"
            id="reader-next-page-btn"
            onClick={() => onPageChange(currentPage + (isTwoPageMode ? 2 : 1))}
            disabled={currentPage >= totalPages}
            className={`p-1.5 sm:px-3 sm:py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-all cute-btn disabled:opacity-30 disabled:pointer-events-none cursor-pointer ${btnBg}`}
            aria-label="Next Page"
            title="Next Page (Right Arrow)"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right Section: Two-Page Toggle, Zoom, Calm Themes, Thumbnails, Download & Fullscreen */}
        <div className="hidden sm:flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Two-Page Spread (Open Book Mode) Toggle for Laptop & Tablet */}
          <button
            type="button"
            id="reader-two-page-toggle-btn"
            onClick={onToggleTwoPageMode}
            className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cute-btn cursor-pointer ${
              isTwoPageMode
                ? 'bg-[#5A5A40] text-white shadow-xs'
                : `${btnBg} border border-[#e5e5de]`
            }`}
            title={isTwoPageMode ? 'Switch to Single Page View' : 'Two-Page Open Book Spread (Split View)'}
            aria-label={isTwoPageMode ? 'Single Page' : 'Two Page Spread'}
          >
            {isTwoPageMode ? (
              <>
                <BookOpen className="w-3.5 h-3.5 text-[#dec8a7]" />
                <span>2-Page View</span>
              </>
            ) : (
              <>
                <FileText className="w-3.5 h-3.5" />
                <span>1-Page View</span>
              </>
            )}
          </button>

          {/* Zoom Controls */}
          <div className="hidden lg:flex items-center gap-0.5 bg-[#f5f5f0] p-0.5 rounded-full border border-[#e5e5de]">
            <button
              type="button"
              id="reader-zoom-out-btn"
              onClick={onZoomOut}
              disabled={zoom <= 0.6}
              className={`p-1 rounded-full text-xs transition-colors disabled:opacity-40 cursor-pointer ${btnBg}`}
              title="Zoom Out (-)"
              aria-label="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              id="reader-reset-zoom-btn"
              onClick={onResetZoom}
              className={`px-2 py-0.5 text-[11px] font-mono font-semibold rounded-full transition-colors cursor-pointer ${btnBg}`}
              title="Reset Zoom (100%)"
              aria-label="Reset Zoom"
            >
              {Math.round(zoom * 100)}%
            </button>

            <button
              type="button"
              id="reader-zoom-in-btn"
              onClick={onZoomIn}
              disabled={zoom >= 2.5}
              className={`p-1 rounded-full text-xs transition-colors disabled:opacity-40 cursor-pointer ${btnBg}`}
              title="Zoom In (+)"
              aria-label="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Cute & Calm Theme Switcher (Warm Light / Cozy Sepia / Calm Sage) */}
          <div className="flex items-center gap-0.5 p-0.5 rounded-full border border-[#e5e5de] bg-[#f5f5f0]">
            <button
              type="button"
              id="theme-light-btn"
              onClick={() => onThemeChange('light')}
              className={`p-1.5 rounded-full transition-all cute-btn ${
                colorTheme === 'light'
                  ? 'bg-[#5A5A40] text-[#fdfdfa] shadow-xs'
                  : 'text-[#8c8c82] hover:text-[#2d2d2b]'
              }`}
              title="Warm Natural Linen Theme"
              aria-label="Warm Linen Theme"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              id="theme-sepia-btn"
              onClick={() => onThemeChange('sepia')}
              className={`p-1.5 rounded-full transition-all cute-btn ${
                colorTheme === 'sepia'
                  ? 'bg-[#dec8a7] text-[#2d2d2b] shadow-xs'
                  : 'text-[#8c8c82] hover:text-[#2d2d2b]'
              }`}
              title="Cozy Sepia Warm Theme"
              aria-label="Sepia Theme"
            >
              <Coffee className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              id="theme-calm-btn"
              onClick={() => onThemeChange('calm')}
              className={`p-1.5 rounded-full transition-all cute-btn ${
                colorTheme === 'calm'
                  ? 'bg-[#3d5a3d] text-[#fdfdfa] shadow-xs'
                  : 'text-[#8c8c82] hover:text-[#2d2d2b]'
              }`}
              title="Calm Sage Botanical Mode"
              aria-label="Calm Sage Theme"
            >
              <Leaf className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bookmark Current Page Button */}
          {onToggleBookmark && (
            <button
              type="button"
              id="reader-bookmark-current-btn"
              onClick={onToggleBookmark}
              className={`p-1.5 sm:px-3 sm:py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cute-btn cursor-pointer ${
                isCurrentPageBookmarked
                  ? 'bg-[#5A5A40] text-white shadow-xs'
                  : `${btnBg} border border-[#e5e5de]`
              }`}
              title={
                isCurrentPageBookmarked
                  ? `Page ${currentPage} is bookmarked (Click to remove, or press B)`
                  : `Bookmark Page ${currentPage} (Press B)`
              }
              aria-label={
                isCurrentPageBookmarked
                  ? `Remove bookmark for Page ${currentPage}`
                  : `Bookmark Page ${currentPage}`
              }
            >
              {isCurrentPageBookmarked ? (
                <>
                  <BookmarkCheck className="w-3.5 h-3.5 text-[#dec8a7]" />
                  <span className="hidden lg:inline">Bookmarked</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">Bookmark</span>
                </>
              )}
            </button>
          )}

          {/* Bookmarks Slide-Out Drawer Toggle Button with Counter Badge */}
          {onToggleBookmarksDrawer && (
            <button
              type="button"
              id="reader-bookmarks-drawer-btn"
              onClick={onToggleBookmarksDrawer}
              className={`relative p-1.5 rounded-full text-xs transition-all cute-btn cursor-pointer ${
                showBookmarksDrawer
                  ? 'bg-[#5A5A40] text-white font-semibold'
                  : btnBg
              }`}
              title="Saved Bookmarks"
              aria-label="Toggle Saved Bookmarks Drawer"
            >
              <Bookmark className={`w-4 h-4 ${bookmarkCount > 0 && !showBookmarksDrawer ? 'text-[#5A5A40] fill-[#dec8a7]' : ''}`} />
              {bookmarkCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-[#5A5A40] text-white text-[9px] font-bold flex items-center justify-center border border-white">
                  {bookmarkCount}
                </span>
              )}
            </button>
          )}

          {/* Thumbnails Sidebar / Drawer Button */}
          <button
            type="button"
            id="reader-thumbnails-btn"
            onClick={onToggleThumbnails}
            className={`p-1.5 rounded-full text-xs transition-all cute-btn cursor-pointer ${
              showThumbnailsDrawer
                ? 'bg-[#5A5A40] text-white font-semibold'
                : btnBg
            }`}
            title="Page Thumbnails Overview"
            aria-label="Toggle Page Thumbnails"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>

          {/* Download Original PDF */}
          <button
            type="button"
            id="reader-download-btn"
            onClick={handleDownload}
            className={`p-1.5 sm:px-3 sm:py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cute-btn cursor-pointer ${btnBg}`}
            title={`Download original ${bookFilename}`}
            aria-label={`Download ${bookTitle} PDF`}
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download</span>
          </button>

          {onMarkCompleted && <button type="button" onClick={onMarkCompleted} disabled={isCompleted} className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold cute-btn ${isCompleted ? 'bg-[#e2eadf] text-[#3d5a3d]' : 'bg-[#5A5A40] text-white'}`} aria-label={isCompleted ? 'Book completed' : 'Mark book as completed'}><CheckCircle2 className="w-3.5 h-3.5" />{isCompleted ? 'Completed' : 'Mark as Completed'}</button>}

          {/* Fullscreen Toggle */}
          <button
            type="button"
            id="reader-fullscreen-btn"
            onClick={onToggleFullscreen}
            className={`p-1.5 rounded-full text-xs transition-all cute-btn cursor-pointer ${btnBg}`}
            title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Enter Fullscreen (F)'}
            aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
        <button type="button" onClick={() => setMobileMenuOpen((open) => !open)} className={`sm:hidden p-2 rounded-full ${btnBg}`} aria-label="Open reader menu" aria-expanded={mobileMenuOpen}><Menu className="w-5 h-5" /></button>
      </div>
      {mobileMenuOpen && <div className={`sm:hidden border-t px-3 py-3 grid grid-cols-2 gap-2 ${toolbarBg}`}>
        <button type="button" onClick={() => { onPageChange(currentPage - 1); setMobileMenuOpen(false); }} disabled={currentPage <= 1} className={`py-2 rounded-lg text-xs font-semibold ${btnBg}`}>Previous page</button>
        <button type="button" onClick={() => { onPageChange(currentPage + 1); setMobileMenuOpen(false); }} disabled={currentPage >= totalPages} className={`py-2 rounded-lg text-xs font-semibold ${btnBg}`}>Next page</button>
        <button type="button" onClick={() => { onZoomOut(); }} className={`py-2 rounded-lg text-xs font-semibold ${btnBg}`}>Zoom out</button>
        <button type="button" onClick={() => { onZoomIn(); }} className={`py-2 rounded-lg text-xs font-semibold ${btnBg}`}>Zoom in</button>
        {onMarkCompleted && <button type="button" onClick={() => { onMarkCompleted(); setMobileMenuOpen(false); }} disabled={isCompleted} className="col-span-2 py-2 rounded-lg bg-[#5A5A40] text-white text-xs font-semibold disabled:bg-[#e2eadf] disabled:text-[#3d5a3d]">{isCompleted ? 'Completed' : 'Mark as Completed'}</button>}
      </div>}
    </header>
  );
};
