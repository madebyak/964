// Iraq Wires API service for fetching rolling headlines with source information

export interface WireSource {
  name: string;
  slug: string;
  icon: string;
  permalink: string;
  type: string;
}

export interface WireHeadline {
  id: string;
  title: string;
  date: string;
  source: WireSource;
  permalink: string;
  related?: unknown[];
}

export interface WiresAPIOptions {
  limit?: number;
}

class WiresAPIService {
  // Use local Next.js API proxy to bypass CORS (following news-ticker pattern)
  private baseURL = '/api/iraq-wires';

  async fetchHeadlines(options: WiresAPIOptions = {}): Promise<WireHeadline[]> {
    const { limit = 20 } = options;

    try {
      // Build URL string manually for relative paths
      let urlString = this.baseURL;
      if (limit && limit !== 20) {
        urlString += `?limit=${limit}`;
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('Iraq Wires API (via proxy) → fetching:', urlString);
      }

      const response = await fetch(urlString, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        cache: 'no-cache',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: unknown = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid API response: expected array');
      }

      const headlines = this.normalizeHeadlines(data as unknown[]);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Iraq Wires API success: fetched ${headlines.length} headlines`);
        if (headlines.length > 0) {
          console.log('📰 Sample headline:', headlines[0].title);
          console.log('🏛️ Sample source:', headlines[0].source.name);
        }
      }
      
      return limit ? headlines.slice(0, limit) : headlines;

    } catch (error) {
      console.error('Iraq Wires API error:', error);
      console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
      
      // In development, show the actual error to help debug
      if (process.env.NODE_ENV === 'development') {
        console.error('Full error object:', error);
      }
      
      return this.getFallback(limit);
    }
  }

  /**
   * Decode HTML entities to proper characters
   * Handles common HTML entities from WordPress APIs including Arabic text
   */
  private decodeHTMLEntities(text: string): string {
    if (!text || typeof text !== 'string') return text;
    
    return text
      // Hexadecimal numeric character references (common with Arabic text)
      .replace(/&#x([0-9A-Fa-f]+);/g, (match, hex) => {
        const codePoint = parseInt(hex, 16);
        return String.fromCharCode(codePoint);
      })
      // Decimal numeric character references
      .replace(/&#([0-9]+);/g, (match, num) => {
        const codePoint = parseInt(num, 10);
        return String.fromCharCode(codePoint);
      })
      // Named HTML entities
      .replace(/&quot;/g, '"')
      .replace(/&amp;quot;/g, '"')  // Double-encoded quotes
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&apos;/g, "'")
      .replace(/&#039;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/&ndash;/g, '\u2013')  // En dash
      .replace(/&mdash;/g, '\u2014')  // Em dash
      .replace(/&hellip;/g, '\u2026') // Horizontal ellipsis
      .replace(/&rsquo;/g, '\u2019')  // Right single quotation mark
      .replace(/&lsquo;/g, '\u2018')  // Left single quotation mark
      .replace(/&rdquo;/g, '\u201D')  // Right double quotation mark
      .replace(/&ldquo;/g, '\u201C'); // Left double quotation mark
  }

  /**
   * Normalize the Iraq Wires API response to our interface
   * Includes HTML entity decoding for clean text display
   */
  private normalizeHeadlines(data: unknown[]): WireHeadline[] {
    return data
      .filter(item => item && typeof item === 'object' && (item as Record<string, unknown>).title && (item as Record<string, unknown>).source)
      .map(item => {
        const record = item as Record<string, unknown>;
        return {
          id: String(record.id || ''),
          title: this.decodeHTMLEntities(String(record.title || '')),
          date: String(record.date || ''),
          source: {
            name: this.decodeHTMLEntities(String((record.source as Record<string, unknown>)?.name || '')),
            slug: String((record.source as Record<string, unknown>)?.slug || ''),
            icon: String((record.source as Record<string, unknown>)?.icon || ''),
            permalink: String((record.source as Record<string, unknown>)?.permalink || ''),
            type: String((record.source as Record<string, unknown>)?.type || ''),
          },
          permalink: String(record.permalink || ''),
          related: (record.related as unknown[]) || [],
        };
      })
      .filter(headline => headline.title && headline.source.name);
  }

  private getFallback(limit: number): WireHeadline[] {
    const sampleData = [
      {
        title: 'خبر عاجل: الحكومة تقر حزمة إجراءات اقتصادية جديدة',
        source: { name: 'وكالة الأنباء العراقية', icon: '' }
      },
      {
        title: 'تحذير جوي: عاصفة رعدية متوقعة خلال الساعات القادمة',
        source: { name: 'الأرصاد الجوية', icon: '' }
      },
      {
        title: 'وزارة الصحة: ارتفاع نسب التطعيم في المحافظات',
        source: { name: 'وزارة الصحة', icon: '' }
      },
      {
        title: 'المرور: خطة لتحسين انسيابية حركة السير في العاصمة',
        source: { name: 'مديرية المرور العامة', icon: '' }
      },
      {
        title: 'المنتخب الوطني يستعد لمباراة ودية الأسبوع المقبل',
        source: { name: 'الاتحاد العراقي لكرة القدم', icon: '' }
      },
    ];

    return sampleData.slice(0, limit).map((item, idx) => ({
      id: `fallback-${idx + 1}`,
      title: item.title,
      date: new Date().toISOString(),
      source: {
        name: item.source.name,
        slug: `fallback-${idx + 1}`,
        icon: item.source.icon,
        permalink: '#',
        type: 'fallback',
      },
      permalink: '#',
      related: [],
    }));
  }
}

// Export singleton instance (following newsAPI pattern)
export const wiresAPI = new WiresAPIService();
export default wiresAPI;


