'use client';

import React, { useState } from 'react';
import { Trees, Hammer, HelpCircle } from 'lucide-react';

interface ProductImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fallbackIcon?: 'trees' | 'hammer' | 'help';
  aspectRatio?: string; // e.g. "aspect-[4/5]" or "aspect-square"
  roundedClass?: string; // e.g. "rounded-2xl" or "rounded-full"
}

export function resolveImageUrl(src: string | null | undefined): string | null {
  if (!src) return null;

  const cleanSrc = src.trim();

  // 1. If it's already an absolute URL or local blob preview, return it directly
  if (
    cleanSrc.startsWith('http://') || 
    cleanSrc.startsWith('https://') || 
    cleanSrc.startsWith('blob:')
  ) {
    return cleanSrc;
  }

  // 2. Otherwise, treat it as a relative path served from the public/ folder of the frontend.
  // Ensure it starts with a single slash
  let path = cleanSrc;
  if (path.startsWith('/')) {
    path = path.slice(1);
  }
  return `/${path}`;
}

export default function ProductImage({
  src,
  alt,
  className = '',
  fallbackIcon = 'trees',
  aspectRatio = 'aspect-[4/5]',
  roundedClass = 'rounded-2xl',
  ...props
}: ProductImageProps) {
  // Resolve image URL during render (avoiding state synchronisation warning)
  const imgSrc = resolveImageUrl(src);
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(imgSrc ? 'loading' : 'error');

  // Sync state if src prop changes during render
  const [prevSrc, setPrevSrc] = useState<string | null | undefined>(src);
  if (src !== prevSrc) {
    setPrevSrc(src);
    setStatus(imgSrc ? 'loading' : 'error');
  }

  const handleLoad = () => {
    setStatus('loaded');
  };

  const handleError = () => {
    setStatus('error');
  };

  // Render the beautiful wood-inspired fallback placeholder
  const renderFallback = () => {
    const IconComponent = () => {
      switch (fallbackIcon) {
        case 'hammer':
          return <Hammer className="w-10 h-10 text-[#A67B5B]/60" />;
        case 'help':
          return <HelpCircle className="w-10 h-10 text-[#A67B5B]/60" />;
        case 'trees':
        default:
          return <Trees className="w-12 h-12 text-[#A67B5B]/60" />;
      }
    };

    return (
      <div 
        className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#f8f5f0] via-[#f3ede2] to-[#e8decb] border border-[#e1d5c0] ${roundedClass} relative overflow-hidden p-6 text-center select-none ${aspectRatio}`}
      >
        {/* Subtle wood-grain pattern simulation using absolute lines */}
        <div className="absolute inset-0 opacity-5 pointer-events-none mix-blend-overlay">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <pattern id="wood-grain" width="100" height="20" patternUnits="userSpaceOnUse">
              <path d="M 0 10 Q 25 5, 50 10 T 100 10" fill="none" stroke="#000" strokeWidth="1" />
              <path d="M 0 15 Q 35 12, 70 15 T 100 15" fill="none" stroke="#000" strokeWidth="0.5" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#wood-grain)" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="p-4 bg-white/80 rounded-full shadow-inner border border-[#e1d5c0]/40 backdrop-blur-sm">
            <IconComponent />
          </div>
          <div className="space-y-1">
            <p className="font-serif font-semibold text-stone-700 text-sm italic">
              Menuiserie Digitale
            </p>
            <p className="text-[10px] uppercase font-bold tracking-widest text-[#A67B5B]">
              Création Artisanale
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (status === 'error' || !imgSrc) {
    return renderFallback();
  }

  return (
    <div className={`relative overflow-hidden w-full h-full ${roundedClass} bg-[#f8f5f0] ${aspectRatio}`}>
      {/* Loading Skeleton Shimmer */}
      {status === 'loading' && (
        <div className="absolute inset-0 animate-shimmer">
          <div className="w-full h-full flex items-center justify-center">
            <Trees className="w-8 h-8 text-[#A67B5B]/30 animate-pulse" />
          </div>
        </div>
      )}

      {/* Actual Image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imgSrc}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full object-cover transition-all duration-700 ease-out ${
          status === 'loaded' 
            ? 'scale-100 opacity-100 blur-0' 
            : 'scale-105 opacity-0 blur-sm'
        } ${className}`}
        loading="lazy"
        {...props}
      />
    </div>
  );
}
