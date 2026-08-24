import { Bookmark } from '../types/book';

const BOOKMARKS_STORAGE_KEY = 'booknest_user_bookmarks';

/**
 * Retrieve all bookmarks dictionary { [bookId]: Bookmark[] }
 */
export function getAllBookmarks(): Record<string, Bookmark[]> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch (err) {
    console.warn('Failed to load bookmarks from storage:', err);
    return {};
  }
}

/**
 * Retrieve bookmarks for a specific book, sorted by page number
 */
export function getBookBookmarks(bookId: string): Bookmark[] {
  const all = getAllBookmarks();
  const list = all[bookId] || [];
  return [...list].sort((a, b) => a.pageNum - b.pageNum);
}

/**
 * Check if a page is already bookmarked
 */
export function isPageBookmarked(bookId: string, pageNum: number): boolean {
  const bookmarks = getBookBookmarks(bookId);
  return bookmarks.some((b) => b.pageNum === pageNum);
}

/**
 * Save updated bookmarks list to storage & dispatch update event
 */
function persistBookmarks(all: Record<string, Bookmark[]>, bookId: string) {
  try {
    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(all));
    window.dispatchEvent(
      new CustomEvent('booknest-bookmarks-updated', {
        detail: { bookId, bookmarks: all[bookId] || [] },
      })
    );
  } catch (err) {
    console.warn('Failed to persist bookmarks:', err);
  }
}

/**
 * Toggle bookmark for a specific page in a book
 */
export function toggleBookmark(
  bookId: string,
  pageNum: number,
  title?: string
): { isBookmarked: boolean; bookmarks: Bookmark[] } {
  const all = getAllBookmarks();
  const currentList = all[bookId] || [];
  const existingIndex = currentList.findIndex((b) => b.pageNum === pageNum);

  let isBookmarked = false;
  if (existingIndex >= 0) {
    // Remove bookmark
    currentList.splice(existingIndex, 1);
    all[bookId] = currentList;
    isBookmarked = false;
  } else {
    // Add bookmark
    const newBookmark: Bookmark = {
      id: `bm_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      bookId,
      pageNum,
      title: title || `Page ${pageNum}`,
      createdAt: Date.now(),
    };
    currentList.push(newBookmark);
    currentList.sort((a, b) => a.pageNum - b.pageNum);
    all[bookId] = currentList;
    isBookmarked = true;
  }

  persistBookmarks(all, bookId);
  return { isBookmarked, bookmarks: all[bookId] };
}

/**
 * Delete a specific bookmark by its ID
 */
export function deleteBookmark(bookId: string, bookmarkId: string): Bookmark[] {
  const all = getAllBookmarks();
  const currentList = all[bookId] || [];
  all[bookId] = currentList.filter((b) => b.id !== bookmarkId);
  persistBookmarks(all, bookId);
  return all[bookId];
}
