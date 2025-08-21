'use client';

import Image from 'next/image';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Image 
              src="/logo-white.svg" 
              alt="+964 Media Logo" 
              width={120} 
              height={48}
              className="h-12 w-auto"
            />
          </div>
          
          {/* Navigation items - can be added later */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Future navigation items */}
          </div>
        </div>
      </div>
    </nav>
  );
}
