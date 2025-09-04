"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { tsTarek } from '@/app/fonts';
import { newsAPI, type Post } from '@/services/newsApi';
import AutoScrollContent from '@/components/AutoScrollContent';

interface ArticleRotatorProps {
  initialPosts: Post[];
  rotationInterval?: number;
  transitionDuration?: number;
}

export default function ArticleRotator({
  initialPosts,
  rotationInterval = 30000, // 30 seconds
  transitionDuration = 1600, // 1.6 seconds total transition
}: ArticleRotatorProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'display' | 'out' | 'ready-to-slide-in' | 'in' | 'none'>('display');

  const rotationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get current post
  const currentPost = posts[currentIndex] || null;

  // Extract current post data (same logic as original)
  const title = currentPost?.title ?? '—';
  const subtitle = (currentPost?.subtitle && currentPost.subtitle.trim().length > 0) ? currentPost.subtitle : '';
  const dateStr = currentPost?.date ? new Intl.DateTimeFormat('ar-EG', { dateStyle: 'long' }).format(new Date(currentPost.date)) : '';

  const featuredImage = currentPost?.featured_image?.sizes?.large
    || currentPost?.featured_image?.sizes?.full
    || currentPost?.featured_image?.sizes?.medium_large
    || currentPost?.featured_image?.sizes?.medium
    || '';

  const featuredVideo = currentPost?.featured_video?.mp4 ?? '';
  const articleHTML = currentPost?.content_rendered || currentPost?.content_text || '';

  // Preload next post media
  const preloadNextMedia = useCallback((nextIndex: number) => {
    if (!posts[nextIndex]) return;

    const nextPost = posts[nextIndex];
    const nextImage = nextPost.featured_image?.sizes?.large 
      || nextPost.featured_image?.sizes?.full 
      || nextPost.featured_image?.sizes?.medium_large 
      || nextPost.featured_image?.sizes?.medium;

    if (nextImage) {
      const img = new window.Image();
      img.src = nextImage;
    }

    if (nextPost.featured_video?.mp4) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = nextPost.featured_video.mp4;
    }
  }, [posts]);

  // Sophisticated staggered transition to next post
  const transitionToNextPost = useCallback(async () => {
    if (isTransitioning || posts.length <= 1) return;

    setIsTransitioning(true);
    console.log('🎬 Starting staggered slide-out animation sequence...');
    
    // Phase 1: Start slide-out animation sequence
    setAnimationPhase('out');
    
    // Total slide-out duration: 2 seconds with staggered elements
    // Subtitle (0ms) -> Title (500ms) -> Date (1000ms) -> Content/Image (1500ms)
    transitionTimeoutRef.current = setTimeout(() => {
      console.log('🔄 Slide-out complete, switching to next post...');
      
      // Switch to next post AND set to 'ready-to-slide-in' state simultaneously
      const nextIndex = (currentIndex + 1) % posts.length;
      setCurrentIndex(nextIndex);
      setAnimationPhase('ready-to-slide-in'); // NEW content positioned off-screen for slide-in
      
      // Preload media for the post after next
      const followingIndex = (nextIndex + 1) % posts.length;
      preloadNextMedia(followingIndex);
      
      // Start slide-in animation immediately (no delays)
      transitionTimeoutRef.current = setTimeout(() => {
        setAnimationPhase('in');
        console.log('🎬 Starting staggered slide-in animation sequence...');
        
        // Complete transition after slide-in sequence (2 seconds)
        transitionTimeoutRef.current = setTimeout(() => {
          console.log('✅ Transition complete, returning to display phase');
          setAnimationPhase('display');
          setIsTransitioning(false);
        }, 2000); // 2 seconds for slide-in sequence
        
      }, 100); // Brief delay to ensure React has updated DOM with new content
      
    }, 2000); // 2 seconds for slide-out sequence
  }, [currentIndex, posts.length, isTransitioning, preloadNextMedia]);

  // Cleanup function for all timers
  const cleanupTimers = useCallback(() => {
    if (rotationTimeoutRef.current) {
      clearTimeout(rotationTimeoutRef.current);
      rotationTimeoutRef.current = null;
    }
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
  }, []);

  // Background refresh of posts
  const refreshPosts = useCallback(async () => {
    try {
      const freshPosts = await newsAPI.fetchPostsWithContent({
        limit: 15,
        orderby: 'date',
        order: 'desc'
      });

      if (freshPosts.length > 0) {
        setPosts(freshPosts);
        if (process.env.NODE_ENV === 'development') {
          console.log('📰 Article rotator: Refreshed posts in background');
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Article rotator: Failed to refresh posts:', error);
      }
    }
  }, []);

  // Initialize background refresh system only once
  useEffect(() => {
    // Setup background refresh (every 10 minutes) - only once
    if (posts.length > 0 && !refreshIntervalRef.current) {
      console.log('🔄 Setting up background post refresh every 10 minutes');
      refreshIntervalRef.current = setInterval(refreshPosts, 600000);
    }

    // Preload next post media when currentIndex changes
    if (posts.length > 1) {
      preloadNextMedia((currentIndex + 1) % posts.length);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [posts.length, currentIndex, refreshPosts, preloadNextMedia]);

  // Simple rotation timer - start immediately for testing
  useEffect(() => {
    if (posts.length > 1 && !isTransitioning) {
      // Use shorter interval for testing: 5 seconds in dev, 30 seconds in production
      const testInterval = process.env.NODE_ENV === 'development' ? 5000 : rotationInterval;
      
      console.log(`⏰ Starting ${testInterval/1000}-second timer for post ${currentIndex + 1}/${posts.length}`);
      
      const timerId = setTimeout(() => {
        console.log(`🔄 ${testInterval/1000} seconds up! Transitioning from post ${currentIndex + 1} to ${((currentIndex + 1) % posts.length) + 1}`);
        transitionToNextPost();
      }, testInterval);

      rotationTimeoutRef.current = timerId;

      return () => {
        if (timerId) {
          clearTimeout(timerId);
          console.log(`⏹️ Cleared timer for post ${currentIndex + 1}`);
        }
      };
    }
  }, [currentIndex, posts.length, isTransitioning, rotationInterval, transitionToNextPost]); // Reset timer when currentIndex changes

  // Development debugging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('📰 Article rotator status:', {
        currentPost: currentPost?.id,
        currentIndex,
        totalPosts: posts.length,
        isTransitioning,
        animationPhase,
        title: title?.slice(0, 50) + '...'
      });
    }
  }, [currentIndex, isTransitioning, animationPhase, currentPost?.id, posts.length, title]);

  if (!currentPost) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <p className="text-white text-xl">لا توجد مقالات متاحة</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-black py-12 pb-24">
      <div className="h-full w-full flex">
        {/* Left Column - Media */}
        <div className="flex-1 h-full flex items-center justify-center">
          <div className="relative w-full h-full max-w-3xl bg-gray-800 rounded-lg overflow-hidden">
            {featuredVideo ? (
              <video
                key={`video-${currentPost.id}`}
                className={`h-full w-full object-cover transition-transform duration-[1000ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
                  animationPhase === 'out' ? 'animate-image-slide-out' : 
                  animationPhase === 'ready-to-slide-in' ? 'transform translate-x-full' :
                  animationPhase === 'in' ? 'animate-image-slide-in' : 
                  'transform translate-x-0'
                }`}
                src={featuredVideo}
                autoPlay
                muted
                playsInline
                loop
                preload="metadata"
              />
            ) : featuredImage ? (
              <Image
                key={`image-${currentPost.id}`}
                src={featuredImage}
                alt={title}
                fill
                priority
                className={`object-cover transition-transform duration-[1000ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
                  animationPhase === 'out' ? 'animate-image-slide-out' : 
                  animationPhase === 'ready-to-slide-in' ? 'transform translate-x-full' :
                  animationPhase === 'in' ? 'animate-image-slide-in' : 
                  'transform translate-x-0'
                }`}
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-gray-400">لا توجد وسائط</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Content */}
        <div className="flex-1 h-full flex flex-col text-white py-12 pb-24 px-12">
          {/* Header Section */}
          <div className="flex-shrink-0 space-y-2 mb-12" dir="rtl">
            {/* Subtitle - animates first */}
            {subtitle && (
              <div className="overflow-hidden">
                <span className={`inline-block bg-white text-black font-medium px-2 py-1 text-3xl tracking-wider ${tsTarek.className} transition-transform duration-[800ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
                  animationPhase === 'out' ? 'animate-subtitle-slide-out' : 
                  animationPhase === 'ready-to-slide-in' ? 'transform translate-x-full' :
                  animationPhase === 'in' ? 'animate-subtitle-slide-in' : 
                  'transform translate-x-0'
                }`}>
                  {subtitle}
                </span>
              </div>
            )}
            
            {/* Title - animates second (0.5s delay) */}
            <div className="overflow-hidden">
              <div className={`transition-transform duration-[800ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
                animationPhase === 'out' ? 'animate-title-slide-out' : 
                animationPhase === 'ready-to-slide-in' ? 'transform translate-x-full' :
                animationPhase === 'in' ? 'animate-title-slide-in' : 
                'transform translate-x-0'
              }`}>
                <span className={`inline bg-yellow-400 text-black px-2 py-2 text-3xl md:text-5xl font-bold leading-normal box-decoration-clone [-webkit-box-decoration-break:clone] ${tsTarek.className}`}>
                  {title}
                </span>
              </div>
            </div>
            
            {/* Date - animates third (1s delay) */}
            {dateStr && (
              <div className="overflow-hidden">
                <div className={`text-2xl opacity-70 text-right transition-transform duration-[800ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
                  animationPhase === 'out' ? 'animate-date-slide-out' : 
                  animationPhase === 'ready-to-slide-in' ? 'transform translate-x-full' :
                  animationPhase === 'in' ? 'animate-date-slide-in' : 
                  'transform translate-x-0'
                }`}>
                  {dateStr}
                </div>
              </div>
            )}
          </div>

          {/* Content Section - fades out/in (1.5s delay) */}
          <div className={`flex-1 overflow-hidden transition-opacity duration-[1000ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
            animationPhase === 'out' ? 'animate-content-fade-out' : 
            animationPhase === 'ready-to-slide-in' ? 'opacity-0' :
            animationPhase === 'in' ? 'animate-content-fade-in' : 
            'opacity-100'
          }`} dir="rtl">
            {articleHTML ? (
              <AutoScrollContent
                key={`content-${currentPost.id}`} // Force remount for each post
                htmlContent={articleHTML}
                className={`text-3xl leading-relaxed text-right ${tsTarek.className}`}
                characterThreshold={488}
                freezeDelay={5000}
                scrollSpeed={8}
              />
            ) : (
              <div className={`text-3xl leading-relaxed text-right ${tsTarek.className}`}>
                <p className="text-gray-400">لا يوجد نص للمقال حالياً</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Optional: Rotation indicator (for development) */}
      {process.env.NODE_ENV === 'development' && posts.length > 1 && (
        <div className="fixed bottom-4 left-4 text-white text-sm bg-black/50 px-3 py-2 rounded">
          المقال {currentIndex + 1} من {posts.length}
          {isTransitioning && ` (${animationPhase === 'out' ? 'خروج' : animationPhase === 'ready-to-slide-in' ? 'جاهز للدخول' : animationPhase === 'in' ? 'دخول' : 'انتقال'}...)`}
        </div>
      )}
    </div>
  );
}

