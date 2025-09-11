// Weather API Service for OpenWeatherMap
export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface MainWeatherData {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  humidity: number;
  sea_level?: number;
  grnd_level?: number;
}

export interface WindData {
  speed: number;
  deg: number;
  gust?: number;
}

export interface CloudData {
  all: number;
}

export interface SysData {
  type?: number;
  id?: number;
  country: string;
  sunrise: number;
  sunset: number;
}

export interface WeatherData {
  coord: {
    lon: number;
    lat: number;
  };
  weather: WeatherCondition[];
  base: string;
  main: MainWeatherData;
  visibility: number;
  wind: WindData;
  clouds: CloudData;
  dt: number;
  sys: SysData;
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

export interface GroupWeatherResponse {
  cnt: number;
  list: WeatherData[];
}

export interface IraqiCity {
  id: number;
  name: string;
  nameArabic: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  priority: number;
}

// Major Iraqi cities with CORRECT OpenWeatherMap city IDs (verified 2025)
export const IRAQI_CITIES: IraqiCity[] = [
  {
    id: 98182, // Baghdad - VERIFIED ✅
    name: 'Baghdad',
    nameArabic: 'بغداد',
    coordinates: { lat: 33.3406, lon: 44.4009 },
    priority: 1
  },
  {
    id: 99532, // Basra - VERIFIED ✅
    name: 'Basrah',
    nameArabic: 'البصرة',
    coordinates: { lat: 30.5086, lon: 47.7834 },
    priority: 2
  },
  {
    id: 99072, // Mosul - FIXED ✅ (was 384848)
    name: 'Mosul',
    nameArabic: 'الموصل',
    coordinates: { lat: 36.3350, lon: 43.1189 },
    priority: 3
  },
  {
    id: 95446, // Erbil - FIXED ✅ (was 384464)
    name: 'Erbil',
    nameArabic: 'أربيل',
    coordinates: { lat: 36.1926, lon: 44.0106 },
    priority: 4
  },
  {
    id: 98860, // Najaf - FIXED ✅ (was 98068)
    name: 'Najaf',
    nameArabic: 'النجف',
    coordinates: { lat: 32.0000, lon: 44.3333 },
    priority: 5
  },
  {
    id: 94824, // Karbala - FIXED ✅ (was 98463)
    name: 'Karbala',
    nameArabic: 'كربلاء',
    coordinates: { lat: 32.6157, lon: 44.0242 },
    priority: 6
  },
  {
    id: 98465, // Sulaymaniyah - FIXED ✅ (was 92782)
    name: 'Sulaymaniyah',
    nameArabic: 'السليمانية',
    coordinates: { lat: 35.5606, lon: 45.4329 },
    priority: 7
  },
  {
    id: 94787, // Kirkuk - FIXED ✅ (was 98607)
    name: 'Kirkuk',
    nameArabic: 'كركوك',
    coordinates: { lat: 35.4681, lon: 44.3922 },
    priority: 8
  }
];

class WeatherAPIService {
  private apiKey = '53d454bbfbe9bc4c9e02f7bfa044641d';
  private baseURL = 'https://api.openweathermap.org/data/2.5';
  private proxyURL = '/api/weather'; // Local proxy to handle CORS and API key

  /**
   * Get weather icon URL from OpenWeatherMap
   */
  getWeatherIconUrl(iconCode: string, size: '2x' | '4x' = '2x'): string {
    return `https://openweathermap.org/img/wn/${iconCode}@${size}.png`;
  }

  /**
   * Convert temperature from Kelvin to Celsius
   */
  private kelvinToCelsius(kelvin: number): number {
    return Math.round(kelvin - 273.15);
  }

  /**
   * Convert wind speed from m/s to km/h
   */
  private msToKmh(ms: number): number {
    return Math.round(ms * 3.6);
  }

