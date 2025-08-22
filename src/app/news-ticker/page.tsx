'use client';

import { useEffect } from 'react';
import NewsTickerText from '@/components/NewsTickerText';
import AnimatedTextSlider from '@/components/AnimatedTextSlider';
import { useNewsTicker } from '@/hooks/useNewsAPI';

export default function NewsTickerPage() {
  // Fetch real news data from 964 Media API
  const { newsItems, loading, error, refresh, lastUpdated } = useNewsTicker();

  const animatedTexts = [
    '#العراق_بصورة_أوضح',
    'www.964media.com'
  ];

  // Log API status for debugging
  useEffect(() => {
    if (loading) {
      console.log('🔄 Loading news from 964 Media API...');
    } else if (error) {
      console.warn('⚠️ API Error (using fallback):', error);
    } else {
      console.log('✅ News loaded successfully:', newsItems.length, 'items');
      if (lastUpdated) {
        console.log('📅 Last updated:', lastUpdated.toLocaleString('ar-IQ'));
      }
    }
  }, [loading, error, newsItems.length, lastUpdated]);

  // Show loading state only on initial load
  if (loading && newsItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#0000ff] flex items-end">
        <div className="w-full h-20 flex">
          <div className="w-4/5 bg-white relative overflow-hidden flex items-center justify-center">
            <div className="text-black text-2xl font-bold arabic-font">
              جاري تحميل الأخبار...
            </div>
          </div>
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

  return (
    <div className="min-h-screen bg-[#0000ff] flex items-end">
      {/* API Status Indicator (for debugging - can be removed in production) */}
      {error && process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 left-4 bg-yellow-500 text-black px-3 py-1 rounded text-sm z-50">
          ⚠️ API Error: Using fallback data
        </div>
      )}
      
      {lastUpdated && process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded text-sm z-50">
          📡 Live: {lastUpdated.toLocaleTimeString('ar-IQ')}
        </div>
      )}

      {/* Main Container at Bottom */}
      <div className="w-full h-20 flex">
        {/* White News Ticker Section - 80% */}
        <div className="w-4/5 bg-white relative overflow-hidden">
          {/* Now using real API data with automatic fallback */}
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

      {/* Manual Refresh Button (for debugging - can be removed in production) */}
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={refresh}
          className="absolute bottom-24 right-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          disabled={loading}
        >
          {loading ? '🔄' : '📰'} Refresh News
        </button>
      )}
    </div>
  );
}
