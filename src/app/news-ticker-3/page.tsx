'use client';

import NewsTickerText from '@/components/NewsTickerText';
import CompactTimeDisplay from '@/components/CompactTimeDisplay';
import { useNewsTicker } from '@/hooks/useNewsAPI';
import Image from 'next/image';

export default function NewsTicker3Page() {
  // Fetch real news data from 964 Media API (background operation)
  const { newsItems } = useNewsTicker();

  // Silent background API operation - no debug logs in production

  return (
    <div className="min-h-screen bg-[#0000ff] flex items-end">
      {/* Main Container at Bottom with 4 sections including separator */}
      <div className="w-full h-20 flex">
        {/* Left Logo Container - responsive width */}
        <div className="w-[12%] lg:w-[15%] bg-white relative overflow-hidden p-2 flex items-center justify-center">
          <div className="w-full h-auto max-w-24 lg:max-w-32">
            <Image
              src="/logo-black.svg"
              alt="964 Media Logo"
              width={128}
              height={64}
              className="w-full h-auto object-contain"
              priority
            />
          </div>
        </div>

        {/* Yellow separator line - very thin */}
        <div className="w-[0.5%] bg-[#ffd400]"></div>

        {/* Middle News Ticker Container - responsive width */}
        <div className="w-[77.5%] lg:w-[79.5%] bg-white relative overflow-hidden">
          <NewsTickerText 
            newsItems={newsItems} 
            speed={80} 
            direction="right"
            pauseOnHover={true}
          />
        </div>

        {/* Right Time Container - larger on small screens */}
        <div className="w-[10%] lg:w-[5%] bg-[#ffd400] relative">
          <CompactTimeDisplay 
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
}
