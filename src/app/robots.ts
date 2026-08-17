import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard/", "/records/"],
    },
    sitemap: "https://www.mineraltrack.shop/sitemap.xml",
    host: "https://www.mineraltrack.shop",
  };
}
