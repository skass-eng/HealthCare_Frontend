/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000',
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/healthcare-ai',
        permanent: true,
      },
    ]
  },
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
    
    return [
      {
        source: '/api/statistiques',
        destination: `${backendUrl}/api/v1/dashboard/statistiques`,
      },
      {
        source: '/api/v1/dashboard/statistiques',
        destination: `${backendUrl}/api/v1/dashboard/statistiques`,
      },
      {
        source: '/api/plaintes/:path*',
        destination: `${backendUrl}/api/v1/dashboard/plaintes/:path*`,
      },
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`, // Proxy vers le backend FastAPI
      },
    ]
  },
}

module.exports = nextConfig 