import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

// Wrap your config with next-pwa
const config = withPWA({
  dest: 'public',          // where the service worker and assets are output
  register: true,          // auto-register the service worker
  skipWaiting: true,       // activate the SW immediately after update
  disable: process.env.NODE_ENV === 'development', // disable in dev mode
})(nextConfig);

export default config;
