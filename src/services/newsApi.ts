// News API Service for 964 Media
export interface Post {
  id: number;
  title: string;
  subtitle?: string;
  date: string;
  permalink: string;
  variant: 'compact' | 'expanded';
  saved: boolean;
  liked: boolean;
  colors?: {
    primary: string;
    secondary: string;
  };
  featured_image?: {
    id: number;
    mime_type: string;
    sizes: {
      thumbnail: string;
      small: string;
      medium: string;
      medium_large: string;
      large: string;
      full: string;
    };
  };
  featured_video?: {
    id: number;
    mime_type: string;
    hosting: 'self' | 'cloudflare';
    m3u8?: string;
    mpd?: string;
    iframe?: string;
    mp4: string;
    width: number;
    height: number;
  } | null;
  content_rendered?: string;
  content_text?: string;
  pinned: boolean;
  runtime_type: string;
  image_full?: string;
  video_full?: string;
}

export interface APIResponse {
  code: string;
  status: number;
  message: string;
  data: {
    posts: Post[];
  };
}

export interface NewsAPIParams {
  limit?: number;
  offset?: number;
  order?: 'asc' | 'desc' | 'ASC' | 'DESC';
  orderby?: 'ID' | 'title' | 'date' | 'rand';
  after?: string;
  before?: string;
  category?: number[] | number;
  tag?: string;
  search?: string;
  type?: 'video' | 'any';
}

class NewsAPIService {
  private baseURL = 'https://apirouter.964media.com/v1/ar/posts';
  private contentProxyURL = '/api/news-content'; // Local proxy for full content

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
   * Fetch posts from 964 Media API
   */
  async fetchPosts(params: NewsAPIParams = {}): Promise<Post[]> {
    try {
      const url = new URL(this.baseURL);
      
      // Add query parameters
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            url.searchParams.append(key, value.join(','));
          } else {
            url.searchParams.append(key, String(value));
          }
        }
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('Fetching news from:', url.toString());
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        // Add cache control for fresh news
        cache: 'no-cache',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: APIResponse = await response.json();

      // Validate response structure
      if (!data.data?.posts || !Array.isArray(data.data.posts)) {
        throw new Error('Invalid API response structure');
      }

