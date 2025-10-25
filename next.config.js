/** @type {import('next').NextConfig} */
const nextConfig = {
  logging: {
    fetches: { fullUrl: true }
  },
  reactStrictMode: true,
  // appDir: true, <-- temporarily comment out
};

module.exports = nextConfig;
