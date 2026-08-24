import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Sparkles, HelpCircle, X, FolderOpen, Terminal } from 'lucide-react';

interface HeaderProps {
  booksCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ booksCount = 0 }) => {
  const location = useLocation();
  const isReaderPage = location.pathname.startsWith('/read/');
  const [showGuideModal, setShowGuideModal] = useState(false);

  return (
    <>
      <header
        id="booknest-header"
        className="sticky top-0 z-30 bg-[#fdfdfa]/80 backdrop-blur-md border-b border-[#e5e5de] transition-all"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo Brand */}
          <Link
            to="/"
            id="booknest-logo-link"
            className="group flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5A5A40] rounded-xl py-1 px-1.5"
            aria-label="BookNest Home"
          >
            <div className="w-10 h-10 rounded-xl bg-[#5A5A40] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform duration-200">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif-book font-bold text-2xl tracking-tight text-[#5A5A40]">
                  BookNest
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#f5f5f0] text-[#5A5A40] border border-[#e5e5de]">
                  Library
                </span>
              </div>
              <p className="text-[11px] text-[#8c8c82] font-medium hidden sm:block">
                Quiet Digital Bookshelf & PDF Reader
              </p>
            </div>
          </Link>

          {/* Right Navigation Controls */}
          <div className="flex items-center gap-3 sm:gap-4">
            {!isReaderPage && (
              <div className="hidden md:flex items-center gap-2 text-xs text-[#8c8c82] bg-[#f5f5f0] px-3.5 py-1.5 rounded-full border border-[#e5e5de]">
                <Sparkles className="w-3.5 h-3.5 text-[#5A5A40]" />
                <span>
                  <strong className="font-semibold text-[#2d2d2b]">{booksCount}</strong> {booksCount === 1 ? 'book' : 'books'} ready
                </span>
              </div>
            )}

            <button
              type="button"
              id="header-guide-button"
              onClick={() => setShowGuideModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-[#5A5A40] hover:text-[#2d2d2b] bg-[#f5f5f0] hover:bg-[#eaeae2] rounded-full border border-[#e5e5de] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5A5A40] cursor-pointer"
              title="How to add new PDF books"
            >
              <HelpCircle className="w-4 h-4 text-[#8c8c82]" />
              <span className="hidden sm:inline font-medium">Adding Books</span>
            </button>

            {isReaderPage && (
              <Link
                to="/"
                id="header-back-library-link"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#5A5A40] hover:bg-[#4a4a34] rounded-full border border-[#5A5A40] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5A5A40]"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Back to Library</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Guide Modal */}
      {showGuideModal && (
        <div
          id="guide-modal-backdrop"
          className="fixed inset-0 z-50 bg-[#2d2d2b]/40 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowGuideModal(false)}
        >
          <div
            id="guide-modal-content"
            className="bg-[#fdfdfa] rounded-2xl shadow-xl max-w-lg w-full p-6 sm:p-7 border border-[#e5e5de] relative animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              id="guide-modal-close"
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 right-4 p-1.5 text-[#8c8c82] hover:text-[#2d2d2b] rounded-lg hover:bg-[#f5f5f0] transition-colors cursor-pointer"
              aria-label="Close guide modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 text-[#5A5A40] mb-3">
              <FolderOpen className="w-5 h-5" />
              <h2 className="font-serif-book font-bold text-xl text-[#2d2d2b]">
                Adding PDF Books to BookNest
              </h2>
            </div>

            <p className="text-sm text-[#8c8c82] mb-4 leading-relaxed">
              BookNest operates entirely as a zero-backend, client-side static library. Follow these simple steps to add your own books:
            </p>

            <div className="space-y-3.5 text-sm text-[#2d2d2b] mb-6">
              <div className="p-3.5 bg-[#f5f5f0] rounded-xl border border-[#e5e5de]">
                <p className="font-semibold text-[#2d2d2b] mb-1">1. Drop your PDF file</p>
                <p className="text-xs text-[#8c8c82]">
                  Place any <code className="bg-[#e5e5de] px-1 py-0.5 rounded text-[#2d2d2b] font-mono">.pdf</code> document inside the folder:
                </p>
                <p className="text-xs font-mono text-[#5A5A40] bg-[#fdfdfa] mt-1.5 p-1.5 rounded border border-[#e5e5de]">
                  public/books/my_favorite_book.pdf
                </p>
              </div>

              <div className="p-3.5 bg-[#f5f5f0] rounded-xl border border-[#e5e5de]">
                <p className="font-semibold text-[#2d2d2b] mb-1">2. Run Manifest Generation</p>
                <p className="text-xs text-[#8c8c82] mb-1.5">
                  The build script scans the directory, reads PDF titles/metadata, and updates <code className="bg-[#e5e5de] px-1 py-0.5 rounded text-[#2d2d2b] font-mono">books.json</code>:
                </p>
                <div className="flex items-center gap-2 bg-[#2d2d2b] text-[#fdfdfa] p-2.5 rounded-lg text-xs font-mono">
                  <Terminal className="w-3.5 h-3.5 text-[#D9D9C3]" />
                  <span>npm run build</span>
                  <span className="text-[#8c8c82] text-[10px] ml-auto">or npm run dev</span>
                </div>
              </div>

              <div className="p-3.5 bg-[#f0f0ea] rounded-xl border border-[#e5e5de] text-xs text-[#2d2d2b]">
                <p className="font-semibold text-[#5A5A40] mb-0.5">✨ Automatic Covers & Titles</p>
                <p className="text-[#8c8c82]">
                  BookNest renders page 1 of each PDF on-the-fly as its cover art and cleans up filename titles automatically!
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                id="guide-modal-understood"
                onClick={() => setShowGuideModal(false)}
                className="px-5 py-2.5 text-sm font-semibold bg-[#5A5A40] hover:bg-[#4a4a34] text-white rounded-full transition-colors cursor-pointer"
              >
                Got it, thanks!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
