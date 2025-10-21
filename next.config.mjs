import withPWA from 'next-pwa';
import runtimeCaching from 'next-pwa/cache.js'; // optional base cache rules

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

const customRuntimeCaching = [
  // Cache Google Fonts
  {
    urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
    handler: 'CacheFirst',
    options: {
      cacheName: 'google-fonts',
      expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
    },
  },

  // Cache your app pages and data
  {
    urlPattern: /^https:\/\/(?:pera-pwa\.vercel\.app|localhost:3000)\/.*/i,
    handler: 'NetworkFirst',
    options: {
      cacheName: 'app-pages',
      networkTimeoutSeconds: 10,
      expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 }, // 1 week
    },
  },

  // Cache static assets (JS, CSS, images)
  {
    urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico|js|css|woff2?)$/i,
    handler: 'CacheFirst',
    options: {
      cacheName: 'static-assets',
      expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 }, // 30 days
    },
  },
];

// Wrap config with PWA
const config = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: customRuntimeCaching,
  fallbacks: {
    document: '/offline', // served when a page isn't cached & user is offline
  },
  additionalManifestEntries: [
  { url: '/', revision: null },
  { url: '/offline', revision: null },
  { url: '/dashboard', revision: null },
  { url: '/profile', revision: null }, 
  { url: '/home', revision: null },
  { url: '/calendar', revision: null },
  { url: '/diagnostic', revision: null },
  { url: '/assistant', revision: null },

],
})(nextConfig);

export default config;
