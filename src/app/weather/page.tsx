'use client';

import React from 'react';
import { motion } from 'framer-motion';
import WeatherVeil from '@/components/WeatherVeil';
import WeatherGrid from '@/components/WeatherGrid';

export default function WeatherPage() {
  return (
    <div className="w-screen h-screen bg-black overflow-hidden">
      {/* Animated Weather Background - Full Screen */}
      <div className="absolute inset-0 w-full h-full">
        <WeatherVeil 
          hueShift={0}         // No hue shift to preserve exact RGB color
          speed={0.6}          // Gentle, cloud-like movement
          warpAmount={0.04}    // Soft atmospheric warping
          noiseIntensity={0.015} // Light texture for atmosphere
          resolutionScale={1}
        />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full h-full flex flex-col">
        {/* Header Section - Top Right */}
        <motion.div 
          className="flex justify-end px-12 pt-12 pb-8"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="text-right">
            {/* Main Headline */}
            <h1 className="text-5xl md:text-8xl font-bold text-white arabic-font leading-tight mb-3" dir="rtl">
              أحوال الطقس
            </h1>
            
            {/* Subheading */}
            <p className="text-xl md:text-6xl text-white arabic-font  font-bold leading-relaxed" dir="rtl">
              الطقس الحالي والمحدث في جميع أنحاء العراق
            </p>
          </div>
        </motion.div>

        {/* Weather Cards Grid - Center */}
        <motion.div 
          className="flex-1 flex items-center justify-center px-8 pb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="w-full ">
            <WeatherGrid className="w-full" maxCities={8} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
