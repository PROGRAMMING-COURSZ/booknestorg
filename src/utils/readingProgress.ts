export interface BookProgress {
  bookId: string;
  lastPage: number;
  totalPages: number;
  percentage: number;
  updatedAt: number;
}

const AGGREGATE_COOKIE_NAME = 'booknest_reading_progress';
const LOCAL_STORAGE_KEY = 'booknest_reading_progress';
const COOKIE_MAX_AGE_DAYS = 365;

// Cookie helper utilities
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const nameEQ = `${encodeURIComponent(name)}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      try {
        return decodeURIComponent(c.substring(nameEQ.length, c.length));
      } catch {
        return c.substring(nameEQ.length, c.length);
      }
    }
  }
  return null;
}

export function setCookie(name: string, value: string, days = COOKIE_MAX_AGE_DAYS): void {
  if (typeof document === 'undefined') return;
  const maxAge = days * 24 * 60 * 60;
  const encodedValue = encodeURIComponent(value);
  document.cookie = `${encodeURIComponent(name)}=${encodedValue}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${encodeURIComponent(name)}=; path=/; max-age=0; SameSite=Lax`;
}

/**
 * Retrieve all saved reading progress from cookies (with LocalStorage fallback/sync)
 */
export function getAllReadingProgress(): Record<string, BookProgress> {
  let progressMap: Record<string, BookProgress> = {};

  // 1. Try reading aggregate cookie
  const cookieData = getCookie(AGGREGATE_COOKIE_NAME);
  if (cookieData) {
    try {
      const parsed = JSON.parse(cookieData);
      if (typeof parsed === 'object' && parsed !== null) {
        progressMap = parsed;
      }
    } catch {
      // Corrupt cookie fallback
    }
  }

  // 2. Sync / fallback with localStorage
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const lsData = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (lsData) {
        const parsedLs = JSON.parse(lsData);
        if (typeof parsedLs === 'object' && parsedLs !== null) {
          // Merge to ensure no lost records if cookie was truncated
          progressMap = { ...parsedLs, ...progressMap };
        }
      }
    } catch {
      // Ignore LS access errors
    }
  }

  return progressMap;
}

/**
 * Retrieve the saved reading progress for a single book
 */
export function getBookProgress(bookId: string): BookProgress | null {
  if (!bookId) return null;
  
  // Check individual book cookie first
  const individualCookie = getCookie(`booknest_p_${bookId}`);
  if (individualCookie) {
    try {
      const parsed = JSON.parse(individualCookie);
      if (parsed && typeof parsed.lastPage === 'number') {
        return parsed as BookProgress;
      }
    } catch {
      // Ignore parse failure
    }
  }

  const all = getAllReadingProgress();
  return all[bookId] || null;
}

/**
 * Save the reading progress for a book to both cookies and local storage
 */
export function saveBookProgress(
  bookId: string,
  lastPage: number,
  totalPages: number
): BookProgress {
  const safeLastPage = Math.max(1, Math.floor(lastPage));
  const safeTotalPages = Math.max(safeLastPage, Math.floor(totalPages || 1));
  const percentage = Math.min(100, Math.max(1, Math.round((safeLastPage / safeTotalPages) * 100)));

  const progress: BookProgress = {
    bookId,
    lastPage: safeLastPage,
    totalPages: safeTotalPages,
    percentage,
    updatedAt: Date.now(),
  };

  // 1. Save specific individual cookie for this book
  try {
    setCookie(`booknest_p_${bookId}`, JSON.stringify(progress));
  } catch (e) {
    console.warn('Failed to set book progress cookie', e);
  }

  // 2. Update aggregate map in cookie & local storage
  try {
    const all = getAllReadingProgress();
    all[bookId] = progress;

    const serialized = JSON.stringify(all);
    setCookie(AGGREGATE_COOKIE_NAME, serialized);

    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, serialized);
    }
  } catch (e) {
    console.warn('Failed to update aggregate reading progress storage', e);
  }

  // 3. Dispatch global event for instant UI reactive updates across components
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('booknest-progress-updated', {
        detail: { bookId, progress },
      })
    );
  }

  return progress;
}

/**
 * Clear reading progress for a single book
 */
export function clearBookProgress(bookId: string): void {
  deleteCookie(`booknest_p_${bookId}`);

  try {
    const all = getAllReadingProgress();
    delete all[bookId];

    const serialized = JSON.stringify(all);
    setCookie(AGGREGATE_COOKIE_NAME, serialized);

    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, serialized);
    }
  } catch (e) {
    console.warn('Failed to clear book progress', e);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('booknest-progress-updated', {
        detail: { bookId, progress: null },
      })
    );
  }
}
