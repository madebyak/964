'use client';

import NewsTickerText from '@/components/NewsTickerText';
import AnimatedTextSlider from '@/components/AnimatedTextSlider';
import { useNewsTicker } from '@/hooks/useNewsAPI';

export default function NewsTickerPage() {
  // Fetch real news data from 964 Media API (background operation)
  const { newsItems } = useNewsTicker();

  const animatedTexts = [
    '#العراق_بصورة_أوضح',
    'www.964media.com'
  ];

  // Silent background API operation - no debug logs in production

  return (
    <div className="min-h-screen bg-[#0000ff] flex items-end">
      {/* Main Container at Bottom */}
      <div className="w-full h-20 flex">
        {/* White News Ticker Section - 80% */}
        <div className="w-4/5 bg-white relative overflow-hidden">
          {/* Using real API data with automatic fallback - no loading states shown */}
          <NewsTickerText 
            newsItems={newsItems} 
            speed={80} 
            direction="right"
            pauseOnHover={true}
          />
        </div>

        {/* Yellow Container Section - 20% */}
        <div className="w-1/5 bg-[#ffd400] relative">
          <AnimatedTextSlider 
            texts={animatedTexts} 
            intervalMs={20000}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
}
