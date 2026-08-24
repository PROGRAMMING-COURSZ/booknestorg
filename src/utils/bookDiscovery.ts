import { Book } from '../types/book';
import { resolvePublicUrl } from './pdfUtils';

/**
 * Fetches the list of books from the build-time generated /books/books.json manifest.
 */
export async function fetchBookManifest(): Promise<Book[]> {
  try {
    const url = resolvePublicUrl('/books/books.json');
    const response = await fetch(url, {
      headers: {
        'Cache-Control': 'no-cache',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to load books.json: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      throw new Error('Received HTML instead of books.json manifest');
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error('Invalid manifest format: expected an array of books');
    }

    return data;
  } catch (error) {
    console.error('Error fetching book manifest:', error);
    // Fallback: If fetch failed, return known demo book structure so the app remains resilient
    return [
      {
        id: 'demo-book',
        file: '/books/demo_book.pdf',
        filename: 'demo_book.pdf',
        title: 'The Little Bookshop',
        author: 'Clara Bell',
        description: 'A cozy story about a student discovering a hidden book haven',
        pageCount: 5,
        fileSize: '6 KB',
      },
      {
        id: 'the-little-bookshop',
        file: '/books/the_little_bookshop.pdf',
        filename: 'the_little_bookshop.pdf',
        title: 'The Little Bookshop',
        author: 'Clara Bell',
        description: 'A cozy story about a student discovering a hidden book haven',
        pageCount: 5,
        fileSize: '6 KB',
      },
      {
        id: 'starlight-chronicles',
        file: '/books/starlight_chronicles.pdf',
        filename: 'starlight_chronicles.pdf',
        title: 'The Starlight Chronicles',
        author: 'Julian Moore',
        description: 'Essays on Night Skies, Constellations & Wonder',
        pageCount: 3,
        fileSize: '4 KB',
      },
      {
        id: 'the-cozy-tea-garden',
        file: '/books/the_cozy_tea_garden.pdf',
        filename: 'the_cozy_tea_garden.pdf',
        title: 'The Cozy Tea Garden Guide',
        author: 'Mei Lin',
        description: 'Herbal Infusions, Mindful Brewing & Gentle Rituals',
        pageCount: 3,
        fileSize: '4 KB',
      },
      {
        id: 'atomic-habits-focus',
        file: '/books/atomic_habits_focus.pdf',
        filename: 'atomic_habits_focus.pdf',
        title: 'Atomic Habits & Daily Focus',
        author: 'James Clear (Study Guide)',
        description: 'Tiny Changes, Remarkable Results for Lifelong Readers',
        pageCount: 3,
        fileSize: '4 KB',
      },
    ];
  }
}

