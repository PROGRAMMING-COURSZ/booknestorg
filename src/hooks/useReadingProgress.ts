import { useState, useEffect, useCallback } from 'react';
import {
  BookProgress,
  getBookProgress,
  getAllReadingProgress,
  saveBookProgress,
  clearBookProgress,
} from '../utils/readingProgress';

export function useReadingProgress(bookId?: string) {
  const [progress, setProgress] = useState<BookProgress | null>(() =>
    bookId ? getBookProgress(bookId) : null
  );
  const [allProgress, setAllProgress] = useState<Record<string, BookProgress>>(() =>
    getAllReadingProgress()
  );

  const refresh = useCallback(() => {
    const all = getAllReadingProgress();
    setAllProgress(all);
    if (bookId) {
      setProgress(getBookProgress(bookId));
    }
  }, [bookId]);

  useEffect(() => {
    refresh();

    const handleCustomUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ bookId: string; progress: BookProgress | null }>;
      if (customEvent.detail) {
        if (!bookId || customEvent.detail.bookId === bookId) {
          refresh();
        }
      } else {
        refresh();
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'booknest_reading_progress') {
        refresh();
      }
    };

    window.addEventListener('booknest-progress-updated', handleCustomUpdate);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('booknest-progress-updated', handleCustomUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, [bookId, refresh]);

  const save = useCallback(
    (page: number, total: number) => {
      if (!bookId) return;
      const updated = saveBookProgress(bookId, page, total);
      setProgress(updated);
    },
    [bookId]
  );

  const clear = useCallback(() => {
    if (!bookId) return;
    clearBookProgress(bookId);
    setProgress(null);
  }, [bookId]);

  return {
    progress,
    allProgress,
    saveProgress: save,
    clearProgress: clear,
    refreshProgress: refresh,
  };
}
