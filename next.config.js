/** @type {import('next').NextConfig} */
const nextConfig = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  reactStrictMode: true,
  appDir: true, // <-- moved out of "experimental"
};

module.exports = nextConfig;
