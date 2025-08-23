'use client';

import NewsTickerText from '@/components/NewsTickerText';
import TimeZoneDisplay from '@/components/TimeZoneDisplay';
import { useNewsTicker } from '@/hooks/useNewsAPI';
import Image from 'next/image';

export default function NewsTicker2Page() {
  // Fetch real news data from 964 Media API (background operation)
  const { newsItems } = useNewsTicker();

  // Silent background API operation - no debug logs in production

  return (
    <div className="min-h-screen bg-[#0000ff] flex items-end">
      {/* Main Container at Bottom */}
      <div className="w-full flex flex-col">
        {/* Top Row - Logo aligned with time container */}
        <div className="w-full h-20 flex">
          {/* Empty/Transparent Space - Same width as news ticker */}
          <div className="flex-1"></div>

          {/* Logo Container Section - Same width as yellow container */}
          <div className="w-1/6 bg-[#e7eff7] relative flex items-center justify-center">
            <div className="w-28 h-auto">
              <Image
                src="/logo-black.svg"
                alt="964 Media Logo"
                width={112}
                height={56}
                className="w-full h-auto object-contain"
                priority
              />
            </div>
          </div>
        </div>

        {/* Bottom Row - News Ticker with Time */}
        <div className="w-full h-20 flex">
          {/* White News Ticker Section - ~84% */}
          <div className="flex-1 bg-white relative overflow-hidden">
            <NewsTickerText 
              newsItems={newsItems} 
              speed={80} 
              direction="right"
              pauseOnHover={true}
            />
          </div>

          {/* Yellow Time Container Section - ~16% */}
          <div className="w-1/6 bg-[#ffd400] relative">
            <TimeZoneDisplay 
              className="h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
