'use client';

import { motion, useAnimationFrame, useMotionValue, useTransform, useReducedMotion } from 'framer-motion';
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

type Direction = 'right' | 'left';

interface NewsTickerTextProps {
  newsItems: string[];
  /** pixels per second (not seconds). Defaults to 80 px/s */
  speed?: number;
  /** visual movement direction; default is 'right' to match your request */
  direction?: Direction;
  /** pause on hover (default true) */
  pauseOnHover?: boolean;
  /** size of the yellow separator dot in px */
  dotSize?: number;
  /** horizontal gap between items in px */
  gap?: number;
}

export default function NewsTickerText({
  newsItems,
  speed = 80,
  direction = 'right',
  pauseOnHover = true,
  dotSize = 12,
  gap = 32,
}: NewsTickerTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  // Motion state
  const x = useMotionValue(0);
  const reduceMotion = useReducedMotion();

  // Measure widths (and re-measure on resize/font load)
  useLayoutEffect(() => {
    const measure = () => {
      if (contentRef.current && containerRef.current) {
        setContentWidth(contentRef.current.scrollWidth);
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    measure();

    const ro = new ResizeObserver(measure);
    if (contentRef.current) ro.observe(contentRef.current);
    if (containerRef.current) ro.observe(containerRef.current);

    // Re-measure after fonts load (avoids jumps)
    if ('fonts' in document && document.fonts?.ready) {
      document.fonts.ready.then(measure).catch(() => {});
    }

    return () => ro.disconnect();
  }, []);

  // Start off-screen on first render so the ticker enters from the left moving to the right
  useEffect(() => {
    if (!containerWidth) return;
    if (direction === 'right') {
      x.set(-containerWidth);
    } else {
      x.set(0);
    }
  }, [containerWidth, direction, x]);

  // Wrap the x transform to [-contentWidth, 0] for seamless looping in both directions
  const baseX = useTransform(x, (latest) => {
    if (!contentWidth) return '0px';
    // Manual wrap(-contentWidth, 0, latest)
    const range = contentWidth;
    let v = ((latest % range) + range) % range; // 0..contentWidth
    v = v - range; // -contentWidth..0
    return `${v}px`;
  });

  // Drive the marquee
  const [isHovered, setIsHovered] = useState(false);
  useAnimationFrame((_, delta) => {
    if (reduceMotion || !contentWidth) return;
    if (pauseOnHover && isHovered) return;

    const pxPerMs = speed / 1000;
    const dir = direction === 'right' ? 1 : -1;
    x.set(x.get() + dir * pxPerMs * delta);
  });

  // Build the content with a separator after *every* item (including the last)
  const Content = useMemo(
    () =>
      function ContentInner({ ariaHidden = false }: { ariaHidden?: boolean }) {
        return (
          <div
            className="flex items-center whitespace-nowrap text-black text-3xl font-semibold arabic-font"
            dir="rtl"
            aria-hidden={ariaHidden}
          >
            {newsItems.map((item, idx) => (
              <span key={`${idx}-item`} className="inline-flex items-center">
                <span className="whitespace-nowrap">{item}</span>
                <span className="inline-flex items-center" style={{ marginInline: gap }}>
                  <span
                    className="rounded-full inline-block"
                    style={{
                      width: dotSize,
                      height: dotSize,
                      backgroundColor: '#ffd400',
                    }}
                  />
                </span>
              </span>
            ))}
          </div>
        );
      },
    [newsItems, dotSize, gap]
  );

  // Render at least 3 copies; for very short content we ensure enough copies to cover container width
  const copies = useMemo(() => {
    if (!contentWidth || !containerWidth) return 3;
    const minCopies = Math.ceil((containerWidth * 2) / Math.max(1, contentWidth)) + 1;
    return Math.max(3, minCopies);
  }, [contentWidth, containerWidth]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* The moving rail */}
      <motion.div
        className="absolute inset-y-0 left-0 flex will-change-transform"
        style={{ x: baseX }}
      >
        {/* First (measured) copy */}
        <div ref={contentRef} className="flex items-center">
          <Content />
        </div>

        {/* Additional copies for seamless loop, aria-hidden to avoid screen reader repetition */}
        {Array.from({ length: copies - 1 }).map((_, i) => (
          <div key={`copy-${i}`} className="flex items-center" aria-hidden>
            <Content ariaHidden />
          </div>
        ))}
      </motion.div>
    </div>
  );
}
