import { NextResponse } from 'next/server';

const EXTERNAL_API_URL = 'https://apirouter.964media.com/v1/ar/posts/feed';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Always add content_text=true and ff parameters for full content
  const params = new URLSearchParams();
  params.set('content_text', 'true');
  params.set('ff', '');
  
  // Forward any additional query parameters from the request
  searchParams.forEach((value, key) => {
    if (key !== 'content_text' && key !== 'ff') {
      params.set(key, value);
    }
  });

  try {
    const apiUrl = `${EXTERNAL_API_URL}?${params.toString()}`;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('News Content Proxy → fetching:', apiUrl);
    }

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; NewsContentProxy/1.0)',
        // Add any other headers that might help bypass restrictions
      },
      // Ensure fresh data from the external API
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`News content proxy fetch failed: HTTP ${response.status} - ${response.statusText}`);
      console.error('Response body:', errorText);
      
      return new NextResponse(
        JSON.stringify({ 
          error: `Failed to fetch news content: ${response.statusText}`,
          details: errorText.slice(0, 500) // First 500 chars for debugging
        }), 
        {
          status: response.status,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const data = await response.json();
    
    if (process.env.NODE_ENV === 'development') {
      console.log('News Content Proxy → success');
      if (Array.isArray(data?.data?.posts) && data.data.posts.length > 0) {
        const firstPost = data.data.posts[0];
        console.log('Sample post content:', {
          id: firstPost.id,
          title: firstPost.title?.slice(0, 50) + '...',
          hasContentRendered: Boolean(firstPost.content_rendered),
          contentRenderedLength: firstPost.content_rendered?.length || 0,
          hasContentText: Boolean(firstPost.content_text),
          contentTextLength: firstPost.content_text?.length || 0,
        });
      }
    }

    return NextResponse.json(data);
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
