/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'docs',
  basePath: '/pet',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
