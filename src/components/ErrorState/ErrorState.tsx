import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft, BookOpen, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showBackToLibrary?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Hmm, this book couldn't be opened.",
  message = "We ran into an issue while reading the PDF file. It may be missing from /public/books or corrupted.",
  onRetry,
  showBackToLibrary = true,
}) => {
  return (
    <div
      id="error-state-container"
      className="max-w-md mx-auto my-16 p-8 text-center bg-[#f5f5f0] rounded-2xl border border-[#e5e5de] shadow-2xs"
    >
      <div className="w-12 h-12 rounded-full bg-[#8c3a3a]/10 text-[#8c3a3a] flex items-center justify-center mx-auto mb-4 border border-[#8c3a3a]/20">
        <AlertCircle className="w-6 h-6" />
      </div>

      <h3 className="font-serif-book font-bold text-xl text-[#2d2d2b] mb-2">
        {title}
      </h3>

      <p className="text-sm text-[#8c8c82] mb-6 leading-relaxed">
        {message}
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {showBackToLibrary && (
          <Link
            to="/"
            id="error-state-back-link"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-[#2d2d2b] hover:text-black bg-[#e5e5de] hover:bg-[#d8d8d0] rounded-full transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Library</span>
          </Link>
        )}

        {onRetry && (
          <button
            type="button"
            id="error-state-retry-btn"
            onClick={onRetry}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#5A5A40] hover:bg-[#484833] rounded-full transition-colors cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        )}
      </div>
    </div>
  );
};
