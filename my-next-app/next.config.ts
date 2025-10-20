import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Видаляємо rewrites, бо API вже є в Next.js
  // async rewrites() {
  //   return [
  //     {
  //       source: "/api/v1/:path*",
  //       destination: "http://localhost:3001/api/v1/:path*",
  //     },
  //   ];
  // },
  async headers() {
    return [
      {
        source: "/api/v1/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Credentials",
            value: "true",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "http://localhost:3001",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },
  experimental: {
    turbo: {
      root: __dirname,
    },
  },
};

export default nextConfig;
