import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.964media.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '964media.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i0.wp.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '964tube.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
