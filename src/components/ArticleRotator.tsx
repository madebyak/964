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
  // Unified animation timing constants (ms)
  const OUT_MS = 1200;
  const IN_MS = 1200;
  const STAGGER_MS = 300; // descriptive, for CSS to match
  const MEDIA_READY_TIMEOUT_MS = 900;

  // Dev-safe logger
  const devLog = (...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log(...args);
    }
  };
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'display' | 'out' | 'ready-to-slide-in' | 'in' | 'none'>('display');

  const rotationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const phaseRef = useRef(animationPhase);
  useEffect(() => {
    phaseRef.current = animationPhase;
  }, [animationPhase]);

  // Helper: compute primary media URL for a post (image or video)
  const resolvePrimaryMedia = useCallback((post: Post | null | undefined) => {
    if (!post) return { image: '', video: '' };
    const image = post.featured_image?.sizes?.large
      || post.featured_image?.sizes?.full
      || post.featured_image?.sizes?.medium_large
      || post.featured_image?.sizes?.medium
      || '';
    const video = post.featured_video?.mp4 || '';
    return { image, video };
  }, []);

  // Helper: wait for media readiness (non-blocking with timeout)
  const waitForMediaReady = useCallback((post: Post | null | undefined): Promise<void> => {
    const { image, video } = resolvePrimaryMedia(post);
    const tasks: Promise<void>[] = [];
    if (video) {
      tasks.push(new Promise<void>((resolve) => {
        try {
          const v = document.createElement('video');
          v.preload = 'metadata';
          v.src = video;
          const onReady = () => {
            v.removeEventListener('loadedmetadata', onReady);
            v.removeEventListener('error', onReady);
            resolve();
          };
          v.addEventListener('loadedmetadata', onReady);
          v.addEventListener('error', onReady);
        } catch {
          resolve();
        }
      }));
    } else if (image) {
      tasks.push(new Promise<void>((resolve) => {
        try {
          const img = new window.Image();
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = image;
        } catch {
          resolve();
        }
      }));
    } else {
      // No media to wait for
      tasks.push(Promise.resolve());
    }
    const timeout = new Promise<void>((resolve) => setTimeout(resolve, MEDIA_READY_TIMEOUT_MS));
    return Promise.race([Promise.all(tasks).then(() => {}), timeout]);
  }, [MEDIA_READY_TIMEOUT_MS, resolvePrimaryMedia]);

  // Get current post
  // Skip posts that have neither media nor content nor non-empty title
  const findDisplayableIndex = useCallback((startIndex: number): number => {
    if (posts.length === 0) return -1;
    for (let i = 0; i < posts.length; i++) {
      const idx = (startIndex + i) % posts.length;
      const p = posts[idx];
      const hasImage = Boolean(
        p?.featured_image?.sizes?.large
        || p?.featured_image?.sizes?.full
        || p?.featured_image?.sizes?.medium_large
        || p?.featured_image?.sizes?.medium
      );
      const hasVideo = Boolean(p?.featured_video?.mp4);
      const hasContent = Boolean(p?.content_rendered || p?.content_text);
      const hasTitle = Boolean(p?.title && p.title.trim().length > 0);
      if (hasImage || hasVideo || hasContent || hasTitle) return idx;
    }
    return -1;
  }, [posts]);

  const displayIndex = findDisplayableIndex(currentIndex >= posts.length ? 0 : currentIndex);
  const currentPost = displayIndex >= 0 ? posts[displayIndex] : null;

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
    devLog('🎬 out: start', { index: currentIndex, id: posts[currentIndex]?.id });
    
    // Phase 1: Start slide-out animation sequence
    setAnimationPhase('out');
    
    // Slide-out duration unified with CSS
    transitionTimeoutRef.current = setTimeout(() => {
      devLog('🔄 out: complete', { index: currentIndex, id: posts[currentIndex]?.id });
      
      // Switch to next post AND set to 'ready-to-slide-in' state simultaneously
      const nextIndexRaw = (currentIndex + 1) % posts.length;
      const nextIndex = findDisplayableIndex(nextIndexRaw);
      setCurrentIndex(nextIndex >= 0 ? nextIndex : nextIndexRaw);
      setAnimationPhase('ready-to-slide-in'); // NEW content positioned off-screen for slide-in
      
      // Preload media for the post after next
      const followingIndex = (nextIndex + 1) % posts.length;
      preloadNextMedia(followingIndex);
      
      // Ensure the 'ready' phase styles apply before slide-in (raf gating)
      const nextPost = posts[nextIndex];
      requestAnimationFrame(() => {
        waitForMediaReady(nextPost).finally(() => {
          setAnimationPhase('in');
          devLog('🎬 in: start', { index: nextIndex, id: nextPost?.id });
          
          // Complete transition after slide-in sequence
          transitionTimeoutRef.current = setTimeout(() => {
            devLog('✅ in: complete → display', { index: nextIndex, id: nextPost?.id });
            setAnimationPhase('display');
            setIsTransitioning(false);
          }, IN_MS);

          // Watchdog: if still not in display after grace, force-complete
          setTimeout(() => {
            if (phaseRef.current !== 'display') {
              devLog('⚠️ watchdog: forcing display phase');
              setAnimationPhase('display');
              setIsTransitioning(false);
            }
          }, IN_MS + 400);
        });
      });
      
    }, OUT_MS);

    // Watchdog for out-phase
    setTimeout(() => {
      if (phaseRef.current === 'out') {
        devLog('⚠️ watchdog: still in out-phase, forcing ready');
        setAnimationPhase('ready-to-slide-in');
      }
    }, OUT_MS + 400);
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
        devLog('📰 Article rotator: Refreshed posts in background');
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
      devLog('🔄 Setting up background post refresh every 10 minutes');
      refreshIntervalRef.current = setInterval(refreshPosts, 600000);
    }

    // Preload next post media when currentIndex changes
    if (posts.length > 1) {
      preloadNextMedia((currentIndex + 1) % posts.length);
    }

    return () => {
      // Clear background interval
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      // Clear any pending timeouts
      cleanupTimers();
    };
  }, [posts.length, currentIndex, refreshPosts, preloadNextMedia, cleanupTimers]);

  // Simple rotation timer - start immediately for testing
  useEffect(() => {
    if (posts.length > 1 && !isTransitioning) {
      // Use shorter interval for testing: 5 seconds in dev, 30 seconds in production
      const testInterval = process.env.NODE_ENV === 'development' ? 5000 : rotationInterval;
      
      devLog(`⏰ Starting ${testInterval/1000}-second timer for post ${currentIndex + 1}/${posts.length}`);
      
      const timerId = setTimeout(() => {
        devLog(`🔄 ${testInterval/1000} seconds up! Transitioning from post ${currentIndex + 1} to ${((currentIndex + 1) % posts.length) + 1}`);
        // Clear any pending transition timers before starting a new one
        if (transitionTimeoutRef.current) {
          clearTimeout(transitionTimeoutRef.current);
          transitionTimeoutRef.current = null;
        }
        transitionToNextPost();
      }, testInterval);

      rotationTimeoutRef.current = timerId;

      return () => {
        if (timerId) {
          clearTimeout(timerId);
          devLog(`⏹️ Cleared timer for post ${currentIndex + 1}`);
        }
      };
    }
  }, [currentIndex, posts.length, isTransitioning, rotationInterval, transitionToNextPost]); // Reset timer when currentIndex changes

  // Clamp currentIndex after posts refresh to valid range
  useEffect(() => {
    if (posts.length === 0) return;
    if (currentIndex >= posts.length) {
      setCurrentIndex(posts.length - 1);
    }
  }, [posts.length]);

  // Cancel transition if posts mutate during animation
  useEffect(() => {
    if (isTransitioning) {
      devLog('🔁 posts mutated during transition → cancel current animation');
      cleanupTimers();
      setAnimationPhase('display');
      setIsTransitioning(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts]);

  // Pause rotation on tab hidden; resume on visible
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        devLog('⏸ visibility: hidden → pause timers');
        cleanupTimers();
      } else {
        devLog('▶️ visibility: visible → resume');
        if (!isTransitioning && posts.length > 1) {
          // kick a gentle timer to continue
          rotationTimeoutRef.current = setTimeout(() => {
            transitionToNextPost();
          }, 500);
        }
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [cleanupTimers, isTransitioning, posts.length, transitionToNextPost]);

  // Development debugging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      devLog('📰 Article rotator status:', {
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
                <div className={`text-3xl opacity-70 text-right transition-transform duration-[800ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
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
                className={`text-4xl font-medium leading-normal text-right ${tsTarek.className}`}
                characterThreshold={488}
                freezeDelay={5000}
                scrollSpeed={8}
              />
            ) : (
              <div className={`text-4xl leading-relaxed text-right ${tsTarek.className}`}>
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

