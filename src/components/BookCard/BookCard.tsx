import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Download, FileText, BookmarkCheck, CheckCircle2 } from 'lucide-react';
import { Book } from '../../types/book';
import { useThumbnail } from '../../hooks/useThumbnail';
import { useReadingProgress } from '../../hooks/useReadingProgress';
import { FallbackCover } from './FallbackCover';

interface BookCardProps {
  book: Book;
  index?: number;
}

export const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const { thumbnailUrl, isLoading, isError } = useThumbnail(book.file);
  const { progress } = useReadingProgress(book.id);

  const hasProgress = Boolean(progress && progress.lastPage >= 1);
  const isCompleted = Boolean(progress && progress.percentage === 100);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Trigger direct download of the static original PDF
    const link = document.createElement('a');
    link.href = book.file;
    // Format download filename cleanly, e.g. Harry_Potter.pdf
    const cleanDownloadName = `${book.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
    link.download = cleanDownloadName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <article
      id={`book-card-${book.id}`}
      className="group relative flex flex-col cute-card-hover rounded-3xl p-2 bg-[#fdfdfa] border border-[#e5e5de]/70 shadow-2xs hover:border-[#dec8a7] transition-all duration-300"
    >
      {/* Book Cover Container with fixed book aspect ratio (approx 3:4), rounded-2xl, border-4 border-white, shadow-sm hover:shadow-xl */}
      <Link
        to={`/read/${book.id}`}
        className="block relative aspect-[3/4] w-full rounded-2xl bg-[#5A5A40] overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-300 border-4 border-white mb-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5A5A40]"
        tabIndex={-1}
        aria-label={`Open and read ${book.title}`}
      >
        {/* Cute Page Corner Curl on Hover */}
        <div className="page-curl-corner" aria-hidden="true" />

        {/* Cover Skeleton while generating preview */}
        {isLoading && (
          <div className="absolute inset-0 bg-[#f0eee6] animate-pulse flex flex-col items-center justify-center p-4 text-[#8c8c82]">
            <div className="w-8 h-8 rounded-full border-2 border-[#d4d4cc] border-t-[#5A5A40] animate-spin mb-2" />
            <span className="text-[11px] font-medium text-[#5A5A40]">Rendering cover...</span>
          </div>
        )}

        {/* Rendered Canvas Thumbnail Image */}
        {!isLoading && !isError && thumbnailUrl && (
          <img
            src={thumbnailUrl}
            alt={`Cover page for ${book.title}`}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />
        )}

        {/* Fallback Graphic Cover if thumbnail generation fails or has no image */}
        {!isLoading && (isError || !thumbnailUrl) && (
          <FallbackCover title={book.title} author={book.author} />
        )}

        {/* PDF Badge Overlay */}
        <div className="absolute bottom-3 right-3 z-10">
          <span className="px-2 py-0.5 bg-white/95 backdrop-blur-xs rounded-full text-[9px] font-bold text-[#5A5A40] shadow-xs flex items-center gap-1 border border-[#e5e5de]/50">
            <FileText className="w-2.5 h-2.5" /> PDF
          </span>
        </div>

        {/* Page Count / Reading Progress Pill */}
        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1">
          {hasProgress && progress ? (
            <span
              id={`book-progress-badge-${book.id}`}
              className="px-2.5 py-0.5 bg-white/95 backdrop-blur-xs rounded-full text-[9px] font-semibold text-[#5A5A40] shadow-xs flex items-center gap-1 border border-[#dec8a7]/60"
            >
              {isCompleted ? (
                <>
                  <CheckCircle2 className="w-2.5 h-2.5 text-[#5A5A40]" />
                  <span>Finished</span>
                </>
              ) : (
                <>
                  <BookmarkCheck className="w-2.5 h-2.5 text-[#5A5A40]" />
                  <span>p. {progress.lastPage}/{progress.totalPages || book.pageCount}</span>
                </>
              )}
            </span>
          ) : book.pageCount ? (
            <span className="px-2 py-0.5 bg-white/90 backdrop-blur-xs rounded-full text-[9px] font-semibold text-[#2d2d2b] shadow-xs">
              {book.pageCount}p
            </span>
          ) : null}
        </div>

        {/* Subtle Bottom Progress Track on Cover */}
        {hasProgress && progress && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/25 backdrop-blur-xs overflow-hidden z-20">
            <div
              className="h-full bg-[#dec8a7] transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        )}

        {/* Hover Quick Read Prompt Overlay with cute bounce */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-center justify-center pointer-events-none">
          <span className="opacity-0 group-hover:opacity-100 transition-all duration-200 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 text-[#5A5A40] text-xs font-semibold shadow-md transform translate-y-1.5 group-hover:translate-y-0">
            <BookOpen className="w-3.5 h-3.5" />
            {hasProgress && progress && progress.lastPage > 1 && !isCompleted
              ? `Continue (p. ${progress.lastPage})`
              : 'Read'}
          </span>
        </div>
      </Link>

      {/* Book Metadata & Actions */}
      <div className="flex flex-col flex-1 justify-between px-1">
        <div>
          <h4 className="font-serif-book font-medium text-sm text-[#2d2d2b] group-hover:text-[#5A5A40] transition-colors leading-snug line-clamp-1">
            <Link
              to={`/read/${book.id}`}
              id={`book-title-link-${book.id}`}
              className="focus:outline-none focus-visible:underline"
            >
              {book.title}
            </Link>
          </h4>

          <p className="text-xs text-[#8c8c82] mt-0.5 line-clamp-1">
            {book.author || 'Unknown Author'}
          </p>

          {/* Reading Progress Bar & Status Text */}
          {hasProgress && progress && (
            <div className="mt-2" id={`book-progress-info-${book.id}`}>
              <div className="flex items-center justify-between text-[11px] text-[#5A5A40] font-medium mb-1">
                <span className="flex items-center gap-1">
                  <BookmarkCheck className="w-3 h-3 text-[#5A5A40]" />
                  {isCompleted ? (
                    'Completed 100%'
                  ) : (
                    `Page ${progress.lastPage} of ${progress.totalPages}`
                  )}
                </span>
                <span className="text-[10px] text-[#8c8c82] font-semibold">
                  {progress.percentage}%
                </span>
              </div>
              <div className="w-full bg-[#e5e5de] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#5A5A40] h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Card Action Buttons: Read & Download */}
        <div className="mt-3 pt-2 border-t border-[#e5e5de]/70 flex items-center gap-2">
          <Link
            to={`/read/${book.id}`}
            id={`book-read-btn-${book.id}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-semibold text-white bg-[#5A5A40] hover:bg-[#4a4a34] active:bg-[#3d3d2a] rounded-full shadow-2xs cute-btn focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5A5A40]"
            aria-label={`Read ${book.title}`}
          >
            <BookOpen className="w-3 h-3" />
            <span>
              {hasProgress && progress && progress.lastPage > 1 && !isCompleted
                ? `Continue (p. ${progress.lastPage})`
                : isCompleted
                ? 'Read Again'
                : 'Read'}
            </span>
          </Link>

          <button
            type="button"
            id={`book-download-btn-${book.id}`}
            onClick={handleDownload}
            className="inline-flex items-center justify-center p-1.5 text-[#5A5A40] hover:text-[#2d2d2b] bg-[#f5f5f0] hover:bg-[#e6e3da] rounded-full border border-[#e5e5de] cute-btn focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5A5A40] cursor-pointer"
            title={`Download ${book.filename} (${book.fileSize || 'PDF'})`}
            aria-label={`Download original PDF file for ${book.title}`}
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
};

