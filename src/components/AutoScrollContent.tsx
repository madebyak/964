"use client";

import { useEffect, useRef, useState, useCallback } from 'react';

interface AutoScrollContentProps {
  htmlContent: string;
  className?: string;
  characterThreshold?: number;
  freezeDelay?: number;
  scrollSpeed?: number;
}

export default function AutoScrollContent({
  htmlContent,
  className = '',
  characterThreshold = 488,
  freezeDelay = 5000, // 5 seconds
  scrollSpeed = 30, // pixels per second
}: AutoScrollContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [shouldAutoScroll, setShouldAutoScroll] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [containerHeight, setContainerHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);

  // Extract plain text from HTML for character counting
  const getPlainText = useCallback((html: string): string => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  }, []);

  // Measure container and content dimensions
  const measureDimensions = useCallback(() => {
    if (!containerRef.current || !contentRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const contentRect = contentRef.current.scrollHeight;

    setContainerHeight(containerRect.height);
    setContentHeight(contentRect);

    const plainText = getPlainText(htmlContent);
    const hasOverflow = contentRect > containerRect.height;
    const exceedsCharLimit = plainText.length > characterThreshold;

    setShouldAutoScroll(hasOverflow && exceedsCharLimit);

    if (process.env.NODE_ENV === 'development') {
      console.log('AutoScroll Analysis:', {
        characters: plainText.length,
        threshold: characterThreshold,
        containerHeight: containerRect.height,
        contentHeight: contentRect,
        hasOverflow,
        exceedsCharLimit,
        shouldAutoScroll: hasOverflow && exceedsCharLimit,
      });
    }
  }, [htmlContent, characterThreshold, getPlainText]);

  // Smooth scroll animation
  const startScrollAnimation = useCallback(() => {
    if (!containerRef.current || !shouldAutoScroll) return;

    setIsScrolling(true);
    const container = containerRef.current;
    const maxScroll = contentHeight - containerHeight;
    const duration = (maxScroll / scrollSpeed) * 1000; // Convert to milliseconds
    
    let startTime: number | null = null;
    const startScrollTop = container.scrollTop;

    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const newScrollTop = startScrollTop + (maxScroll * easeOut);

      container.scrollTop = newScrollTop;

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsScrolling(false);
        // Reset to top after a brief pause and restart cycle
        setTimeout(() => {
          container.scrollTop = 0;
          // Restart the cycle after returning to top
          timeoutRef.current = setTimeout(startScrollAnimation, freezeDelay);
        }, 2000);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [shouldAutoScroll, contentHeight, containerHeight, scrollSpeed, freezeDelay]);

  // Initialize auto-scroll cycle
  const initializeAutoScroll = useCallback(() => {
    if (!shouldAutoScroll) return;

    // Clear any existing timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    // Start the freeze delay, then begin scrolling
    timeoutRef.current = setTimeout(startScrollAnimation, freezeDelay);
  }, [shouldAutoScroll, freezeDelay, startScrollAnimation]);

  // Measure dimensions on content change
  useEffect(() => {
    const measureWithDelay = () => {
      // Use RAF to ensure DOM has updated after dangerouslySetInnerHTML
      requestAnimationFrame(() => {
        setTimeout(measureDimensions, 100);
      });
    };

    measureWithDelay();
  }, [htmlContent, measureDimensions]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      measureDimensions();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [measureDimensions]);

  // Initialize auto-scroll when shouldAutoScroll changes
  useEffect(() => {
    initializeAutoScroll();
  }, [initializeAutoScroll]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`h-full w-full overflow-hidden relative ${className}`}
      style={{
        scrollBehavior: 'auto', // Prevent browser smooth scrolling interference
      }}
    >
      <div
        ref={contentRef}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
      
    </div>
  );
}
