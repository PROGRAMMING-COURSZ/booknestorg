# BookNest — Cozy Digital Book Library & Browser-Based PDF Reader

**BookNest** is a client-side, zero-backend static React + Vite web application that turns any collection of PDF documents into an interactive digital bookshelf and reader.

It requires **no login, no signup, no database, and no server**. All processing—including PDF rendering, page-1 thumbnail generation, and title metadata parsing—happens client-side in the browser.

---

## ✨ Features

- **Cozy Digital Bookshelf**: Aesthetic, responsive library grid showing all available books.
- **Automatic Page-1 Thumbnails**: Renders the first page of any PDF on-the-fly to generate crisp visual cover art without requiring manual cover uploads.
- **Smart Title & Author Detection**: Cleans up messy filenames (e.g. `the_great_gatsby.pdf` → *The Great Gatsby*) and respects embedded PDF document metadata.
- **In-Browser PDF Reader**:
  - Crisp high-DPI canvas rendering powered by PDF.js.
  - Page navigation with direct page jumper (`Page X of Y`).
  - Smooth Zoom controls (`-`, `100%`, `+`, `Fit to Width`).
  - Fullscreen reading mode via the HTML5 Fullscreen API.
  - Page Thumbnails drawer for rapid page browsing.
  - Three cozy reading color themes: Paper Light, Cozy Warm Sepia, and Midnight Dark.
  - Full keyboard shortcuts (`ArrowLeft`, `ArrowRight`, `+`, `-`, `f`, `Esc`, `/`).
  - Mobile swipe gesture navigation and responsive bottom controls.
- **Instant Search**: Real-time filtering by book title, author, or keywords.
- **Original PDF Downloads**: Direct one-click download for offline reading.
- **Zero Backend**: Deployable to any static host (GitHub Pages, Netlify, Vercel, Cloudflare Pages).

---

## 🚀 Quick Start

### 1. Installation

```bash
npm install
```

### 2. Development

Start the development server with automatic book manifest generation:

```bash
npm run dev
```

The application will be accessible at `http://localhost:3000`.

### 3. Production Build

Build the static output into the `dist/` directory:

```bash
npm run build
```

---

## 📚 How to Add Books

Adding books to your personal library is completely seamless:

1. Place your `.pdf` files inside the `public/books/` directory:
   ```text
   public/books/
   ├── demo_book.pdf
   ├── the_little_bookshop.pdf
   ├── atomic_habits.pdf
   └── your_new_book.pdf
   ```

2. Run the manifest generator (or run `npm run dev` / `npm run build` which runs it automatically):
   ```bash
   npm run generate-manifest
   ```

3. The script scans `public/books/`, inspects PDF metadata, formats clean titles, and writes `public/books/books.json`.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| --- | --- |
| `ArrowLeft` / `PageUp` / `h` | Previous page |
| `ArrowRight` / `PageDown` / `l` / `Space` | Next page |
| `+` / `=` | Zoom in |
| `-` / `_` | Zoom out |
| `0` | Reset zoom (100%) |
| `f` / `F` | Toggle fullscreen |
| `Escape` | Exit fullscreen |
| `/` | Focus search bar in library |

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript + Vite 6
- **Styling**: Tailwind CSS + Lucide Icons + Newsreader/Plus Jakarta typography
- **PDF Engine**: PDF.js (`pdfjs-dist`) for in-browser client rendering & thumbnail extraction
- **PDF Generator**: `pdf-lib` for generating authentic multi-page demo books
- **Routing**: React Router 7

---

## 🌐 Static Deployment

Because BookNest is 100% static:

- **GitHub Pages**: Deploy the `dist/` folder using `gh-pages` or GitHub Actions.
- **Vercel / Netlify / Cloudflare Pages**: Set build command to `npm run build` and output directory to `dist`.
