import type { NextConfig } from "next";
import path from "path";


const cspHeader = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://*.googleapis.com https://*.google.com https://*.gstatic.com https://eauthenticate.saudibusiness.gov.sa`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https://maps.googleapis.com https://maps.gstatic.com https://*.googleapis.com https://*.gstatic.com https://*.google.com https://*.googleusercontent.com https://res.cloudinary.com https://i.ibb.co https://ibb.co https://eauthenticate.saudibusiness.gov.sa https://burj-phone-backend.vercel.app",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://maps.googleapis.com https://*.googleapis.com https://*.google.com https://*.gstatic.com https://nominatim.openstreetmap.org https://res.cloudinary.com https://eauthenticate.saudibusiness.gov.sa https://burj-phone-backend.vercel.app http://localhost:5000",
  "frame-src 'self' https://www.google.com https://maps.google.com",
  "frame-ancestors 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
          { key: "Content-Security-Policy", value: cspHeader },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
          { key: "Cross-Origin-Resource-Policy", value: "cross-origin" },
        ],
      },
    ];
  },
  turbopack: {
    resolveAlias: {
      tailwindcss: path.resolve(__dirname, "node_modules/tailwindcss"),
    },
  },
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/sitemap.xml", destination: "/sitemap.xml" },
        { source: "/robots.txt", destination: "/robots.txt" },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "burj-almubdia.com",
          },
        ],
        destination: "https://burjjstorre.com/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.burj-almubdia.com",
          },
        ],
        destination: "https://burjjstorre.com/:path*",
        permanent: true,
      },
    ];
  },
  images: {
    minimumCacheTTL: 31536000,
    deviceSizes: [640, 750, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    qualities: [75],
    formats: ["image/webp"],
    remotePatterns: [
      { hostname: "ibb.co" },
      { hostname: "i.ibb.co" },
      { protocol: "https", hostname: "burjjstorre.com" },
      { protocol: "https", hostname: "burj-phone-backend.vercel.app", pathname: "/**" },
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
      { protocol: "http", hostname: "localhost", port: "5000", pathname: "/**" },
    ],
  },
};

export default nextConfig;
