import React from 'react';
import { useBooks } from '../hooks/useBooks';
import { Header } from '../components/Header/Header';
import { HeroSection } from '../components/Hero/HeroSection';
import { SearchBar } from '../components/SearchBar/SearchBar';
import { BookGrid } from '../components/BookGrid/BookGrid';
import { LoadingState } from '../components/LoadingState/LoadingState';
import { EmptyState } from '../components/EmptyState/EmptyState';
import { ErrorState } from '../components/ErrorState/ErrorState';
import { BookOpen, Sparkles, Heart, ShieldCheck } from 'lucide-react';

export const Library: React.FC = () => {
  const {
    books,
    filteredBooks,
    totalBooksCount,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    reload,
  } = useBooks();

  return (
    <div id="booknest-library-page" className="min-h-screen flex flex-col bg-[#fdfdfa] text-[#2d2d2b]">
      {/* Top Header */}
      <Header booksCount={totalBooksCount} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {/* Cozy Hero Section */}
        <HeroSection />

        {/* Search & Filter Bar */}
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          totalResults={filteredBooks.length}
          totalBooks={totalBooksCount}
        />

        {/* Book Grid / Loading / Empty / Error States */}
        <section id="library-catalog-section" className="flex-1 pb-16">
          {isLoading && <LoadingState type="grid" />}

          {!isLoading && error && (
            <div className="max-w-7xl mx-auto px-4 py-8">
              <ErrorState
                title="Could not load your book collection"
                message={error}
                onRetry={reload}
                showBackToLibrary={false}
              />
            </div>
          )}

          {!isLoading && !error && books.length === 0 && (
            <EmptyState type="empty-library" onRefresh={reload} />
          )}

          {!isLoading && !error && books.length > 0 && filteredBooks.length === 0 && (
            <EmptyState
              type="search"
              searchQuery={searchQuery}
              onClearSearch={() => setSearchQuery('')}
            />
          )}

          {!isLoading && !error && filteredBooks.length > 0 && (
            <BookGrid books={filteredBooks} />
          )}
        </section>
      </main>

      {/* Cozy Aesthetic Footer */}
      <footer
        id="booknest-footer"
        className="mt-auto border-t border-[#e5e5de] bg-[#f5f5f0] py-8 px-4 sm:px-6 lg:px-8 text-xs text-[#8c8c82]"
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#5A5A40] flex items-center justify-center text-[#fdfdfa]">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <span className="font-serif-book font-bold text-[#2d2d2b] text-sm">
              BookNest
            </span>
            <span className="text-[#8c8c82]">—</span>
            <span className="text-[#8c8c82]">Static PDF Digital Bookshelf</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-[#8c8c82]">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#5A5A40]" /> No server or login required
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#5A5A40]" /> Client-side Canvas rendering
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
