import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // Pages consolidated during the restructure. Kept as 301s so any stray
    // links land somewhere sensible.
    return [
      { source: "/solutions", destination: "/services", permanent: true },
      { source: "/technology-delivery", destination: "/services", permanent: true },
      { source: "/attorney-intake", destination: "/contact", permanent: true },
    ];
  },
};

export default nextConfig;
