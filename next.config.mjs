/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['puppeteer'],
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
