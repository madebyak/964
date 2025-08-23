'use client';

import NewsTickerText from '@/components/NewsTickerText';
import CompactTimeDisplay from '@/components/CompactTimeDisplay';
import LogoVideo from '@/components/LogoVideo';
import { useNewsTicker } from '@/hooks/useNewsAPI';

export default function NewsTicker3Page() {
  // Fetch real news data from 964 Media API (background operation)
  const { newsItems } = useNewsTicker();

  // Silent background API operation - no debug logs in production

  return (
    <div className="min-h-screen bg-[#0000ff] flex items-end">
      {/* Main Container at Bottom with 4 sections including separator */}
      <div className="w-full h-20 flex">
        {/* Left Video Container - ~15% */}
        <div className="w-[15%] bg-white relative overflow-hidden p-2">
          <LogoVideo />
        </div>

        {/* Yellow separator line - very thin */}
        <div className="w-[0.5%] bg-[#ffd400]"></div>

        {/* Middle News Ticker Container - ~79.5% */}
        <div className="w-[79.5%] bg-white relative overflow-hidden">
          <NewsTickerText 
            newsItems={newsItems} 
            speed={80} 
            direction="right"
            pauseOnHover={true}
          />
        </div>

        {/* Right Time Container - ~5% */}
        <div className="w-[5%] bg-[#ffd400] relative">
          <CompactTimeDisplay 
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
}
