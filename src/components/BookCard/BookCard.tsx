import React, { useState } from 'react';
import { BookOpen, Download, FileText, BookmarkCheck, CheckCircle2, Heart } from 'lucide-react';
import { Book } from '../../types/book';
import { useReadingProgress } from '../../hooks/useReadingProgress';
import { setBookFavorite } from '../../utils/readingProgress';
import { FallbackCover } from './FallbackCover';
import { resolvePublicUrl } from '../../utils/pdfUtils';

interface BookCardProps { book: Book; index?: number; onSelect?: (book: Book) => void; }

export const BookCard: React.FC<BookCardProps> = ({ book, onSelect }) => {
  const { progress } = useReadingProgress(book.id);
  const completed = Boolean(progress?.completed);
  const favorite = Boolean(progress?.favorite);
  const hasProgress = Boolean(progress && progress.lastPage >= 1);
  const [coverFailed, setCoverFailed] = useState(false);
  const cover = book.template_img ? resolvePublicUrl(book.template_img) : '';
  const download = (e: React.MouseEvent) => {
    e.stopPropagation(); const link = document.createElement('a'); link.href = book.file;
    link.download = `${book.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`; document.body.appendChild(link); link.click(); link.remove();
  };
  return (
    <article id={`book-card-${book.id}`} className="group relative flex flex-col rounded-3xl p-2 bg-[#fdfdfa] border border-[#e5e5de]/70 shadow-2xs hover:border-[#dec8a7] transition-all duration-300">
      <button type="button" onClick={() => onSelect?.(book)} className="block relative aspect-[3/4] w-full rounded-2xl bg-[#5A5A40] overflow-hidden shadow-sm border-4 border-white mb-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5A5A40]" aria-label={`View details for ${book.title}`}>
        {cover && !coverFailed && <img src={cover} alt={`Cover for ${book.title}`} className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]" loading="lazy" onError={() => setCoverFailed(true)} />}
        {(!cover || coverFailed) && <FallbackCover title={book.title} author={book.author} />}
        <div className="absolute bottom-3 right-3"><span className="px-2 py-0.5 bg-white/95 rounded-full text-[9px] font-bold text-[#5A5A40] shadow-xs flex items-center gap-1"><FileText className="w-2.5 h-2.5" /> PDF</span></div>
        <div className="absolute bottom-3 left-3">{completed ? <span className="px-2 py-0.5 bg-white/95 rounded-full text-[9px] font-semibold text-[#5A5A40] flex gap-1"><CheckCircle2 className="w-3 h-3" />Completed</span> : hasProgress ? <span className="px-2 py-0.5 bg-white/95 rounded-full text-[9px] font-semibold text-[#5A5A40] flex gap-1"><BookmarkCheck className="w-3 h-3" />{progress?.percentage}%</span> : null}</div>
        {hasProgress && <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/25"><div className="h-full bg-[#dec8a7]" style={{ width: `${progress?.percentage || 0}%` }} /></div>}
      </button>
      <div className="flex flex-col flex-1 justify-between px-1"><div>
        <h4 className="font-serif-book font-medium text-sm text-[#2d2d2b] leading-snug line-clamp-1"><button type="button" onClick={() => onSelect?.(book)} className="text-left focus:outline-none focus-visible:underline">{book.title}</button></h4>
        <p className="text-xs text-[#8c8c82] mt-0.5 line-clamp-1">{book.author || 'Unknown Author'}</p>
        {hasProgress && <p className="mt-2 text-[11px] text-[#5A5A40] font-medium">{completed ? 'Completed 100%' : `Page ${progress?.lastPage} of ${progress?.totalPages}`}</p>}
      </div><div className="mt-3 pt-2 border-t border-[#e5e5de]/70 flex items-center gap-2">
        <button type="button" onClick={() => onSelect?.(book)} className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-semibold text-white bg-[#5A5A40] rounded-full cute-btn"><BookOpen className="w-3 h-3" />Details</button>
        <button type="button" onClick={() => setBookFavorite(book.id, !favorite)} className={`p-1.5 rounded-full border cute-btn ${favorite ? 'bg-[#5A5A40] text-[#dec8a7]' : 'bg-[#f5f5f0] text-[#5A5A40] border-[#e5e5de]'}`} aria-label={favorite ? `Remove ${book.title} from favorites` : `Add ${book.title} to favorites`} aria-pressed={favorite}><Heart className={`w-3.5 h-3.5 ${favorite ? 'fill-current' : ''}`} /></button>
        <button type="button" onClick={download} className="p-1.5 text-[#5A5A40] bg-[#f5f5f0] rounded-full border border-[#e5e5de] cute-btn" aria-label={`Download ${book.title}`}><Download className="w-3.5 h-3.5" /></button>
      </div></div>
    </article>
  );
};
