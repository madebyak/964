import { useEffect, useState, useCallback, useRef } from 'react';
import { newsAPI, NewsAPIParams } from '@/services/newsApi';

interface UseNewsAPIReturn {
  newsItems: string[];
  error: string | null;
  refresh: () => Promise<void>;
  lastUpdated: Date | null;
}

interface UseNewsAPIOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
  fetchOnMount?: boolean;
  apiParams?: NewsAPIParams;
}

/**
 * Custom hook for fetching and managing news data from 964 Media API
 * 
 * Features:
 * - Auto-refresh capability
 * - Error handling with fallback
 * - Immediate data availability (no loading states)
 * - Optimized for ticker performance
 */
export function useNewsAPI(options: UseNewsAPIOptions = {}): UseNewsAPIReturn {
  const {
    autoRefresh = true,
    refreshInterval = 300000, // 5 minutes default
    fetchOnMount = true
  } = options;

  // Start with fallback data immediately to prevent loading state
  const fallbackNews = [
    'الانتخابات القادمة تشبه 2005 ـ الحكيم من اليوسفية: استحقاق مصيري يؤسس للاستقرار المستدام',
    'مشهد مؤلم.. مصرع عامل بإحدى شركات الكهرباء إثر تعرضه لصدمة كهربائية في الناصرية',
    'السليمانية تلتهب.. حملة اعتقالات تطال قيادات بارزة في الاتحاد الوطني الكردستاني',
    'محكمة استئناف في نيويورك تلغي غرامة على ترامب بنحو نصف مليار دولار',
    'خلال لقائه عدداً من ذوي الضحايا.. السيد الحكيم يدعو إلى تلافي تكرار حادثة الكوت'
  ];

  const [newsItems, setNewsItems] = useState<string[]>(fallbackNews);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef<boolean>(true);

  /**
   * Fetch news data from API (background refresh only)
   */
  const fetchNews = useCallback(async () => {
    if (!isMountedRef.current) return;

    try {
      setError(null);

      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Fetching latest news from 964 Media API...');
      }

      const posts = await newsAPI.getTickerPosts();
      
      if (!isMountedRef.current) return;

      if (posts.length > 0) {
        setNewsItems(posts);
        setLastUpdated(new Date());
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ Successfully loaded ${posts.length} news items`);
          console.log('📰 Latest headlines:', posts.slice(0, 2));
        }
      }

    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Error fetching news:', err);
      }
      
      if (!isMountedRef.current) return;

      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch news';
      setError(errorMessage);
      
      // Keep existing news items, never clear them on error
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Keeping existing news data due to API error');
      }
    }
  }, []);

  /**
   * Manual refresh function
   */
  const refresh = useCallback(async () => {
    await fetchNews();
  }, [fetchNews]);

  /**
   * Set up auto-refresh interval
   */
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        fetchNews();
      }, refreshInterval);

      if (process.env.NODE_ENV === 'development') {
        console.log(`🔄 Auto-refresh enabled: every ${refreshInterval / 1000} seconds`);
      }

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
          refreshIntervalRef.current = null;
        }
      };
    }
  }, [autoRefresh, refreshInterval, fetchNews]);

  /**
   * Initial data fetch
   */
  useEffect(() => {
    if (fetchOnMount) {
      fetchNews();
    }
  }, [fetchOnMount, fetchNews]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  return {
    newsItems,
    error,
    refresh,
    lastUpdated
  };
}

/**
 * Simplified hook specifically for ticker component
 * Pre-configured with optimal settings for news ticker
 */
export function useNewsTicker() {
  return useNewsAPI({
    autoRefresh: true,
    refreshInterval: 300000, // 5 minutes
    fetchOnMount: true,
    apiParams: {
      limit: 10,
      orderby: 'date',
      order: 'desc',
      type: 'any'
    }
  });
}

export default useNewsAPI;