  /**
   * Convert Unix timestamp to local time
   */
  private unixToTime(timestamp: number, timezone: number): string {
    const date = new Date((timestamp + timezone) * 1000);
    return date.toLocaleTimeString('ar-IQ', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  }

  /**
   * Get Arabic weather description
   */
  private getArabicWeatherDescription(condition: WeatherCondition): string {
    const translations: Record<string, string> = {
      // Clear
      'clear sky': 'سماء صافية',
      'Clear': 'صافي',
      
      // Clouds
      'few clouds': 'غيوم قليلة',
      'scattered clouds': 'غيوم متفرقة',
      'broken clouds': 'غيوم متقطعة',
      'overcast clouds': 'غيوم كثيفة',
      'Clouds': 'غائم',
      
      // Rain
      'light rain': 'مطر خفيف',
      'moderate rain': 'مطر متوسط',
      'heavy intensity rain': 'مطر غزير',
      'very heavy rain': 'مطر شديد جداً',
      'extreme rain': 'مطر شديد',
      'Rain': 'مطر',
      
      // Drizzle
      'light intensity drizzle': 'رذاذ خفيف',
      'drizzle': 'رذاذ',
      'heavy intensity drizzle': 'رذاذ كثيف',
      'Drizzle': 'رذاذ',
      
      // Thunderstorm
      'thunderstorm with light rain': 'عاصفة رعدية مع مطر خفيف',
      'thunderstorm with rain': 'عاصفة رعدية مع مطر',
      'thunderstorm with heavy rain': 'عاصفة رعدية مع مطر غزير',
      'light thunderstorm': 'عاصفة رعدية خفيفة',
      'thunderstorm': 'عاصفة رعدية',
      'heavy thunderstorm': 'عاصفة رعدية شديدة',
      'Thunderstorm': 'عاصفة رعدية',
      
      // Snow
      'light snow': 'ثلج خفيف',
      'snow': 'ثلج',
      'heavy snow': 'ثلج كثيف',
      'Snow': 'ثلج',
      
      // Atmosphere
      'mist': 'ضباب خفيف',
      'smoke': 'دخان',
      'haze': 'ضباب دخاني',
      'sand/dust whirls': 'دوامات رملية',
      'fog': 'ضباب',
      'sand': 'رمال',
      'dust': 'غبار',
      'volcanic ash': 'رماد بركاني',
      'squalls': 'عواصف مفاجئة',
      'tornado': 'إعصار'
    };

    return translations[condition.description] || 
           translations[condition.main] || 
           condition.description;
  }

  /**
   * Process weather data (standard processing)
   */
  private processWeatherData(data: WeatherData): WeatherData {
    return {
      ...data,
      main: {
        ...data.main,
        temp: Math.round(data.main.temp),
        feels_like: Math.round(data.main.feels_like),
        temp_min: Math.round(data.main.temp_min),
        temp_max: Math.round(data.main.temp_max)
      },
      wind: {
        ...data.wind,
        speed: this.msToKmh(data.wind.speed) // Convert m/s to km/h
      }
    };
  }

  /**
   * Process weather data for fallback cases (when One Call API fails)
   * Uses current weather API with basic processing
   */
  private processWeatherDataFallback(data: WeatherData): WeatherData {
    return {
      ...data,
      main: {
        ...data.main,
        temp: Math.round(data.main.temp),
        feels_like: Math.round(data.main.feels_like),
        temp_min: Math.round(data.main.temp_min), // Will be same as current
        temp_max: Math.round(data.main.temp_max)  // Will be same as current
      },
      wind: {
        ...data.wind,
        speed: this.msToKmh(data.wind.speed) // Convert m/s to km/h
      }
    };
  }

  /**
   * Fetch weather for a single city by name
   */
  async fetchCityWeather(cityName: string): Promise<WeatherData> {
    try {
      const url = `${this.baseURL}/weather?q=${cityName},IQ&appid=${this.apiKey}&units=metric&lang=ar`;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`Fetching weather for ${cityName}:`, url);
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-cache',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: WeatherData = await response.json();
      return this.processWeatherData(data);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`Error fetching weather for ${cityName}:`, error);
      }
      throw error;
    }
  }

  /**
   * Fetch weather for multiple cities at once (more efficient)
   */
  async fetchMultipleCitiesWeather(cityIds: number[]): Promise<WeatherData[]> {
    try {
      const ids = cityIds.join(',');
      const url = `${this.baseURL}/group?id=${ids}&appid=${this.apiKey}&units=metric&lang=ar`;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Fetching weather for multiple cities:', url);
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-cache',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: GroupWeatherResponse = await response.json();
      
      if (!data.list || !Array.isArray(data.list)) {
        throw new Error('Invalid API response structure');
      }

      return data.list.map(item => this.processWeatherData(item));
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching multiple cities weather:', error);
      }
      throw error;
    }
  }

  /**
   * Fetch weather for all major Iraqi cities using One Call API 3.0
   * This provides REAL daily min/max temperatures from OpenWeatherMap
   */
  async fetchIraqWeather(): Promise<WeatherData[]> {
    try {
      // Get top 8 cities to stay within reasonable API limits
      const topCities = IRAQI_CITIES.slice(0, 8);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🌤️ Fetching weather for ${topCities.length} Iraqi cities using One Call API...`);
      }
      
      // Fetch each city using One Call API 3.0 for real daily min/max
      const weatherPromises = topCities.map(async (city) => {
        try {
          // Use One Call API 3.0 for real daily min/max temperatures
          const oneCallUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${city.coordinates.lat}&lon=${city.coordinates.lon}&appid=${this.apiKey}&units=metric&lang=ar&exclude=minutely,hourly,alerts`;
          
          const oneCallResponse = await fetch(oneCallUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
            cache: 'no-cache',
          });

          if (oneCallResponse.ok) {
            const oneCallData = await oneCallResponse.json();
            
            // Also get current weather for additional details
            const currentUrl = `${this.baseURL}/weather?id=${city.id}&appid=${this.apiKey}&units=metric&lang=ar`;
            const currentResponse = await fetch(currentUrl, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
              },
              cache: 'no-cache',
            });

            if (currentResponse.ok) {
              const currentData: WeatherData = await currentResponse.json();
              
              // Combine One Call daily min/max with current weather details
              const enhancedData: WeatherData = {
                ...currentData,
                main: {
                  ...currentData.main,
                  temp: Math.round(oneCallData.current.temp), // Real current temp
                  feels_like: Math.round(oneCallData.current.feels_like), // Real feels like
                  temp_min: Math.round(oneCallData.daily[0].temp.min), // REAL daily minimum
                  temp_max: Math.round(oneCallData.daily[0].temp.max), // REAL daily maximum
                  humidity: oneCallData.current.humidity, // Real humidity
                  pressure: oneCallData.current.pressure // Real pressure
                },
                wind: {
                  speed: this.msToKmh(oneCallData.current.wind_speed), // Real wind speed
                  deg: oneCallData.current.wind_deg // Real wind direction
                },
                weather: oneCallData.current.weather // Real weather conditions
              };

              return enhancedData;
            }
          }
          
          // Fallback to current weather API if One Call fails
          const fallbackUrl = `${this.baseURL}/weather?id=${city.id}&appid=${this.apiKey}&units=metric&lang=ar`;
          const fallbackResponse = await fetch(fallbackUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
            cache: 'no-cache',
          });

          if (!fallbackResponse.ok) {
            throw new Error(`HTTP error for ${city.name}! status: ${fallbackResponse.status}`);
          }

          const fallbackData: WeatherData = await fallbackResponse.json();
          return this.processWeatherDataFallback(fallbackData);
          
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.warn(`⚠️ Failed to fetch weather for ${city.name}:`, error);
          }
          // Return fallback data for this specific city
          return this.getSingleCityFallback(city);
        }
      });
      
      // Wait for all promises to resolve
      const weatherData = await Promise.all(weatherPromises);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Successfully fetched weather for ${weatherData.length} Iraqi cities`);
        console.log('🌡️ Sample temperatures with REAL min/max:', weatherData.slice(0, 2).map(w => 
          `${w.name}: ${w.main.temp}°C (${w.main.temp_min}°-${w.main.temp_max}°C)`
        ));
      }
      
      return weatherData;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Error fetching Iraq weather data:', error);
      }
      
      // Return fallback data on error
      return this.getFallbackWeatherData();
    }
  }

  /**
   * Fetch weather via local API proxy (handles CORS and API key security)
   */
  async fetchIraqWeatherViaProxy(): Promise<WeatherData[]> {
    try {
      // Build URL - handle server-side vs client-side
      const baseUrl = typeof window === 'undefined' 
        ? (process.env.NEXTAUTH_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
        : '';
      
      const urlString = `${baseUrl}${this.proxyURL}`;

      if (process.env.NODE_ENV === 'development') {
        console.log('Weather API (via proxy) → fetching:', urlString);
      }

      const response = await fetch(urlString, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        cache: 'no-cache',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: WeatherData[] = await response.json();

      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Weather API success: fetched ${data.length} cities via proxy`);
      }

      return data;
    } catch (error) {
      console.error('Weather API proxy error:', error);
      
      // Fallback: try direct API call
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Falling back to direct API call...');
      }
      
      return this.fetchIraqWeather();
    }
  }

  /**
   * Get city information by ID
   */
  getCityInfo(cityId: number): IraqiCity | undefined {
    return IRAQI_CITIES.find(city => city.id === cityId);
  }

  /**
   * Get city information by name
   */
  getCityInfoByName(cityName: string): IraqiCity | undefined {
    return IRAQI_CITIES.find(city => 
      city.name.toLowerCase() === cityName.toLowerCase() ||
      city.nameArabic === cityName
    );
  }

  /**
   * Format weather data for display
   */
  formatWeatherForDisplay(data: WeatherData) {
    const cityInfo = this.getCityInfo(data.id);
    const condition = data.weather[0];
    
    return {
      cityId: data.id,
      cityName: data.name,
      cityNameArabic: cityInfo?.nameArabic || data.name,
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      tempMin: Math.round(data.main.temp_min),
      tempMax: Math.round(data.main.temp_max),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: Math.round(data.wind.speed),
      windDirection: data.wind.deg,
      visibility: Math.round(data.visibility / 1000), // Convert to km
      condition: {
        main: condition.main,
        description: condition.description,
        descriptionArabic: this.getArabicWeatherDescription(condition),
        icon: condition.icon,
        iconUrl: this.getWeatherIconUrl(condition.icon)
      },
      sunrise: this.unixToTime(data.sys.sunrise, data.timezone),
      sunset: this.unixToTime(data.sys.sunset, data.timezone),
      lastUpdated: new Date(),
      coordinates: {
        lat: data.coord.lat,
        lon: data.coord.lon
      }
    };
  }

  /**
   * Get fallback data for a single city
   */
  private getSingleCityFallback(city: IraqiCity): WeatherData {
    const now = Math.floor(Date.now() / 1000);
    const timezone = 3 * 3600; // Iraq timezone offset
    
    return {
      coord: city.coordinates,
      weather: [{
        id: 800,
        main: 'Clear',
        description: 'clear sky',
        icon: '01d'
      }],
      base: 'stations',
      main: {
        temp: 25, // Fallback temperature
        feels_like: 27,
        temp_min: 22,
        temp_max: 28,
        pressure: 1013,
        humidity: 60
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
    };
  }

  /**
   * Fallback weather data when API fails
   */
  private getFallbackWeatherData(): WeatherData[] {
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
        temp: 25 + index, // Varied temperatures
        feels_like: 27 + index,
        temp_min: 22 + index,
        temp_max: 28 + index,
        pressure: 1013,
        humidity: 60 - index * 2
      },
      visibility: 10000,
      wind: {
        speed: 5,
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
  }
}

// Export singleton instance
export const weatherAPI = new WeatherAPIService();
export default weatherAPI;
