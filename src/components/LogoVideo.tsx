'use client';

import { useEffect, useRef } from 'react';

interface LogoVideoProps {
  className?: string;
}

export default function LogoVideo({ className = "" }: LogoVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      // Force play after component mounts
      const playVideo = async () => {
        try {
          await video.play();
          console.log('Video started playing successfully');
        } catch (error) {
          console.error('Error playing video:', error);
        }
      };

      // Small delay to ensure video is loaded
      const timer = setTimeout(playVideo, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <video
      ref={videoRef}
      className={`w-full h-full object-contain ${className}`}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      controls={false}
      onError={(e) => console.error('Video error:', e)}
      onLoadStart={() => console.log('Video loading started')}
      onCanPlay={() => console.log('Video can play')}
      onPlay={() => console.log('Video started playing')}
    >
      <source 
        src="/motions/logos/logo-02-slogan-intro-black-01.webm" 
        type="video/webm"
      />
      <source 
        src="/motions/logos/logo-02-slogan-intro-black-01.webm" 
        type="video/mp4"
      />
      {/* Fallback content */}
      <div className="w-full h-full bg-white flex items-center justify-center text-xs">
        Video not supported
      </div>
    </video>
  );
}
