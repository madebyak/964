'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { WeatherData } from '@/services/weatherApi';

interface WeatherCardProps {
  weatherData: ReturnType<typeof import('@/services/weatherApi').weatherAPI.formatWeatherForDisplay>;
  className?: string;
  animationDelay?: number;
}

export default function WeatherCard({ 
  weatherData, 
  className = '', 
  animationDelay = 0 
}: WeatherCardProps) {
  const {
    cityNameArabic,
    cityName,
    temperature,
    feelsLike,
    tempMin,
    tempMax,
    humidity,
    windSpeed,
    condition,
    lastUpdated
  } = weatherData;

  // Animation variants for smooth entrance
  const cardVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1
    }
  };

  const temperatureColor = React.useMemo(() => {
    if (temperature >= 35) return 'text-red-600';
    if (temperature >= 25) return 'text-orange-500';
    if (temperature >= 15) return 'text-blue-500';
    return 'text-blue-700';
  }, [temperature]);

  return (
    <motion.div
      className={`
        bg-white/60 backdrop-blur-lg rounded-2xl shadow-lg hover:shadow-xl 
        transition-all duration-300
        p-6 relative overflow-hidden group cursor-pointer
        ${className}
      `}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{
        duration: 0.6,
        delay: animationDelay,
        ease: "easeOut"
      }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Content */}
      <div className="relative z-10">
        {/* City Name */}
        <div className="mb-4">
          <h3 className="text-5xl font-bold text-gray-800 arabic-font" dir="rtl">
            {cityNameArabic}
          </h3>

        </div>

        {/* Weather Icon and Temperature */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            {/* Weather Icon */}
            <div className="relative">
              <img
                src={condition.iconUrl}
                alt={condition.descriptionArabic}
                className="w-16 h-16 object-contain drop-shadow-lg"
                loading="lazy"
              />
            </div>
            
            {/* Temperature */}
            <div className="text-center">
              <div className={`text-6xl font-bold ${temperatureColor} arabic-font`}>
                {temperature}°
              </div>

            </div>
          </div>
        </div>

        {/* Weather Description */}
        <div className="mb-4">
          <p className="text-4xl text-gray-700 arabic-font font-medium" dir="rtl">
            {condition.descriptionArabic}
          </p>
        </div>

        {/* Temperature Range */}
        <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-3xl text-black arabic-font" dir="rtl">الأدنى</div>
            <div className="text-3xl font-bold text-blue-600 arabic-font">{tempMin}°</div>
          </div>
          <div className="w-px h-10 bg-gray-300" />
          <div className="text-center">
            <div className="text-3xl text-black arabic-font" dir="rtl">الأعلى</div>
            <div className="text-3xl font-bold text-red-500 arabic-font">{tempMax}°</div>
          </div>
        </div>

        {/* Additional Weather Info */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Humidity */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse p-3 bg-blue-50 rounded-lg">
            <div className="w-8 h-8 flex items-center justify-center bg-blue-100 rounded-full">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <div className="text-3xl text-black arabic-font" dir="rtl">الرطوبة</div>
              <div className="text-3xl font-bold text-blue-700 arabic-font">{humidity}%</div>
            </div>
          </div>

          {/* Wind Speed */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse p-3 bg-green-50 rounded-lg">
            <div className="w-8 h-8 flex items-center justify-center bg-green-100 rounded-full">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 10a6 6 0 1112 0 6 6 0 01-12 0zm6-8a8 8 0 100 16 8 8 0 000-16z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <div className="text-3xl text-black arabic-font" dir="rtl">الرياح</div>
              <div className="text-3xl font-bold text-green-700 arabic-font">{windSpeed} ك/س</div>
            </div>
          </div>
        </div>

 
      </div>

      {/* Yellow accent line (brand color) */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-yellow-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
    </motion.div>
  );
}
