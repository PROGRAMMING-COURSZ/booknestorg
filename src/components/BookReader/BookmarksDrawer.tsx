import React from 'react';
import { Bookmark, ReaderColorTheme } from '../../types/book';
import { Bookmark as BookmarkIcon, Trash2, ChevronRight, Sparkles, X, Plus } from 'lucide-react';

interface BookmarksDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks: Bookmark[];
  currentPage: number;
  colorTheme: ReaderColorTheme;
  onSelectBookmark: (pageNum: number) => void;
  onDeleteBookmark: (bookmarkId: string) => void;
  onAddCurrentPageBookmark: () => void;
  isCurrentPageBookmarked: boolean;
}

export const BookmarksDrawer: React.FC<BookmarksDrawerProps> = ({
  isOpen,
  onClose,
  bookmarks,
  currentPage,
  colorTheme,
  onSelectBookmark,
  onDeleteBookmark,
  onAddCurrentPageBookmark,
  isCurrentPageBookmarked,
}) => {
  if (!isOpen) return null;

  const isCalm = colorTheme === 'calm';
  const isSepia = colorTheme === 'sepia';

  const drawerBg = isCalm
    ? 'bg-[#f0f5ee] border-[#d5e2d5] text-[#243324]'
    : isSepia
    ? 'bg-[#f5ebd7] border-[#dec8a7] text-[#2d2d2b]'
    : 'bg-[#fdfdfa] border-[#e5e5de] text-[#2d2d2b]';

  const itemHover = isCalm
    ? 'hover:bg-[#e2ece0] border-[#d5e2d5]'
    : isSepia
    ? 'hover:bg-[#ead9be] border-[#dec8a7]'
    : 'hover:bg-[#f5f5f0] border-[#e5e5de]';

  const activeItemBg = isCalm
    ? 'bg-[#e2ece0] border-[#3d5a3d]'
    : isSepia
    ? 'bg-[#ead9be] border-[#5A5A40]'
    : 'bg-[#f5f5f0] border-[#5A5A40]';

  const formatDate = (timestamp: number) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <>
      {/* Backdrop overlay on small screens */}
      <div
        className="fixed inset-0 bg-black/30 z-40 md:hidden backdrop-blur-xs"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Drawer */}
      <aside
        id="reader-bookmarks-drawer"
        className={`fixed top-14 right-0 bottom-0 w-80 sm:w-96 z-50 border-l shadow-2xl flex flex-col transition-all duration-300 transform animate-in slide-in-from-right ${drawerBg}`}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-inherit flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#5A5A40] text-white flex items-center justify-center shadow-xs">
              <BookmarkIcon className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-serif-book">Saved Bookmarks</h2>
              <p className="text-[11px] text-[#8c8c82]">
                {bookmarks.length === 1 ? '1 saved page' : `${bookmarks.length} saved pages`}
              </p>
            </div>
          </div>

          <button
            type="button"
            id="close-bookmarks-drawer-btn"
            onClick={onClose}
            className="p-1.5 rounded-full text-[#8c8c82] hover:text-[#2d2d2b] hover:bg-black/5 transition-colors cute-btn cursor-pointer"
            aria-label="Close bookmarks drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Action Banner: Bookmark Current Page */}
        <div className="p-3 border-b border-inherit bg-black/2 flex items-center justify-between gap-2">
          <span className="text-xs text-[#5A5A40] font-medium">Current Page: {currentPage}</span>
          <button
            type="button"
            id="drawer-toggle-current-bookmark-btn"
            onClick={onAddCurrentPageBookmark}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cute-btn cursor-pointer ${
              isCurrentPageBookmarked
                ? 'bg-[#5A5A40] text-white'
                : 'bg-white border border-[#e5e5de] text-[#5A5A40] hover:bg-[#f5f5f0]'
            }`}
          >
            {isCurrentPageBookmarked ? (
              <>
                <BookmarkIcon className="w-3.5 h-3.5 fill-current text-[#dec8a7]" />
                <span>Bookmarked</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Bookmark Page {currentPage}</span>
              </>
            )}
          </button>
        </div>

        {/* Bookmarks List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {bookmarks.length === 0 ? (
            <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center p-6 text-[#8c8c82]">
              <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center mb-3 text-[#5A5A40]">
                <Sparkles className="w-6 h-6 text-[#dec8a7]" />
              </div>
              <p className="font-serif-book font-bold text-sm text-[#5A5A40]">No bookmarks yet</p>
              <p className="text-xs text-[#8c8c82] mt-1 max-w-[200px]">
                Click the Bookmark icon in the toolbar on any page to save it for quick reading access.
              </p>
              <button
                type="button"
                id="empty-state-add-bookmark-btn"
                onClick={onAddCurrentPageBookmark}
                className="mt-4 px-4 py-1.5 rounded-full bg-[#5A5A40] text-white text-xs font-semibold hover:bg-[#484833] transition-colors cute-btn cursor-pointer"
              >
                Bookmark Page {currentPage} now
              </button>
            </div>
          ) : (
            bookmarks.map((b) => {
              const isCurrent = b.pageNum === currentPage;
              return (
                <div
                  key={b.id}
                  id={`bookmark-item-${b.id}`}
                  className={`group relative flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isCurrent ? activeItemBg : itemHover
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      onSelectBookmark(b.pageNum);
                      if (window.innerWidth < 768) {
                        onClose();
                      }
                    }}
                    className="flex-1 text-left flex items-center gap-3 cursor-pointer min-w-0"
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                        isCurrent
                          ? 'bg-[#5A5A40] text-white'
                          : 'bg-black/5 text-[#5A5A40] group-hover:bg-[#5A5A40] group-hover:text-white transition-colors'
                      }`}
                    >
                      {b.pageNum}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-serif-book font-bold text-sm truncate">
                          Page {b.pageNum}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#5A5A40] text-white font-medium">
                            Current
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#8c8c82] block truncate">
                        Saved {formatDate(b.createdAt)}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8c8c82] group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </button>

                  {/* Delete Bookmark Button */}
                  <button
                    type="button"
                    id={`delete-bookmark-${b.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteBookmark(b.id);
                    }}
                    className="ml-2 p-1.5 rounded-lg text-[#8c8c82] hover:text-red-600 hover:bg-red-50 transition-colors cute-btn cursor-pointer"
                    title={`Delete bookmark for Page ${b.pageNum}`}
                    aria-label={`Delete bookmark for Page ${b.pageNum}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        {bookmarks.length > 0 && (
          <div className="p-3 border-t border-inherit text-center bg-black/2">
            <span className="text-[11px] text-[#8c8c82]">
              Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-black/5 font-mono text-[10px]">B</kbd> on your keyboard to toggle bookmarks
            </span>
          </div>
        )}
      </aside>
    </>
  );
};
