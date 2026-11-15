import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.1.3'], // Permite el acceso desde tu IP
};

export default nextConfig;