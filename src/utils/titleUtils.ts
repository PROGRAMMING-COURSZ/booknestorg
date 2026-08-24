/**
 * Utility functions for cleaning up and formatting book titles and authors from filenames.
 */

export function formatTitleFromFilename(filename: string): string {
  const baseName = filename.replace(/\.pdf$/i, '');
  return baseName
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((word) => {
      const lower = word.toLowerCase();
      if (
        ['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'from', 'by', 'of', 'in', 'with'].includes(
          lower
        )
      ) {
        return lower;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ')
    .replace(/^[a-z]/, (char) => char.toUpperCase());
}

export function generateIdFromFilename(filename: string): string {
  return filename
    .replace(/\.pdf$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function cleanAuthorName(author?: string): string {
  if (!author || author.trim().length === 0) {
    return 'Unknown Author';
  }
  return author.trim();
}
