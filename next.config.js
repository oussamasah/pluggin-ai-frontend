/** @type {import('next').NextConfig} */
const nextConfig = {
  logging: {
    fetches: { fullUrl: true }
  },
  reactStrictMode: true,
  // appDir: true, <-- temporarily comment out
  
  // Skip static generation for pages that require authentication
  // This prevents build errors when Clerk keys are not available
  experimental: {
    // Disable static exports for dynamic auth pages
  }
};

module.exports = nextConfig;
