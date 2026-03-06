/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'docs',
  images: { unoptimized: true },
  basePath: process.env.NODE_ENV === 'production' ? '/beautyWeb' : '',
  trailingSlash: true,
};

export default nextConfig;
