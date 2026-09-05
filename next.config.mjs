/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['puppeteer'],
  },
  images: {
    minimumCacheTTL: 31536000,
  },
  async redirects() {
    return [
      {
        source: '/builder',
        destination: '/editor',
        permanent: true,
      },
      {
        source: '/builder/:id',
        destination: '/editor/:id',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
