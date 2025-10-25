/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  logging: {
    fetches: { fullUrl: true }
  },
  reactStrictMode: true,
  // appDir: true, <-- temporarily comment out
};

module.exports = nextConfig;
