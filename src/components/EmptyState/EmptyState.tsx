import React from 'react';
import { BookOpen, FolderPlus, Search, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  type: 'search' | 'empty-library';
  searchQuery?: string;
  onClearSearch?: () => void;
  onRefresh?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  searchQuery,
  onClearSearch,
  onRefresh,
}) => {
  if (type === 'search') {
    return (
      <div
        id="empty-search-state"
        className="max-w-md mx-auto my-12 p-8 text-center bg-[#f5f5f0] rounded-2xl border border-[#e5e5de] shadow-2xs"
      >
        <div className="w-12 h-12 rounded-full bg-[#5A5A40]/10 text-[#5A5A40] flex items-center justify-center mx-auto mb-4 border border-[#5A5A40]/20">
          <Search className="w-6 h-6" />
        </div>
        <h3 className="font-serif-book font-bold text-lg text-[#2d2d2b] mb-1.5">
          No books found
        </h3>
        <p className="text-sm text-[#8c8c82] mb-6 leading-relaxed">
          No books matched your search for{' '}
          <strong className="text-[#2d2d2b] font-semibold">"{searchQuery}"</strong>. Try checking for typos or searching by author name.
        </p>
        {onClearSearch && (
          <button
            type="button"
            id="empty-state-clear-btn"
            onClick={onClearSearch}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-[#5A5A40] hover:bg-[#484833] rounded-full transition-colors cursor-pointer shadow-xs"
          >
            Clear search filter
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      id="empty-library-state"
      className="max-w-lg mx-auto my-12 p-8 text-center bg-[#f5f5f0] rounded-2xl border border-[#e5e5de] shadow-2xs"
    >
      <div className="w-14 h-14 rounded-full bg-[#5A5A40]/10 text-[#5A5A40] flex items-center justify-center mx-auto mb-4 border border-[#5A5A40]/20">
        <BookOpen className="w-7 h-7 text-[#5A5A40]" />
      </div>
      <h3 className="font-serif-book font-bold text-xl text-[#2d2d2b] mb-2">
        Your bookshelf is empty
      </h3>
      <p className="text-sm text-[#8c8c82] mb-4 leading-relaxed">
        Add your PDF books to the static collection folder:
      </p>

      <div className="bg-[#fdfdfa] p-3 rounded-xl border border-[#e5e5de] font-mono text-xs text-[#2d2d2b] mb-4 select-all">
        public/books/your_book.pdf
      </div>

      <p className="text-xs text-[#8c8c82] mb-6">
        Then run <code className="bg-[#e5e5de]/60 px-1.5 py-0.5 rounded text-[#2d2d2b] font-mono">npm run dev</code> or <code className="bg-[#e5e5de]/60 px-1.5 py-0.5 rounded text-[#2d2d2b] font-mono">npm run build</code> to generate the manifest automatically.
      </p>

      {onRefresh && (
        <button
          type="button"
          id="empty-state-refresh-btn"
          onClick={onRefresh}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#5A5A40] hover:bg-[#484833] rounded-full transition-colors cursor-pointer shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Check for Books
        </button>
      )}
    </div>
  );
};
