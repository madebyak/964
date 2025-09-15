import { NextResponse } from 'next/server';

// Try different proxy services to bypass Cloudflare
const PROXY_SERVICES = [
  'https://api.allorigins.win/raw?url=',
  'https://cors-anywhere.herokuapp.com/',
  'https://proxy.cors.sh/',
];

const EXTERNAL_API_URL = 'https://apirouter.964media.com/v1/ar/posts/feed';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Always add content_text=true and ff parameters for full content
  const params = new URLSearchParams();
  params.set('content_text', 'true');
  // Some backends treat bare flag differently; pass explicit truthy value
  params.set('ff', '1');
  
  // Forward any additional query parameters from the request
  searchParams.forEach((value, key) => {
    if (key !== 'content_text' && key !== 'ff') {
      params.set(key, value);
    }
  });

  try {
    // Try multiple approaches to bypass Cloudflare
    const apiUrl = `${EXTERNAL_API_URL}?${params.toString()}`;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('News Content Proxy → trying multiple methods for:', apiUrl);
    }

    // Method 1: Direct fetch with enhanced headers + x-request-secret
    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'x-request-secret': process.env.WIRES_REQUEST_SECRET || '',
        },
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        
        if (process.env.NODE_ENV === 'development') {
          console.log('News Content Proxy → direct fetch succeeded');
        }
        
        return NextResponse.json(data);
      }
    } catch (directError) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Direct fetch failed, trying proxy services...');
      }
    }

    // Method 2: Try proxy services (legacy fallback)
    for (const proxyService of PROXY_SERVICES) {
      try {
        const proxyUrl = `${proxyService}${encodeURIComponent(apiUrl)}`;
        
        const response = await fetch(proxyUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          cache: 'no-store',
        });

        if (response.ok) {
          const data = await response.json();
          
          if (process.env.NODE_ENV === 'development') {
            console.log(`News Content Proxy → ${proxyService} succeeded`);
          }
          
          return NextResponse.json(data);
        }
      } catch (proxyError) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`Proxy ${proxyService} failed, trying next...`);
        }
        continue;
      }
    }

    // If all methods fail
    console.error('All proxy methods failed for news content');
    return new NextResponse(
      JSON.stringify({ 
        error: 'All proxy methods failed',
        details: 'Both direct fetch and proxy services were blocked'
      }), 
      {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in news content proxy route:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }), 
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}