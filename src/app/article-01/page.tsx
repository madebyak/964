import { newsAPI } from '@/services/newsApi';
import ArticleRotator from '@/components/ArticleRotator';

export const revalidate = 0; // always fetch latest

export default async function Article01Page() {
  // Server-side fetch of multiple posts for rotation (using working endpoint)
  const initialPosts = await newsAPI.fetchPosts({ 
    limit: 15, 
    orderby: 'date', 
    order: 'desc' 
  });

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
