import { useEffect, useState, useCallback, useRef } from 'react';
import { weatherAPI, WeatherData, IRAQI_CITIES } from '@/services/weatherApi';

interface UseWeatherAPIReturn {
  weatherData: WeatherData[];
  formattedWeatherData: ReturnType<typeof weatherAPI.formatWeatherForDisplay>[];
  error: string | null;
  refresh: () => Promise<void>;
  lastUpdated: Date | null;
  isLoading: boolean;
}

interface UseWeatherAPIOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
  fetchOnMount?: boolean;
  useProxy?: boolean; // Whether to use the API proxy
  initialData?: WeatherData[]; // Pre-fetched server data
}

/**
 * Custom hook for fetching and managing weather data from OpenWeatherMap API
 * 
 * Features:
 * - Immediate fallback data to prevent loading states
 * - Error handling with graceful fallback
 * - Page-load-only updates (no auto-refresh by default)
 * - Optimized for Iraqi cities weather display
 */
export function useWeatherAPI(options: UseWeatherAPIOptions = {}): UseWeatherAPIReturn {
  const {
    autoRefresh = false, // Default: no auto-refresh (page load only)
    refreshInterval = 600000, // 10 minutes default if auto-refresh enabled
    fetchOnMount = true,
    useProxy = true,
    initialData
  } = options;

  // Use initialData if provided, otherwise start with fallback data
  const getFallbackData = (): WeatherData[] => {
    const now = Math.floor(Date.now() / 1000);
    const timezone = 3 * 3600; // Iraq timezone offset
    
    return IRAQI_CITIES.slice(0, 8).map((city, index) => ({
      coord: city.coordinates,
      weather: [{
        id: 800,
        main: 'Clear',
        description: 'clear sky',
        icon: '01d'
      }],
      base: 'stations',
      main: {
        temp: 25 + index, // Varied temperatures in Celsius
        feels_like: 27 + index,
        temp_min: 22 + index,
        temp_max: 28 + index,
        pressure: 1013,
        humidity: 60 - index * 2
      },
      visibility: 10000,
      wind: {
        speed: 15, // km/h
        deg: 180
      },
      clouds: {
        all: 20
      },
      dt: now,
      sys: {
        country: 'IQ',
        sunrise: now - 6 * 3600,
        sunset: now + 6 * 3600
      },
      timezone,
      id: city.id,
      name: city.name,
      cod: 200
    }));
  };

  const [weatherData, setWeatherData] = useState<WeatherData[]>(
    initialData && initialData.length > 0 ? initialData : getFallbackData()
  );
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef<boolean>(true);

  /**
   * Format weather data for display
   */
  const formattedWeatherData = weatherData.map(data => 
    weatherAPI.formatWeatherForDisplay(data)
  );

  /**
   * Fetch weather data from API (background refresh only)
   */
  const fetchWeather = useCallback(async () => {
    if (!isMountedRef.current) return;

    try {
      setError(null);
      setIsLoading(true);

      if (process.env.NODE_ENV === 'development') {
        console.log('🌤️ Fetching latest weather data for Iraqi cities...');
      }

      let weatherResponse: WeatherData[];
      
      if (useProxy) {
        weatherResponse = await weatherAPI.fetchIraqWeatherViaProxy();
      } else {
        weatherResponse = await weatherAPI.fetchIraqWeather();
      }
      
      if (!isMountedRef.current) return;

      if (weatherResponse.length > 0) {
        setWeatherData(weatherResponse);
        setLastUpdated(new Date());
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ Successfully loaded weather for ${weatherResponse.length} cities`);
          console.log('🌤️ Sample weather data:', weatherResponse.slice(0, 2).map(w => ({
            city: w.name,
            temp: w.main.temp,
            condition: w.weather[0].description
          })));
        }
      }

    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Error fetching weather:', err);
      }
      
      if (!isMountedRef.current) return;

      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch weather data';
      setError(errorMessage);
      
      // Keep existing weather data, never clear them on error
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Keeping existing weather data due to API error');
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [useProxy]);

  /**
   * Manual refresh function
   */
  const refresh = useCallback(async () => {
    await fetchWeather();
  }, [fetchWeather]);

  /**
   * Set up auto-refresh interval (if enabled)
   */
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        fetchWeather();
      }, refreshInterval);

      if (process.env.NODE_ENV === 'development') {
        console.log(`🔄 Weather auto-refresh enabled: every ${refreshInterval / 1000} seconds`);
      }

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
          refreshIntervalRef.current = null;
        }
      };
    }
  }, [autoRefresh, refreshInterval, fetchWeather]);

  /**
   * Initial data fetch (only if no initialData provided)
   */
  useEffect(() => {
    const hasInitialData = initialData && initialData.length > 0;
    if (fetchOnMount && !hasInitialData) {
      fetchWeather();
    }
  }, [fetchOnMount, fetchWeather, initialData]);

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
    weatherData,
    formattedWeatherData,
    error,
    refresh,
    lastUpdated,
    isLoading
  };
}

/**
 * Simplified hook specifically for weather page
 * Pre-configured with optimal settings for Iraqi weather display
 */
export function useIraqWeather(initialData?: WeatherData[]) {
  return useWeatherAPI({
    autoRefresh: false, // Page load only
    refreshInterval: 0, // No auto-refresh
    fetchOnMount: true,
    useProxy: true,
    initialData
  });
}

/**
 * Hook for weather with auto-refresh capability
 * Use this for dashboard or live weather displays
 */
export function useIraqWeatherLive(refreshInterval: number = 600000) {
  return useWeatherAPI({
    autoRefresh: true,
    refreshInterval, // 10 minutes default
    fetchOnMount: true,
    useProxy: true
  });
}

/**
 * Hook for single city weather
 */
export function useCityWeather(cityName: string) {
  const [cityWeather, setCityWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchCityWeather = useCallback(async () => {
    if (!cityName) return;

    try {
      setError(null);
      setIsLoading(true);

      if (process.env.NODE_ENV === 'development') {
        console.log(`🌤️ Fetching weather for ${cityName}...`);
      }

      const weather = await weatherAPI.fetchCityWeather(cityName);
      setCityWeather(weather);
      setLastUpdated(new Date());

      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Successfully loaded weather for ${cityName}`);
      }

    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`❌ Error fetching weather for ${cityName}:`, err);
      }

      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch city weather';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [cityName]);

  const refresh = useCallback(async () => {
    await fetchCityWeather();
  }, [fetchCityWeather]);

  useEffect(() => {
    fetchCityWeather();
  }, [fetchCityWeather]);

  return {
    cityWeather,
    formattedWeather: cityWeather ? weatherAPI.formatWeatherForDisplay(cityWeather) : null,
    error,
    refresh,
    lastUpdated,
    isLoading
  };
}

export default useWeatherAPI;
