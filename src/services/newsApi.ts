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

      console.log('Fetching news from:', url.toString());

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
      console.error('Error fetching news posts:', error);
      
      // Return fallback data on error to ensure ticker still works
      return this.getFallbackPosts();
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
        console.error('Error refreshing posts:', error);
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