      return data.data.posts;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching news posts:', error);
      }
      
      // Return fallback data on error to ensure ticker still works
      return this.getFallbackPosts();
    }
  }

  /**
   * Fetch posts with full content (including article body) via proxy
   * Uses local API proxy to bypass Cloudflare restrictions
   */
  async fetchPostsWithContent(
    params: NewsAPIParams = {},
    options?: { serverBaseUrl?: string }
  ): Promise<Post[]> {
    try {
      // Build URL - handle server-side vs client-side
      // Determine base URL for server-side fetches (Vercel/Node)
      // Priority: NEXTAUTH_URL → VERCEL_URL → localhost
      // Note: VERCEL_URL is the hostname only; must prefix with https://
      const baseUrl = typeof window === 'undefined'
        ? (options?.serverBaseUrl
            || process.env.NEXTAUTH_URL
            || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
          )
        : '';
      
      const searchParams = new URLSearchParams();
      
      // Add query parameters
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            searchParams.append(key, value.join(','));
          } else {
            searchParams.append(key, String(value));
          }
        }
      });

      let urlString = `${baseUrl}${this.contentProxyURL}`;
      if (searchParams.toString()) {
        urlString += `?${searchParams.toString()}`;
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('News Content API (via proxy) → fetching:', urlString);
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

      const data: APIResponse = await response.json();

      // Validate response structure
      if (!data.data?.posts || !Array.isArray(data.data.posts)) {
        throw new Error('Invalid API response structure');
      }

      // Decode HTML entities in content fields
      const postsWithDecodedContent = data.data.posts.map(post => ({
        ...post,
        title: this.decodeHTMLEntities(post.title || ''),
        subtitle: post.subtitle ? this.decodeHTMLEntities(post.subtitle) : post.subtitle,
        content_rendered: post.content_rendered ? this.decodeHTMLEntities(post.content_rendered) : post.content_rendered,
        content_text: post.content_text ? this.decodeHTMLEntities(post.content_text) : post.content_text,
      }));

      // Filter out ads and non-displayable posts
      const filteredPosts = postsWithDecodedContent.filter((p) => {
        const titleOrContent = Boolean(
          (p.title && p.title.trim().length > 0)
          || (p.content_rendered && p.content_rendered.trim().length > 0)
          || (p.content_text && p.content_text.trim().length > 0)
        );
        const hasImage = Boolean(
          p.featured_image?.sizes?.large
          || p.featured_image?.sizes?.full
          || p.featured_image?.sizes?.medium_large
          || p.featured_image?.sizes?.medium
          || p.image_full
        );
        const hasVideo = Boolean(p.featured_video?.mp4);
        const isAd = (
          (typeof p.runtime_type === 'string' && p.runtime_type.toLowerCase().includes('ad'))
          || (typeof p.variant === 'string' && p.variant.toLowerCase().includes('ad'))
        );
        return !isAd && (titleOrContent || hasImage || hasVideo);
      });

      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ News Content API success: fetched ${postsWithDecodedContent.length} posts with content`);
        if (postsWithDecodedContent.length > 0) {
          const firstPost = postsWithDecodedContent[0];
          console.log('📰 Sample post with content:', {
            id: firstPost.id,
            title: firstPost.title?.slice(0, 50) + '...',
            hasContentRendered: Boolean(firstPost.content_rendered),
            contentRenderedLength: firstPost.content_rendered?.length || 0,
            hasContentText: Boolean(firstPost.content_text),
            contentTextLength: firstPost.content_text?.length || 0,
          });
        }
      }

      return filteredPosts;
    } catch (error) {
      console.error('News Content API error:', error);
      console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
      
      // Fallback: try to get basic posts without content
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Falling back to basic posts API...');
      }
      
      return this.fetchPosts(params);
    }
  }

  /**
   * Get posts specifically optimized for news ticker
   * Returns latest breaking news titles
   */
  async getTickerPosts(): Promise<string[]> {
    const posts = await this.fetchPosts({
      limit: 10,           // Get latest 10 posts
      orderby: 'date',     // Order by publication date
      order: 'desc',       // Most recent first
      type: 'any',         // Include all content types
    });

    // Extract only titles for ticker display
    return posts
      .map(post => post.title)
      .filter(title => title && title.trim().length > 0) // Filter out empty titles
      .slice(0, 8); // Limit to 8 items for optimal ticker performance
  }

  /**
   * Fallback posts in case API fails
   * These match your current mock data format
   */
  private getFallbackPosts(): Post[] {
    return [
      {
        id: 1,
        title: 'الانتخابات القادمة تشبه 2005 ـ الحكيم من اليوسفية: استحقاق مصيري يؤسس للاستقرار المستدام',
        date: new Date().toISOString(),
        permalink: '#',
        variant: 'compact',
        saved: false,
        liked: false,
        pinned: false,
        runtime_type: 'default'
      },
      {
        id: 2,
        title: 'مشهد مؤلم.. مصرع عامل بإحدى شركات الكهرباء إثر تعرضه لصدمة كهربائية في الناصرية',
        date: new Date().toISOString(),
        permalink: '#',
        variant: 'compact',
        saved: false,
        liked: false,
        pinned: false,
        runtime_type: 'default'
      },
      {
        id: 3,
        title: 'السليمانية تلتهب.. حملة اعتقالات تطال قيادات بارزة في الاتحاد الوطني الكردستاني',
        date: new Date().toISOString(),
        permalink: '#',
        variant: 'compact',
        saved: false,
        liked: false,
        pinned: false,
        runtime_type: 'default'
      },
      {
        id: 4,
        title: 'محكمة استئناف في نيويورك تلغي غرامة على ترامب بنحو نصف مليار دولار',
        date: new Date().toISOString(),
        permalink: '#',
        variant: 'compact',
        saved: false,
        liked: false,
        pinned: false,
        runtime_type: 'default'
      },
      {
        id: 5,
        title: 'خلال لقائه عدداً من ذوي الضحايا.. السيد الحكيم يدعو إلى تلافي تكرار حادثة الكوت',
        date: new Date().toISOString(),
        permalink: '#',
        variant: 'compact',
        saved: false,
        liked: false,
        pinned: false,
        runtime_type: 'default'
      }
    ];
  }

  /**
   * Get posts with automatic refresh capability
   * Useful for real-time ticker updates
   */
  async getPostsWithRefresh(intervalMs: number = 300000): Promise<{
    posts: string[];
    refresh: () => void;
    cleanup: () => void;
  }> {
    let posts = await this.getTickerPosts();

    const refresh = async () => {
      try {
        const newPosts = await this.getTickerPosts();
        posts = newPosts;
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error refreshing posts:', error);
        }
      }
    };

    // Set up auto-refresh interval (default: 5 minutes)
    const intervalId = setInterval(refresh, intervalMs);

    const cleanup = () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };

    return {
      posts,
      refresh,
      cleanup
    };
  }
}

// Export singleton instance
export const newsAPI = new NewsAPIService();
export default newsAPI;
