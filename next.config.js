/** @type {import('next').NextConfig} */
const nextConfig = {
  // Back to development mode for CI/CD
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  webpack: (config, { isServer }) => {
    // Ignore optional WebSocket dependencies
    config.resolve.fallback = {
      ...config.resolve.fallback,
      bufferutil: false,
      'utf-8-validate': false,
    };
    
    // Ignore WebSocket warnings
    config.ignoreWarnings = [
      /Module not found: Can't resolve 'bufferutil'/,
      /Module not found: Can't resolve 'utf-8-validate'/,
    ];
    
    return config;
  },
};

module.exports = nextConfig;
