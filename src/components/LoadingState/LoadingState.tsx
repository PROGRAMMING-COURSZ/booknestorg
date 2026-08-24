import React from 'react';
import { BookOpen, Sparkles } from 'lucide-react';

interface LoadingStateProps {
  type?: 'grid' | 'reader' | 'simple';
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  type = 'grid',
  message = 'Loading your library...',
}) => {
  if (type === 'reader') {
    return (
      <div
        id="reader-loading-state"
        className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center"
      >
        <div className="relative mb-5">
          <div className="w-16 h-16 rounded-2xl bg-[#5A5A40]/10 text-[#5A5A40] flex items-center justify-center shadow-inner animate-pulse">
            <BookOpen className="w-8 h-8 text-[#5A5A40]" />
          </div>
          <Sparkles className="w-5 h-5 text-[#5A5A40] fill-[#5A5A40]/30 absolute -top-1.5 -right-1.5 animate-bounce" />
        </div>
        <h3 className="font-serif-book font-bold text-xl text-[#2d2d2b] mb-1.5">
          {message}
        </h3>
        <p className="text-xs text-[#8c8c82] max-w-xs leading-relaxed">
          Rendering PDF pages and typography directly in your browser.
        </p>
      </div>
    );
  }

  // Grid Skeleton Loader
  return (
    <div id="grid-loading-state" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="bg-[#f5f5f0] rounded-2xl border border-[#e5e5de] p-3 shadow-2xs animate-pulse flex flex-col"
          >
            <div className="aspect-[3/4] bg-[#e5e5de] rounded-xl mb-3" />
            <div className="h-4 bg-[#e5e5de] rounded-full w-3/4 mb-2" />
            <div className="h-3 bg-[#e5e5de]/70 rounded-full w-1/2 mb-4" />
            <div className="mt-auto pt-2 border-t border-[#e5e5de]/40 flex gap-2">
              <div className="h-9 bg-[#e5e5de] rounded-full flex-1" />
              <div className="h-9 w-9 bg-[#e5e5de] rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
