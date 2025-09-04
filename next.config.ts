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
    ],
  },
};

export default nextConfig;
