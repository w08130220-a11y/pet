/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'docs',
  basePath: '/beautyWeb',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
