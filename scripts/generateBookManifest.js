import fs from 'fs';
import path from 'path';
import { PDFDocument } from 'pdf-lib';

const booksDir = path.resolve('public', 'books');
const manifestPath = path.join(booksDir, 'books.json');

// Ensure directory exists
if (!fs.existsSync(booksDir)) {
  fs.mkdirSync(booksDir, { recursive: true });
}

// Convert filename to clean title
function formatTitleFromFilename(filename) {
  const baseName = filename.replace(/\.pdf$/i, '');
  return baseName
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map(word => {
      if (['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'from', 'by', 'of', 'in', 'with'].includes(word.toLowerCase())) {
        return word.toLowerCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ')
    .replace(/^[a-z]/, char => char.toUpperCase()); // Ensure first letter is capitalized
}

// Generate URL slug from filename
function generateIdFromFilename(filename) {
  return filename
    .replace(/\.pdf$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function scanAndGenerateManifest() {
  console.log('Scanning /public/books for PDF books...');
  
  if (!fs.existsSync(booksDir)) {
    console.warn(`Directory not found: ${booksDir}`);
    fs.writeFileSync(manifestPath, JSON.stringify([], null, 2));
    return;
  }

  const files = fs.readdirSync(booksDir);
  const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));

  console.log(`Found ${pdfFiles.length} PDF file(s).`);

  const books = [];

  for (const file of pdfFiles) {
    const filePath = path.join(booksDir, file);
    const stats = fs.statSync(filePath);
    const sizeInBytes = stats.size;
    const formattedSize = sizeInBytes > 1024 * 1024 
      ? `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(sizeInBytes / 1024)} KB`;

    let title = formatTitleFromFilename(file);
    let author = 'Unknown Author';
    let description = '';
    let pageCount = 1;

    try {
      const fileBuffer = fs.readFileSync(filePath);
      const pdfDoc = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
      pageCount = pdfDoc.getPageCount();

      const metaTitle = pdfDoc.getTitle();
      const metaAuthor = pdfDoc.getAuthor();
      const metaSubject = pdfDoc.getSubject();

      if (metaTitle && metaTitle.trim().length > 1) {
        title = metaTitle.trim();
      }
      if (metaAuthor && metaAuthor.trim().length > 1) {
        author = metaAuthor.trim();
      }
      if (metaSubject && metaSubject.trim().length > 1) {
        description = metaSubject.trim();
      }
    } catch (err) {
      console.warn(`Could not read PDF metadata for ${file}:`, err.message);
    }

    const id = generateIdFromFilename(file);

    const coverFile = files.find(candidate =>
      candidate.replace(/\.[^.]+$/, '').toLowerCase() === file.replace(/\.pdf$/i, '').toLowerCase() &&
      /\.(png|jpe?g|webp|avif)$/i.test(candidate)
    );

    books.push({
      id,
      file: `/books/${file}`,
      filename: file,
      title,
      author,
      description,
      pageCount,
      fileSize: formattedSize,
      ...(coverFile ? { template_img: `/books/${coverFile}` } : {}),
    });
  }

  books.sort((a, b) => a.title.localeCompare(b.title));

  fs.writeFileSync(manifestPath, JSON.stringify(books, null, 2));
  console.log(`Successfully generated manifest with ${books.length} book(s) at: ${manifestPath}`);
}

scanAndGenerateManifest().catch(console.error);
