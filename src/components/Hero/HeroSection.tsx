import React from 'react';
import { Sparkles, BookOpen, Coffee, Feather, Bookmark } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section
      id="hero-section"
      className="relative overflow-hidden pt-10 pb-8 sm:pt-14 sm:pb-10 border-b border-[#e5e5de] bg-[#fdfdfa]"
    >
      {/* Decorative ambient background accents */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-full max-w-4xl h-36 bg-[#e6e3da]/30 blur-3xl rounded-full pointer-events-none -z-10" />
      <div className="absolute top-12 left-10 w-28 h-28 bg-[#d9d9c3]/20 blur-2xl rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          {/* Aesthetic pill badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#f5f5f0] border border-[#e5e5de] text-[#5A5A40] text-xs font-semibold mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#5A5A40]" />
            <span>Digital Bookshelf & In-Browser PDF Reader</span>
            <span className="w-1 h-1 rounded-full bg-[#5A5A40]/40" />
            <span className="text-[#8c8c82] font-normal">Zero setup required</span>
          </div>

          {/* Main Hero Title */}
          <h1 className="text-3xl sm:text-5xl font-serif-book font-light text-[#2d2d2b] tracking-tight leading-[1.2] mb-4">
            Your little corner for good books.
          </h1>

          {/* Subtitle */}
          <p className="text-[#8c8c82] text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-6">
            Read, explore, and keep your favorite stories close in our quiet digital bookshelf.
          </p>

          {/* Cozy Features Highlights */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs text-[#5A5A40] font-medium">
            <div className="flex items-center gap-1.5 bg-[#f5f5f0] px-3 py-1 rounded-full border border-[#e5e5de] cute-btn">
              <BookOpen className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span>Two-Page Book Spread</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#f5f5f0] px-3 py-1 rounded-full border border-[#e5e5de] cute-btn">
              <Coffee className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span>Warm & Calm Modes</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#f5f5f0] px-3 py-1 rounded-full border border-[#e5e5de] cute-btn">
              <Bookmark className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span>Reading Progress Save</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#f5f5f0] px-3 py-1 rounded-full border border-[#e5e5de] cute-btn">
              <Feather className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span>Touch Swipe Turning</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

