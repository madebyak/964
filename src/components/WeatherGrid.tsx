'use client';

import React from 'react';
import { motion } from 'framer-motion';
import WeatherCard from './WeatherCard';
import { useIraqWeather } from '@/hooks/useWeatherAPI';

interface WeatherGridProps {
  className?: string;
  maxCities?: number;
}

export default function WeatherGrid({ 
  className = '', 
  maxCities = 8 
}: WeatherGridProps) {
  const { formattedWeatherData, error, refresh, lastUpdated, isLoading } = useIraqWeather();

  // Show up to maxCities
  const displayData = formattedWeatherData.slice(0, maxCities);

  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const handleRefresh = () => {
    refresh();
  };

  if (error && formattedWeatherData.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-red-500 mb-4">
          <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2 arabic-font" dir="rtl">
          خطأ في تحميل بيانات الطقس
        </h3>
        <p className="text-gray-600 mb-4 arabic-font" dir="rtl">
          {error}
        </p>
        <button
          onClick={handleRefresh}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors arabic-font"
          dir="rtl"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className={className}>

      {/* Weather Cards Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {displayData.map((weatherData, index) => (
          <WeatherCard
            key={weatherData.cityId}
            weatherData={weatherData}
            animationDelay={index * 0.1}
          />
        ))}
      </motion.div>

      {/* Minimal Loading Indicator */}
      {isLoading && formattedWeatherData.length === 0 && (
        <div className="flex justify-center items-center py-12">
          <motion.div
            className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      )}
    </div>
  );
}
