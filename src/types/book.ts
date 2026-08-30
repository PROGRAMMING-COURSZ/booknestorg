export interface Book {
  id: string;
  file: string;
  filename: string;
  title: string;
  author?: string;
  description?: string;
  pageCount?: number;
  fileSize?: string;
  category?: string;
  language?: string;
  template_img?: string;
}

export type ReaderColorTheme = 'light' | 'sepia' | 'calm';
export type ReaderTransitionEffect = 'curl' | 'slide' | 'fade';

export interface Bookmark {
  id: string;
  bookId: string;
  pageNum: number;
  title?: string;
  createdAt: number;
}

export interface ReaderState {
  currentPage: number;
  numPages: number;
  zoom: number; // e.g. 1.0, 1.25, 1.5
  fitMode: 'fit-width' | 'fit-page' | 'manual';
  colorTheme: ReaderColorTheme;
  isFullscreen: boolean;
  isLoading: boolean;
  error: string | null;
}
