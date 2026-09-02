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

    return data.map((book) => ({
      ...book,
      file: normalizeBookAssetPath(book.file, book.filename) ?? `/books/${book.filename}`,
      template_img: normalizeBookAssetPath(book.template_img),
    }));
  } catch (error) {
    console.error('Error fetching book manifest:', error);
    // books.json is the only catalog source; never substitute demo books.
    return [];
  }
}

function normalizeBookAssetPath(value?: string, filename?: string): string | undefined {
  if (!value) return undefined;
  if (/^(https?:|blob:|data:)/i.test(value)) return value;

  const normalized = value.replace(/\\/g, '/').replace(/^\.\//, '');
  const publicIndex = normalized.toLowerCase().indexOf('public/');
  if (publicIndex !== -1) return `/${normalized.slice(publicIndex + 'public/'.length)}`;
  if (normalized.startsWith('/')) return normalized;
  if (normalized.startsWith('books/')) return `/${normalized}`;
  return filename ? `/books/${filename}` : `/${normalized}`;
}

