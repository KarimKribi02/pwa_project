const withPWA = require('next-pwa')({
  dest: 'public',
  swSrc: 'src/sw.ts',
  register: true,
  skipWaiting: true,
  //disable: process.env.NODE_ENV === 'development'
  disable: false
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Other config options
};

module.exports = withPWA(nextConfig);
