"use client";

import { useMemo, useRef, useState, useEffect } from 'react';
import { useIraqWires } from '@/hooks/useNewsAPI';
import { tsTarek } from '@/app/fonts';
import { WireHeadline } from '@/services/wiresApi';

interface VerticalHeadlinesProps {
  fetchLimit?: number;
  speedPxPerSec?: number; // scroll speed
  initialData?: WireHeadline[]; // Pre-fetched server data
}

export default function VerticalHeadlines({ 
  fetchLimit = 20, 
  speedPxPerSec = 40, 
  initialData 
}: VerticalHeadlinesProps) {
  // Use the successful news-ticker pattern: immediate data, background refresh
  // Pass initialData to eliminate fallback flash
  const { wireHeadlines } = useIraqWires(initialData);
  
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerHeight, setContainerHeight] = useState<number>(0);

  // Use wireHeadlines from hook instead of manual fetching
  const items = wireHeadlines;

  useEffect(() => {
    const resize = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // Duplicate list to create seamless loop
  const loopItems = useMemo(() => {
    if (items.length === 0) return [];
    return [...items, ...items];
  }, [items]);

  // Calculate animation duration based on content height
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [contentHeight, setContentHeight] = useState(0);
  useEffect(() => {
    if (!contentRef.current) return;
    const ro = new ResizeObserver(() => {
      setContentHeight(contentRef.current?.scrollHeight || 0);
    });
    ro.observe(contentRef.current);
    setContentHeight(contentRef.current.scrollHeight);
    return () => ro.disconnect();
  }, [loopItems]);

  const duration = useMemo(() => {
    const distance = Math.max(contentHeight / 2, containerHeight); // one list length
    const pxPerSec = Math.max(10, speedPxPerSec);
    return distance / pxPerSec; // seconds
  }, [contentHeight, containerHeight, speedPxPerSec]);

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden" dir="rtl">
      <div
        ref={contentRef}
        style={{
          animation: items.length > 0 ? `vh-scroll ${duration}s linear infinite` : undefined,
        }}
      >
                {loopItems.map((item, idx) => (
          <div key={`${item.id}-${idx}`} className="py-4 border-b border-gray-700/70 last:border-b-0">
            {/* Headline */}
            <div className={`text-4xl text-white leading-relaxed mb-3 ${tsTarek.className}`}>
              {item.title}
            </div>
            
            {/* Source Info Bar: Icon + Source Name + Time */}
            <div className="flex items-center gap-3">
              {/* Source Icon + Name Container (White Background) */}
              <div className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded">
                {/* Source Icon */}
                {item.source?.icon && (
                  <img 
                    src={item.source.icon} 
                    alt={item.source.name}
                    className="w-6 h-6 rounded object-cover flex-shrink-0"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                
                {/* Source Name */}
                <div className={`text-lg text-black font-bold ${tsTarek.className}`}>
                  {item.source?.name || 'مصدر غير محدد'}
                </div>
              </div>
              
              {/* Time */}
              {item.date && (
                <div className={`text-xl text-white mr-auto ${tsTarek.className}`}>
                  {new Date(item.date).toLocaleTimeString('ar-IQ', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


