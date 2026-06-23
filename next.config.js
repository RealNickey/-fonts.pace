/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@resvg/resvg-js'],
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
