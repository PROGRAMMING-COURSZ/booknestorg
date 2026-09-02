import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Heart, X, BookOpen } from 'lucide-react';
import { Book } from '../../types/book';
import { useReadingProgress } from '../../hooks/useReadingProgress';
import { markBookCompleted, setBookFavorite } from '../../utils/readingProgress';
import { resolvePublicUrl } from '../../utils/pdfUtils';
import { FallbackCover } from '../BookCard/FallbackCover';

export const BookDetailsModal: React.FC<{ book: Book; onClose: () => void }> = ({ book, onClose }) => {
  const { progress } = useReadingProgress(book.id);
  const completed = Boolean(progress?.completed);
  const favorite = Boolean(progress?.favorite);
  const [coverFailed, setCoverFailed] = useState(false);
  const cover = book.template_img ? resolvePublicUrl(book.template_img) : '';
  useEffect(() => { const close = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', close); return () => window.removeEventListener('keydown', close); }, [onClose]);
  return <div className="fixed inset-0 z-[70] bg-[#2d2d2b]/50 p-4 flex items-center justify-center" role="presentation" onMouseDown={onClose}>
    <section role="dialog" aria-modal="true" aria-labelledby="book-details-title" onMouseDown={(e) => e.stopPropagation()} className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#fdfdfa] shadow-2xl p-5 sm:p-7 relative grid sm:grid-cols-[190px_1fr] gap-6">
      <button type="button" onClick={onClose} className="absolute top-3 right-3 p-2 rounded-full hover:bg-[#f0eee6]" aria-label="Close book details"><X className="w-5 h-5" /></button>
      <div className="w-full max-w-[190px] mx-auto rounded-2xl shadow-md overflow-hidden aspect-[3/4]">
        {cover && !coverFailed ? <img src={cover} alt={`Cover for ${book.title}`} className="w-full h-full object-cover" onError={() => setCoverFailed(true)} /> : <FallbackCover title={book.title} author={book.author} />}
      </div>
      <div className="min-w-0"><p className="text-xs uppercase tracking-wider text-[#8c8c82]">{book.category || 'BookNest library'}</p><h2 id="book-details-title" className="font-serif-book text-2xl font-bold mt-1">{book.title}</h2><p className="text-sm text-[#5A5A40] mt-1">{book.author || 'Unknown Author'}</p>
        {book.description && <p className="text-sm leading-relaxed mt-5 text-[#575750]">{book.description}</p>}
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs mt-5 text-[#575750]"><div><dt className="text-[#8c8c82]">Language</dt><dd>{book.language || 'English'}</dd></div><div><dt className="text-[#8c8c82]">Pages</dt><dd>{book.pageCount || '—'}</dd></div><div><dt className="text-[#8c8c82]">Progress</dt><dd>{completed ? '100%' : `${progress?.percentage || 0}%`}</dd></div><div><dt className="text-[#8c8c82]">Status</dt><dd>{completed ? 'Completed' : progress ? 'Reading' : 'Not started'}</dd></div></dl>
        <div className="flex flex-wrap gap-2 mt-6"><button type="button" onClick={() => setBookFavorite(book.id, !favorite)} aria-pressed={favorite} className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold ${favorite ? 'bg-[#5A5A40] text-white' : 'bg-[#f5f5f0] text-[#5A5A40]'}`}><Heart className={`w-4 h-4 ${favorite ? 'fill-[#dec8a7] text-[#dec8a7]' : ''}`} />{favorite ? 'Favorited' : 'Favorite'}</button>
          <button type="button" onClick={() => markBookCompleted(book.id, book.pageCount)} disabled={completed} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold bg-[#f0eee6] text-[#5A5A40] disabled:opacity-70"><CheckCircle2 className="w-4 h-4" />{completed ? 'Completed' : 'Mark as Completed'}</button></div>
        <Link to={`/read/${book.id}`} className="mt-5 inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-[#5A5A40] text-white text-sm font-semibold"><BookOpen className="w-4 h-4" />{progress ? 'Continue Reading' : 'Read Book'}</Link>
      </div>
    </section>
  </div>;
};
