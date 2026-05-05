/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  webpack(config, { isServer }) {
    if (isServer) {
      config.externals = config.externals || []
      config.externals.push('@resvg/resvg-js')
    }
    return config
  },
}

module.exports = nextConfig
