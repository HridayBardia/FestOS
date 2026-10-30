/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@electric-sql/pglite', 'pg'],
    outputFileTracingIncludes: {
      '/api/**/*': ['./src/lib/canonical.json'],
    },
  },
};

export default nextConfig;
