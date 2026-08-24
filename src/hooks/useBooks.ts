import { useState, useEffect, useMemo, useCallback } from 'react';
import { Book } from '../types/book';
import { fetchBookManifest } from '../utils/bookDiscovery';
import { getAllReadingProgress } from '../utils/readingProgress';

export function useBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'recent-read' | 'title' | 'pages'>('featured');

  const loadBooks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const manifest = await fetchBookManifest();
      setBooks(manifest);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load books');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  const filteredBooks = useMemo(() => {
    let result = [...books];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((book) => {
        const titleMatch = book.title.toLowerCase().includes(query);
        const authorMatch = book.author?.toLowerCase().includes(query);
        const filenameMatch = book.filename.toLowerCase().includes(query);
        const descMatch = book.description?.toLowerCase().includes(query);
        return titleMatch || authorMatch || filenameMatch || descMatch;
      });
    }

    if (sortBy === 'recent-read') {
      const progressMap = getAllReadingProgress();
      result.sort((a, b) => {
        const timeA = progressMap[a.id]?.updatedAt || 0;
        const timeB = progressMap[b.id]?.updatedAt || 0;
        return timeB - timeA;
      });
    } else if (sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'pages') {
      result.sort((a, b) => (b.pageCount || 0) - (a.pageCount || 0));
    }

    return result;
  }, [books, searchQuery, sortBy]);

  return {
    books,
    filteredBooks,
    totalBooksCount: books.length,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    reload: loadBooks,
  };
}
