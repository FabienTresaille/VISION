/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    instrumentationHook: true,
    serverComponentsExternalPackages: ['node-cron', 'rss-parser', 'bcryptjs'],
  },
};

module.exports = nextConfig;
