'use client';

import Navbar from '@/components/Navbar';
import DarkVeil from '@/components/DarkVeil';
import LowerThirdSection from '@/components/LowerThirdSection';

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
            <div className="w-full">
              <h1 className="text-8xl md:text-8xl lg:text-9xl font-medium text-white leading-tight">
                <span className="block text-4xl md:text-6xl lg:text-8xl">Motion design system</span>
              </h1>
              
              {/* Description paragraph */}
              <p className="text-lg md:text-xl text-white/80 font-normal mt-8 max-w-2xl leading-relaxed">
                Explore our comprehensive collection of motion graphics and broadcast design elements 
                for the +964 media network. From dynamic lower thirds and channel branding to 
                sophisticated transitions and on-screen graphics that define modern Iraqi television.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Logo Motion Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-6">
          {/* Section Header */}
          <div className="mb-16">
            {/* Title with Yellow Square */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-4 h-4 bg-[#fcd903]"></div>
              <h2 className="text-2xl md:text-3xl lg:text-5xl font-medium text-white">
                Logo motion
              </h2>
            </div>
            
            {/* Description Paragraph */}
            <p className="text-base md:text-lg text-white/70 font-normal leading-tight max-w-3xl">
              Discover our collection of dynamic logo animations for the +964 media network. 
              These motion graphics include brand introductions, outro sequences, and live broadcast 
              identifiers that maintain visual consistency across all broadcasting platforms.
            </p>
          </div>

          {/* Video Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            {/* Logo Intro */}
            <div className="bg-zinc-900/50 rounded-lg overflow-hidden border border-white/10">
              <video 
                className="w-full h-auto aspect-video object-contain"
                autoPlay 
                loop 
                muted 
                playsInline
              >
                <source src="/motions/logos/logo-01-intro.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="p-4">
                <h3 className="text-white font-medium text-sm mb-1">Logo Intro</h3>
                <p className="text-white/60 text-xs">Brand introduction animation</p>
              </div>
            </div>

            {/* Logo Outro */}
            <div className="bg-zinc-900/50 rounded-lg overflow-hidden border border-white/10">
              <video 
                className="w-full h-auto aspect-video object-contain"
                autoPlay 
                loop 
                muted 
                playsInline
              >
                <source src="/motions/logos/logo-01-outro.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="p-4">
                <h3 className="text-white font-medium text-sm mb-1">Logo Outro</h3>
                <p className="text-white/60 text-xs">Brand closing animation</p>
              </div>
            </div>

            {/* Logo Slogan Intro */}
            <div className="bg-zinc-900/50 rounded-lg overflow-hidden border border-white/10">
              <video 
                className="w-full h-auto aspect-video object-contain"
                autoPlay 
                loop 
                muted 
                playsInline
              >
                <source src="/motions/logos/logo-02-slogan-intro.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="p-4">
                <h3 className="text-white font-medium text-sm mb-1">Slogan Intro</h3>
                <p className="text-white/60 text-xs">Logo with slogan animation</p>
              </div>
            </div>

            {/* Logo Live */}
            <div className="bg-zinc-900/50 rounded-lg overflow-hidden border border-white/10">
              <video 
                className="w-full h-auto aspect-video object-contain"
                autoPlay 
                loop 
                muted 
                playsInline
              >
                <source src="/motions/logos/logo-IN-LIVE.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="p-4">
                <h3 className="text-white font-medium text-sm mb-1">Live Identifier</h3>
                <p className="text-white/60 text-xs">On-air live broadcast logo</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lower Third Section */}
      <LowerThirdSection />
    </div>
  );
}