/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      // Google Drive direct-download endpoint (uc?export=view&id=...)
      {
        protocol: 'https',
        hostname: 'drive.google.com',
      },
      // Google Drive thumbnail / content-delivery CDN
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  // Required for Three.js
  transpilePackages: ['three'],
}

export default nextConfig
