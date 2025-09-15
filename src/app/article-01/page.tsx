import { newsAPI } from '@/services/newsApi';
import { headers } from 'next/headers';
import ArticleRotator from '@/components/ArticleRotator';

export const revalidate = 0; // always fetch latest

export default async function Article01Page() {
  // Determine server base URL from request headers first (robust on Vercel)
  const h = headers();
  const forwardedProto = h.get('x-forwarded-proto') || 'https';
  const forwardedHost = h.get('x-forwarded-host') || h.get('host') || process.env.VERCEL_URL;
  const headerOrigin = forwardedHost ? `${forwardedProto}://${forwardedHost}` : undefined;

  // Fallback to env-derived origin if headers missing
  const serverBaseUrl = headerOrigin
    || process.env.NEXTAUTH_URL
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

  // Server-side fetch WITH CONTENT to avoid initial blank article body
  const initialPosts = await newsAPI.fetchPostsWithContent({
    limit: 15,
    orderby: 'date',
    order: 'desc',
  }, { serverBaseUrl });

  if (process.env.NODE_ENV === 'development') {
    console.log('Article01 Server → fetched posts for rotation', {
      totalPosts: initialPosts.length,
      firstPostId: initialPosts[0]?.id,
      firstPostTitle: initialPosts[0]?.title?.slice(0, 50) + '...',
    });
  }

  return (
    <ArticleRotator 
      initialPosts={initialPosts}
      rotationInterval={30000} // 30 seconds
      transitionDuration={1600} // 1.6 seconds
    />
  );
}
