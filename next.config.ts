/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config: any) => {
    config.resolve.fallback = { fs: false, path: false };
    return config;
  },
};

export default nextConfig;
