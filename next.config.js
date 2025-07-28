/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:8000',
  },
  async rewrites() {
    return [
      {
        source: '/api/statistiques',
        destination: 'http://localhost:8000/api/v1/dashboard/statistiques',
      },
      {
        source: '/api/v1/dashboard/statistiques',
        destination: 'http://localhost:8000/api/v1/dashboard/statistiques',
      },
      {
        source: '/api/plaintes/:path*',
        destination: 'http://localhost:8000/api/v1/dashboard/plaintes/:path*',
      },
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*', // Proxy vers le backend FastAPI
      },
    ]
  },
}

module.exports = nextConfig 