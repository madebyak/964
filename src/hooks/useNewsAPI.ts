import { useEffect, useState, useCallback, useRef } from 'react';
import { newsAPI, NewsAPIParams } from '@/services/newsApi';
import { wiresAPI, WireHeadline } from '@/services/wiresApi';
import { meWiresAPI } from '@/services/meWiresApi';

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

// Iraq Wires API Hook Interfaces
interface UseWiresAPIReturn {
  wireHeadlines: WireHeadline[];
  error: string | null;
  refresh: () => Promise<void>;
  lastUpdated: Date | null;
}

interface UseWiresAPIOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  fetchOnMount?: boolean;
  wiresParams?: { limit?: number };
  initialData?: WireHeadline[]; // Pre-fetched server data
}

/**
 * Custom hook for Iraq Wires headlines (following news-ticker success pattern)
 * 
 * Features:
 * - Immediate fallback data (no loading states)
 * - Auto-refresh capability
 * - Error handling with graceful fallback
 * - Background API updates
 */
export function useWiresAPI(options: UseWiresAPIOptions = {}): UseWiresAPIReturn {
  const {
    autoRefresh = true,
    refreshInterval = 300000, // 5 minutes
    fetchOnMount = true,
    wiresParams = {},
    initialData
  } = options;

  // Use initialData if provided, otherwise fallback data
  const fallbackWires: WireHeadline[] = [
    {
      id: '1',
      title: 'وزارة الصحة: ارتفاع نسب التطعيم في المحافظات',
      date: new Date().toISOString(),
      source: {
        name: 'وزارة الصحة',
        slug: 'ministry-health',
        icon: '',
        permalink: '#',
        type: 'government'
      },
      permalink: '#'
    },
    {
      id: '2', 
      title: 'المرور: خطة لتحسين انسيابية حركة السير في العاصمة',
      date: new Date().toISOString(),
      source: {
        name: 'مديرية المرور العامة',
        slug: 'traffic-dept',
        icon: '',
        permalink: '#', 
        type: 'government'
      },
      permalink: '#'
    },
    {
      id: '3',
      title: 'المنتخب الوطني يستعد لمباراة ودية الأسبوع المقبل',
      date: new Date().toISOString(),
      source: {
        name: 'الاتحاد العراقي لكرة القدم',
        slug: 'iraq-fa',
        icon: '',
        permalink: '#',
        type: 'sports'
      },
      permalink: '#'
    }
  ];

  const [wireHeadlines, setWireHeadlines] = useState<WireHeadline[]>(
    initialData && initialData.length > 0 ? initialData : fallbackWires
  );
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef<boolean>(true);

  /**
   * Fetch wires data from API (background refresh only)
   */
  const fetchWires = useCallback(async () => {
    if (!isMountedRef.current) return;

    try {
      setError(null);

      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Fetching latest Iraq Wires headlines...');
      }

      const headlines = await wiresAPI.fetchHeadlines({ limit: wiresParams.limit });
      
      if (!isMountedRef.current) return;

      if (headlines.length > 0) {
        setWireHeadlines(headlines);
        setLastUpdated(new Date());
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ Successfully loaded ${headlines.length} wire headlines`);
          console.log('📰 Latest headlines:', headlines.slice(0, 2).map(h => h.title));
        }
      }

    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Error fetching wires:', err);
      }
      
      if (!isMountedRef.current) return;

      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch wires';
      setError(errorMessage);
      
      // Keep existing wire headlines, never clear them on error
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Keeping existing wires data due to API error');
      }
    }
  }, [wiresParams.limit]);

  /**
   * Manual refresh function
   */
  const refresh = useCallback(async () => {
    await fetchWires();
  }, [fetchWires]);

  /**
   * Set up auto-refresh interval
   */
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        fetchWires();
      }, refreshInterval);

      if (process.env.NODE_ENV === 'development') {
        console.log(`🔄 Iraq Wires auto-refresh enabled: every ${refreshInterval / 1000} seconds`);
      }

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
          refreshIntervalRef.current = null;
        }
      };
    }
  }, [autoRefresh, refreshInterval, fetchWires]);

  /**
   * Initial data fetch (only if no initialData provided)
   */
  useEffect(() => {
    const hasInitialData = initialData && initialData.length > 0;
    if (fetchOnMount && !hasInitialData) {
      fetchWires();
    }
  }, [fetchOnMount, fetchWires, initialData]);

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
    wireHeadlines,
    error,
    refresh,
    lastUpdated
  };
}

/**
 * Custom hook for Iraq Wires headlines
 * Following the same successful pattern as useNewsTicker
 */
export function useIraqWires(initialData?: WireHeadline[]) {
  return useWiresAPI({
    autoRefresh: true,
    refreshInterval: 300000, // 5 minutes
    fetchOnMount: true,
    wiresParams: {
      limit: 20
    },
    initialData
  });
}
// ME Wires hook (Middle East/global) using new meWiresAPI service
export function useMeWires(initialData?: WireHeadline[], options?: { country?: string; limit?: number }) {
  const country = options?.country ?? 'global';
  const limit = options?.limit ?? 20;

  // Reuse the same structure/state logic as useWiresAPI but fetch from meWiresAPI
  const [wireHeadlines, setWireHeadlines] = useState<WireHeadline[]>(
    initialData && initialData.length > 0 ? initialData : []
  );
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef<boolean>(true);

  const fetchWires = useCallback(async () => {
    if (!isMountedRef.current) return;
    try {
      setError(null);
      const headlines = await meWiresAPI.fetchHeadlines({ country, limit });
      if (!isMountedRef.current) return;
      if (headlines.length > 0) {
        setWireHeadlines(headlines);
        setLastUpdated(new Date());
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch me wires';
      setError(errorMessage);
    }
  }, [country, limit]);

  const refresh = useCallback(async () => {
    await fetchWires();
  }, [fetchWires]);

  useEffect(() => {
    refreshIntervalRef.current = setInterval(() => {
      fetchWires();
    }, 300000);
    return () => {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    };
  }, [fetchWires]);

  useEffect(() => {
    const hasInitial = initialData && initialData.length > 0;
    if (!hasInitial) fetchWires();
  }, [fetchWires, initialData]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    };
  }, []);

  return { wireHeadlines, error, refresh, lastUpdated };
}


export default useNewsAPI;
