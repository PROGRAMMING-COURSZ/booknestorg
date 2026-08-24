import React from 'react';
import { BookOpen, FileText } from 'lucide-react';

interface FallbackCoverProps {
  title: string;
  author?: string;
}

// Generate consistent Warm Organic / Cultural color palette derived from book title hash
function getCozyPalette(title: string) {
  const palettes = [
    { bg: 'bg-[#5A5A40]', innerBg: 'bg-[#e6e3da]', border: 'border-[#5A5A40]', accent: 'text-[#5A5A40]', text: 'text-[#2d2d2b]', tag: 'Editor\'s Choice' },
    { bg: 'bg-[#D9D9C3]', innerBg: 'bg-[#f0f0ea]', border: 'border-[#D9D9C3]', accent: 'text-[#5A5A40]', text: 'text-[#2d2d2b]', tag: 'Featured Title' },
    { bg: 'bg-[#F2E8DA]', innerBg: 'bg-[#f8f5f0]', border: 'border-[#F2E8DA]', accent: 'text-[#7A5844]', text: 'text-[#2d2d2b]', tag: 'Popular Classic' },
    { bg: 'bg-[#E8EDEA]', innerBg: 'bg-[#f2f5f4]', border: 'border-[#E8EDEA]', accent: 'text-[#4A5E52]', text: 'text-[#2d2d2b]', tag: 'Library Edition' },
    { bg: 'bg-[#7A5844]', innerBg: 'bg-[#f5ede7]', border: 'border-[#7A5844]', accent: 'text-[#7A5844]', text: 'text-[#2d2d2b]', tag: 'Curated' },
    { bg: 'bg-[#383733]', innerBg: 'bg-[#ecebe6]', border: 'border-[#383733]', accent: 'text-[#383733]', text: 'text-[#2d2d2b]', tag: 'Collector\'s' },
  ];

  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % palettes.length;
  return palettes[index];
}

export const FallbackCover: React.FC<FallbackCoverProps> = ({ title, author }) => {
  const palette = getCozyPalette(title);

  return (
    <div
      className={`w-full h-full ${palette.innerBg} ${palette.text} p-5 flex flex-col items-center justify-between text-center relative overflow-hidden select-none`}
    >
      {/* Decorative top label */}
      <div className="relative z-10">
        <span className="text-[10px] uppercase tracking-widest text-[#5A5A40] font-bold opacity-75">
          {palette.tag}
        </span>
      </div>

      {/* Center Book Title & Icon */}
      <div className="relative z-10 my-auto text-center px-2">
        <div className="w-8 h-8 mx-auto mb-2.5 rounded-full bg-white/80 flex items-center justify-center text-[#5A5A40] shadow-xs">
          <BookOpen className="w-4 h-4" />
        </div>
        <h3 className="font-serif-book font-semibold text-base sm:text-lg leading-tight line-clamp-3 mb-1.5 text-[#2d2d2b]">
          {title}
        </h3>
        <p className="text-[11px] text-[#8c8c82] font-medium line-clamp-1">
          {author || 'Unknown Author'}
        </p>
        <div className="mt-3.5 w-8 h-px bg-[#5A5A40] opacity-30 mx-auto" />
      </div>

      {/* Bottom info */}
      <div className="relative z-10">
        <span className="text-[9px] uppercase tracking-wider text-[#8c8c82] font-mono">
          BookNest Reader
        </span>
      </div>
    </div>
  );
};

