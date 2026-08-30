export interface BookProgress {
  bookId: string;
  lastPage: number;
  totalPages: number;
  percentage: number;
  updatedAt: number;
  lastReadAt: number;
  completed: boolean;
  favorite: boolean;
}

const STORAGE_KEY = 'booknest_reading_progress';

function readState(): Record<string, BookProgress> {
  if (typeof window === 'undefined') return {};
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    const parsed = value ? JSON.parse(value) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch { return {}; }
}

function writeState(state: Record<string, BookProgress>, bookId: string, progress: BookProgress | null) {
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch (error) { console.warn('Unable to save BookNest reading state', error); }
  window.dispatchEvent(new CustomEvent('booknest-progress-updated', { detail: { bookId, progress } }));
}

export function getAllReadingProgress(): Record<string, BookProgress> { return readState(); }
export function getBookProgress(bookId: string): BookProgress | null { return readState()[bookId] || null; }

function defaultProgress(bookId: string): BookProgress {
  const now = Date.now();
  return { bookId, lastPage: 1, totalPages: 1, percentage: 1, updatedAt: now, lastReadAt: now, completed: false, favorite: false };
}

export function saveBookProgress(bookId: string, lastPage: number, totalPages: number): BookProgress {
  const state = readState();
  const prior = state[bookId] || defaultProgress(bookId);
  const safeTotalPages = Math.max(1, Math.floor(totalPages || 1));
  const safeLastPage = Math.max(1, Math.min(safeTotalPages, Math.floor(lastPage || 1)));
  const now = Date.now();
  const progress = { ...prior, bookId, lastPage: safeLastPage, totalPages: safeTotalPages, percentage: prior.completed ? 100 : Math.max(1, Math.round((safeLastPage / safeTotalPages) * 100)), updatedAt: now, lastReadAt: now };
  state[bookId] = progress;
  writeState(state, bookId, progress);
  return progress;
}

export function setBookFavorite(bookId: string, favorite: boolean): BookProgress {
  const state = readState();
  const progress = { ...(state[bookId] || defaultProgress(bookId)), favorite, updatedAt: Date.now() };
  state[bookId] = progress;
  writeState(state, bookId, progress);
  return progress;
}

export function markBookCompleted(bookId: string, totalPages = 1): BookProgress {
  const state = readState();
  const prior = state[bookId] || defaultProgress(bookId);
  const pages = Math.max(1, prior.totalPages || totalPages);
  const progress = { ...prior, bookId, totalPages: pages, lastPage: prior.lastPage || pages, percentage: 100, completed: true, updatedAt: Date.now(), lastReadAt: Date.now() };
  state[bookId] = progress;
  writeState(state, bookId, progress);
  return progress;
}

export function clearBookProgress(bookId: string): void {
  const state = readState(); delete state[bookId]; writeState(state, bookId, null);
}
