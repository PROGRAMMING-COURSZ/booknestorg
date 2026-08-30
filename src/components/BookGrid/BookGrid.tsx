import React from 'react';
import { Book } from '../../types/book';
import { BookCard } from '../BookCard/BookCard';

interface BookGridProps {
  books: Book[];
  onBookSelect?: (book: Book) => void;
}

export const BookGrid: React.FC<BookGridProps> = ({ books, onBookSelect }) => {
  return (
    <div
      id="book-grid"
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 sm:gap-6">
        {books.map((book, index) => (
          <BookCard key={book.id || book.file} book={book} index={index} onSelect={onBookSelect} />
        ))}
      </div>
    </div>
  );
};
