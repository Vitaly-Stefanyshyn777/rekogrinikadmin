/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3002",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "rekogrinikfrontbeck-production-a699.up.railway.app",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
