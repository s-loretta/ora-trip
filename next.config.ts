import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-e56a1544e7114f1a8d7a3186235650e0.r2.dev', // Le domaine exact de ton image
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;