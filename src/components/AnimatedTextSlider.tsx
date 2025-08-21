'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface AnimatedTextSliderProps {
  texts: string[];
  intervalMs?: number;
  className?: string;
}

export default function AnimatedTextSlider({ 
  texts, 
  intervalMs = 20000, // 20 seconds default
  className = ""
}: AnimatedTextSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (texts.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % texts.length);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [texts.length, intervalMs]);

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

  if (texts.length === 0) return null;

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          variants={slideVariants}
          initial="initial"
          animate="center"
          exit="exit"
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="text-black text-2xl font-bold arabic-font text-center px-2">
            {texts[currentIndex]}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
