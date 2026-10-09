import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://veyskill.in";
  return {
    rules: [
      {
        userAgent: "Googlebot",
        allow: [
          "/",
          "/_next/static/",
          "/_next/image/",
          "/images/",
          "/videos/",
          "/icon.png",
          "/logo.png",
        ],
        disallow: [
          "/admin",
          "/admin/",
          "/my-courses",
          "/my-courses/",
          "/my-learning",
          "/my-learning/",
          "/edit/",
          "/api/payment/",
          "/api/ai/",
        ],
      },
      {
        userAgent: "Googlebot-Mobile",
        allow: [
          "/",
          "/_next/static/",
          "/_next/image/",
          "/images/",
          "/videos/",
          "/icon.png",
          "/logo.png",
        ],
        disallow: [
          "/admin",
          "/admin/",
          "/my-courses",
          "/my-courses/",
          "/my-learning",
          "/my-learning/",
          "/edit/",
          "/api/payment/",
          "/api/ai/",
        ],
      },
      {
        userAgent: "*",
        allow: [
          "/",
          "/_next/static/",
          "/_next/image/",
          "/images/",
          "/videos/",
          "/icon.png",
          "/logo.png",
        ],
        disallow: [
          "/admin",
          "/admin/",
          "/my-courses",
          "/my-courses/",
          "/my-learning",
          "/my-learning/",
          "/edit/",
          "/api/payment/",
          "/api/ai/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
