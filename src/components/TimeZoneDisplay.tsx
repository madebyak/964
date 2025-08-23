'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface TimeZoneDisplayProps {
  className?: string;
}

export default function TimeZoneDisplay({ 
  className = ""
}: TimeZoneDisplayProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState({
    baghdad: '',
    gmt: ''
  });

  // Update time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      
      // Baghdad time (UTC+3)
      const baghdadTime = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Baghdad',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(now);
      
      // GMT time (UTC+0)
      const gmtTime = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'UTC',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(now);

      setCurrentTime({
        baghdad: `${baghdadTime} BGD`,
        gmt: `${gmtTime} GMT`
      });
    };

    // Update immediately
    updateTime();
    
    // Update every second
    const timeInterval = setInterval(updateTime, 1000);

    return () => clearInterval(timeInterval);
  }, []);

  // Switch between time zones every 30 seconds
  useEffect(() => {
    const switchInterval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % 2);
    }, 30000);

    return () => clearInterval(switchInterval);
  }, []);

  const slideVariants = {
    // Initial state - text starts below the container
    initial: {
      y: '100%',
      opacity: 0,
    },
    // Center state - text is visible in center
    center: {
      y: '0%',
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.86, 0, 0.07, 1] as const,
      },
    },
    // Exit state - text slides up and out
    exit: {
      y: '-100%',
      opacity: 0,
      transition: {
        duration: 0.8,
        ease: [0.86, 0, 0.07, 1] as const,
      },
    },
  };

  const timeTexts = [currentTime.baghdad, currentTime.gmt];

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentIndex}-${currentTime.baghdad}-${currentTime.gmt}`}
          variants={slideVariants}
          initial="initial"
          animate="center"
          exit="exit"
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="text-black text-3xl font-bold text-center px-2 font-mono">
            {timeTexts[currentIndex]}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
