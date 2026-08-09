import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // Prevent browser-only packages (jspdf, canvg) from being
  // bundled by the server / Node.js runtime.
  serverExternalPackages: ["jspdf", "canvg", "@babel/runtime"],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Treat these as externals so Node never tries to bundle them
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : []),
        "jspdf",
        "canvg",
      ];
    }
    return config;
  },
};

export default nextConfig;
