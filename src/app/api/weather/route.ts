import { NextRequest, NextResponse } from 'next/server';
import { IRAQI_CITIES } from '@/services/weatherApi';

// OpenWeatherMap API configuration
const OPENWEATHER_API_KEY = '53d454bbfbe9bc4c9e02f7bfa044641d';
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

interface WeatherData {
  coord: { lon: number; lat: number };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  base: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
    gust?: number;
  };
  clouds: {
    all: number;
  };
  dt: number;
  sys: {
    type?: number;
    id?: number;
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

interface GroupWeatherResponse {
  cnt: number;
  list: WeatherData[];
}

/**
 * Convert temperature from Kelvin to Celsius
 */
function kelvinToCelsius(kelvin: number): number {
  return Math.round(kelvin - 273.15);
}

/**
 * Convert wind speed from m/s to km/h
 */
function msToKmh(ms: number): number {
  return Math.round(ms * 3.6);
}

/**
 * Process weather data for fallback cases (when One Call API fails)
 * Uses current weather API with basic processing
 */
function processWeatherData(data: WeatherData): WeatherData {
  return {
    ...data,
    main: {
      ...data.main,
      temp: Math.round(data.main.temp),
      feels_like: Math.round(data.main.feels_like),
      temp_min: Math.round(data.main.temp_min), // Will be same as current (fallback)
      temp_max: Math.round(data.main.temp_max)  // Will be same as current (fallback)
    },
    wind: {
      ...data.wind,
      speed: msToKmh(data.wind.speed) // Convert m/s to km/h
    }
  };
}

/**
 * GET /api/weather
 * Fetches weather data for major Iraqi cities via OpenWeatherMap API
 * 
 * This proxy endpoint:
 * - Handles CORS issues
 * - Keeps API key secure on server-side
 * - Processes and optimizes data for client consumption
 * - Provides fallback data on API failures
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get('city'); // Optional: specific city
    const limit = parseInt(searchParams.get('limit') || '8'); // Default to 8 cities

    if (process.env.NODE_ENV === 'development') {
      console.log('🌤️ Weather API Route: Fetching weather data...');
      console.log('Request params:', { city, limit });
    }

    let weatherData: WeatherData[] = [];

    if (city) {
      // Fetch weather for specific city
      const cityWeatherUrl = `${OPENWEATHER_BASE_URL}/weather?q=${city},IQ&appid=${OPENWEATHER_API_KEY}&units=metric&lang=ar`;
      
      const response = await fetch(cityWeatherUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': '964-Media-Weather/1.0',
        },
        // Add timeout
        signal: AbortSignal.timeout(10000), // 10 seconds timeout
      });

      if (!response.ok) {
        throw new Error(`OpenWeatherMap API error: ${response.status} ${response.statusText}`);
      }

      const data: WeatherData = await response.json();
      weatherData = [processWeatherData(data)];

    } else {
      // Fetch weather for multiple Iraqi cities using One Call API 3.0
      // This provides REAL daily min/max temperatures
      const topCities = IRAQI_CITIES.slice(0, Math.min(limit, 8)); // Max 8 cities
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🌤️ Fetching weather using One Call API for cities:', topCities.map(c => c.name));
      }

      // Fetch each city using One Call API 3.0 for real daily min/max
      const weatherPromises = topCities.map(async (city) => {
        try {
          // Use One Call API 3.0 for real daily min/max temperatures
          const oneCallUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${city.coordinates.lat}&lon=${city.coordinates.lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=ar&exclude=minutely,hourly,alerts`;
          
          const oneCallResponse = await fetch(oneCallUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'User-Agent': '964-Media-Weather/1.0',
            },
            signal: AbortSignal.timeout(10000), // 10 seconds timeout
          });

          if (oneCallResponse.ok) {
            const oneCallData = await oneCallResponse.json();
            
            // Also get current weather for additional details
            const currentUrl = `${OPENWEATHER_BASE_URL}/weather?id=${city.id}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=ar`;
            const currentResponse = await fetch(currentUrl, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'User-Agent': '964-Media-Weather/1.0',
              },
              signal: AbortSignal.timeout(8000), // 8 seconds timeout
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
                  speed: msToKmh(oneCallData.current.wind_speed), // Real wind speed
                  deg: oneCallData.current.wind_deg // Real wind direction
                },
                weather: oneCallData.current.weather // Real weather conditions
              };

              return enhancedData;
            }
          }
          
          // Fallback to current weather API if One Call fails
          const fallbackUrl = `${OPENWEATHER_BASE_URL}/weather?id=${city.id}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=ar`;
          const fallbackResponse = await fetch(fallbackUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'User-Agent': '964-Media-Weather/1.0',
            },
            signal: AbortSignal.timeout(8000), // 8 seconds timeout
          });

          if (!fallbackResponse.ok) {
            throw new Error(`OpenWeatherMap API error for ${city.name}: ${fallbackResponse.status} ${fallbackResponse.statusText}`);
          }

          const fallbackData: WeatherData = await fallbackResponse.json();
          return processWeatherData(fallbackData);
          
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.warn(`⚠️ Failed to fetch weather for ${city.name}:`, error);
          }
          // Return fallback data for this specific city
          return getSingleCityFallback(city);
        }
      });

      // Wait for all API calls to complete
      weatherData = await Promise.all(weatherPromises);
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Weather API Route: Successfully fetched ${weatherData.length} weather records`);
      console.log('Sample data:', weatherData.slice(0, 2).map(w => ({
        city: w.name,
        temp: w.main.temp,
        condition: w.weather[0].description
      })));
    }

    // Return processed weather data
    return NextResponse.json(weatherData, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600', // Cache for 5 minutes
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('❌ Weather API Route Error:', error);

    // Return fallback data on error
    const fallbackData = getFallbackWeatherData();
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Returning fallback weather data due to API error');
    }

    return NextResponse.json(fallbackData, {
      status: 200, // Still return 200 with fallback data
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120', // Shorter cache for fallback
        'Content-Type': 'application/json',
        'X-Weather-Source': 'fallback', // Indicate this is fallback data
      },
    });
  }
}

/**
 * Generate fallback data for a single city
 */
function getSingleCityFallback(city: typeof IRAQI_CITIES[0]): WeatherData {
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
      temp: 30, // Fallback temperature (already in Celsius)
      feels_like: 32,
      temp_min: 27,
      temp_max: 33,
      pressure: 1013,
      humidity: 60
    },
    visibility: 10000,
    wind: {
      speed: 15, // km/h (already converted)
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
 * Generate fallback weather data when API fails
 */
function getFallbackWeatherData(): WeatherData[] {
  const now = Math.floor(Date.now() / 1000);
  const timezone = 3 * 3600; // Iraq timezone offset (+3 hours)
  
  // Use realistic Iraqi weather patterns
  const fallbackTemps = [32, 28, 30, 26, 31, 29, 27, 25]; // Varied realistic temps
  const fallbackConditions = [
    { id: 800, main: 'Clear', description: 'clear sky', icon: '01d' },
    { id: 801, main: 'Clouds', description: 'few clouds', icon: '02d' },
    { id: 802, main: 'Clouds', description: 'scattered clouds', icon: '03d' },
    { id: 800, main: 'Clear', description: 'clear sky', icon: '01d' },
  ];
  
  return IRAQI_CITIES.slice(0, 8).map((city, index) => ({
    coord: city.coordinates,
    weather: [fallbackConditions[index % fallbackConditions.length]],
    base: 'stations',
    main: {
      temp: fallbackTemps[index],
      feels_like: fallbackTemps[index] + 2,
      temp_min: fallbackTemps[index] - 3,
      temp_max: fallbackTemps[index] + 3,
      pressure: 1013 + (index - 4) * 2, // Slight pressure variations
      humidity: Math.max(30, 70 - index * 5) // Realistic humidity range
    },
    visibility: 10000,
    wind: {
      speed: 10 + index, // km/h (already converted)
      deg: 180 + index * 30 // Varied wind directions
    },
    clouds: {
      all: index * 10 // Varied cloud cover
    },
    dt: now,
    sys: {
      country: 'IQ',
      sunrise: now - 6 * 3600, // 6 hours ago
      sunset: now + 6 * 3600   // 6 hours from now
    },
    timezone,
    id: city.id,
    name: city.name,
    cod: 200
  }));
}

/**
 * POST method not allowed for this endpoint
 */
export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

/**
 * OPTIONS method for CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
