import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBooks } from '../hooks/useBooks';
import { BookReader } from '../components/BookReader/BookReader';
import { LoadingState } from '../components/LoadingState/LoadingState';
import { ErrorState } from '../components/ErrorState/ErrorState';
import { Book } from '../types/book';

export const Reader: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const { books, isLoading } = useBooks();

  const currentBook = useMemo<Book | null>(() => {
    if (!bookId) return null;

    // 1. Exact ID match from manifest
    const matched = books.find(
      (b) => b.id.toLowerCase() === bookId.toLowerCase() || b.filename.toLowerCase() === bookId.toLowerCase()
    );
    if (matched) return matched;

    // 2. If manifest is loaded but ID wasn't in array, try matching with extension
    const withPdfExt = `${bookId}.pdf`.toLowerCase();
    const matchedWithExt = books.find((b) => b.filename.toLowerCase() === withPdfExt);
    if (matchedWithExt) return matchedWithExt;

    return null;
  }, [bookId, books]);

  if (isLoading && !currentBook) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfdfa]">
        <LoadingState type="reader" message="Loading book..." />
      </div>
    );
  }

  if (!currentBook) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfdfa] p-4">
        <ErrorState
          title="Book Not Found"
          message={`We couldn't find a book with ID "${bookId}". Please choose another title from the library.`}
        />
      </div>
    );
  }

  return <BookReader book={currentBook} />;
};
