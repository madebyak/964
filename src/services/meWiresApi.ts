import { WireHeadline } from '@/services/wiresApi';

export interface MeWiresAPIOptions {
  country?: string; // e.g., 'global', 'iraq', 'syria', 'turkey'
  limit?: number;
}

class MeWiresAPIService {
  private baseURL = '/api/me-wires';

  async fetchHeadlines(options: MeWiresAPIOptions = {}): Promise<WireHeadline[]> {
    const { country = 'global', limit = 20 } = options;

    try {
      const searchParams = new URLSearchParams();
      if (country) searchParams.set('country', country);
      if (limit) searchParams.set('limit', String(limit));

      let urlString = this.baseURL;
      const q = searchParams.toString();
      if (q) urlString += `?${q}`;

      if (process.env.NODE_ENV === 'development') {
        console.log('ME Wires API (via proxy) → fetching:', urlString);
      }

      const response = await fetch(urlString, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        cache: 'no-cache',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: unknown = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Invalid API response: expected array');
      }

      const headlines = data as WireHeadline[];

      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ ME Wires API success: fetched ${headlines.length} headlines (country=${country})`);
      }

      return limit ? headlines.slice(0, limit) : headlines;
    } catch (error) {
      console.error('ME Wires API error:', error);
      return [];
    }
  }
}

export const meWiresAPI = new MeWiresAPIService();
export default meWiresAPI;


