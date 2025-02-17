import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/**",
        search: ""
      },
      {
        protocol: "https",
        hostname: "xpr-swap.achu.best",
        port: "",
        pathname: "/**"
      }
    ]
  }
};

export default nextConfig;
