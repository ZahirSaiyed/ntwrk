/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com'], // For Google profile images
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
  // Make sure Next.js knows we're explicitly using environment variables
  publicRuntimeConfig: {
    // Will be available on both server and client
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  },
};

module.exports = nextConfig;