import React, { useRef, useEffect } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: 'featured' | 'recent-read' | 'title' | 'pages';
  onSortChange: (sort: 'featured' | 'recent-read' | 'title' | 'pages') => void;
  totalResults: number;
  totalBooks: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  totalResults,
  totalBooks,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus search input when user presses '/' key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div id="search-bar-container" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
        {/* Search Input Box */}
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#8c8c82] group-focus-within:text-[#5A5A40] transition-colors">
            <Search className="w-4 h-4" />
          </div>

          <input
            ref={inputRef}
            id="book-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search your library by title, author, or keyword..."
            aria-label="Search library books"
            className="w-full pl-11 pr-24 py-3 sm:py-3.5 bg-[#f5f5f0] rounded-full border border-[#e5e5de] shadow-2xs text-[#2d2d2b] placeholder-[#8c8c82] text-sm focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20 focus:border-[#5A5A40] transition-all"
          />

          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center gap-1.5">
            {searchQuery ? (
              <button
                type="button"
                id="search-clear-button"
                onClick={() => {
                  onSearchChange('');
                  inputRef.current?.focus();
                }}
                className="p-1 text-[#8c8c82] hover:text-[#2d2d2b] hover:bg-[#e5e5de]/60 rounded-full transition-colors cursor-pointer"
                aria-label="Clear search query"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-[#8c8c82] bg-[#e5e5de]/60 border border-[#e5e5de] rounded-full shadow-2xs">
                /
              </kbd>
            )}
          </div>
        </div>

        {/* Sort and Filters */}
        <div className="flex items-center gap-2.5 justify-between sm:justify-start">
          <div className="flex items-center gap-2 bg-[#f5f5f0] px-4 py-2.5 rounded-full border border-[#e5e5de] shadow-2xs text-xs text-[#5A5A40]">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#8c8c82]" />
            <label htmlFor="sort-by-select" className="font-medium text-[#8c8c82] hidden md:inline">
              Sort:
            </label>
            <select
              id="sort-by-select"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as 'featured' | 'title' | 'pages')}
              className="bg-transparent text-[#2d2d2b] font-semibold focus:outline-none cursor-pointer text-xs"
              aria-label="Sort books by"
            >
              <option value="featured">Featured / Default</option>
              <option value="recent-read">Recently Read</option>
              <option value="title">Title (A – Z)</option>
              <option value="pages">Longest (Pages)</option>
            </select>
          </div>

          <div className="text-xs text-[#8c8c82] px-3.5 py-2.5 bg-[#f5f5f0] rounded-full border border-[#e5e5de] whitespace-nowrap">
            {searchQuery ? (
              <span>
                Found <strong className="text-[#2d2d2b] font-semibold">{totalResults}</strong> of {totalBooks}
              </span>
            ) : (
              <span>
                <strong className="text-[#2d2d2b] font-semibold">{totalBooks}</strong> books
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
