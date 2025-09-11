import { NextRequest, NextResponse } from 'next/server';

/**
 * Me Wires API proxy
 * - Proxies requests to wires.964media.com/posts with required secret header
 * - Normalizes upstream response (object) to an array of WireHeadline
 * - Applies basic error handling and CORS
 */

interface UpstreamSource {
  id?: number | string;
  name?: string;
  slug?: string;
  icon?: string;
  permalink?: string;
}

interface UpstreamPost {
  id?: number | string;
  title?: string;
  date?: string;
  permalink?: string;
  thumbnail?: string | false;
  source?: UpstreamSource;
}

interface UpstreamResponse {
  found_posts?: number;
  posts?: UpstreamPost[];
  pinned_posts?: UpstreamPost[];
}

interface WireSource {
  name: string;
  slug: string;
  icon: string;
  permalink: string;
  type: string;
}

interface WireHeadline {
  id: string;
  title: string;
  date: string;
  source: WireSource;
  permalink: string;
  related?: unknown[];
}

function decodeHTMLEntities(text: string): string {
  if (!text || typeof text !== 'string') return text;
  return text
    .replace(/&#x([0-9A-Fa-f]+);/g, (_m, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#([0-9]+);/g, (_m, num) => String.fromCharCode(parseInt(num, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&amp;quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&apos;/g, "'")
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&ndash;/g, '\u2013')
    .replace(/&mdash;/g, '\u2014')
    .replace(/&hellip;/g, '\u2026')
    .replace(/&rsquo;/g, '\u2019')
    .replace(/&lsquo;/g, '\u2018')
    .replace(/&rdquo;/g, '\u201D')
    .replace(/&ldquo;/g, '\u201C');
}

function normalizePosts(data: UpstreamResponse): WireHeadline[] {
  const combined: UpstreamPost[] = [
    ...(Array.isArray(data.posts) ? data.posts : []),
    // Include pinned posts only if regular posts are empty
    ...((!data.posts || data.posts.length === 0) && Array.isArray(data.pinned_posts) ? data.pinned_posts : []),
  ];

  return combined
    .filter((p) => p && typeof p === 'object')
    .map((p) => {
      const source = (p.source || {}) as UpstreamSource;
      return {
        id: String(p.id ?? ''),
        title: decodeHTMLEntities(String(p.title ?? '')),
        date: String(p.date ?? ''),
        source: {
          name: decodeHTMLEntities(String(source.name ?? '')),
          slug: String(source.slug ?? ''),
          icon: String(source.icon ?? ''),
          permalink: String(source.permalink ?? ''),
          type: 'rss',
        },
        permalink: String(p.permalink ?? ''),
        related: [],
      } as WireHeadline;
    })
    .filter((h) => h.title && h.source && h.source.name);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country') || 'global';
  const limit = searchParams.get('limit') || '20';
  const page = searchParams.get('page');
  const search = searchParams.get('search');
  const source = searchParams.get('source');

  const upstreamBase = process.env.WIRES_BASE_URL || 'https://wires.964media.com';
  const secret = process.env.WIRES_REQUEST_SECRET; // set this in your env

  if (!secret) {
    console.error('me-wires proxy: Missing WIRES_REQUEST_SECRET env');
  }

  const url = new URL('/posts', upstreamBase);
  url.searchParams.set('country', country);
  if (limit) url.searchParams.set('limit', String(limit));
  if (page) url.searchParams.set('page', String(page));
  if (search) url.searchParams.set('search', String(search));
  if (source) url.searchParams.set('source', String(source));

  try {
    const upstream = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        // Prefer env; allow temporary override from request header for testing
        'x-request-secret': secret || request.headers.get('x-request-secret') || '',
      },
      cache: 'no-store',
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      throw new Error(`Upstream HTTP ${upstream.status}: ${upstream.statusText} - ${text.slice(0, 200)}`);
    }

    const data: UpstreamResponse = await upstream.json();
    const headlines = normalizePosts(data);

    return NextResponse.json(headlines, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (err) {
    console.error('me-wires proxy error:', err);

    // Return empty list to keep client stable
    return NextResponse.json([], {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }
}

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


