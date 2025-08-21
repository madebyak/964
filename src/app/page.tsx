'use client';

import Navbar from '@/components/Navbar';
import DarkVeil from '@/components/DarkVeil';

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center">
        {/* Animated Gradient Background - Full Width/Height */}
        <div className="absolute inset-0 w-full h-full">
          <DarkVeil 
            hueShift={19}
            speed={1.3}
            warpAmount={0.1}
            resolutionScale={1}
          />
        </div>
        
        {/* Content Container */}
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex items-center min-h-screen">
            {/* Headline - Aligned Left */}
            <div className="w-full md:w-2/3 lg:w-1/2">
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold text-white leading-tight">
                <span className="block text-4xl md:text-6xl lg:text-7xl">Motion design system</span>
              </h1>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}