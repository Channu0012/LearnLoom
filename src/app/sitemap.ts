import type { MetadataRoute } from "next";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { CourseDoc } from "@/lib/types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vidcura.app";
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/explore`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/quick-watch`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/create`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/takedown`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  try {
    const q = query(collection(db, "courses"), where("status", "==", "published"), limit(100));
    const snap = await getDocs(q);
    const courseRoutes: MetadataRoute.Sitemap = snap.docs.map((doc) => {
      const data = doc.data() as CourseDoc;
      const date = data.updatedAt?.toDate?.() || data.publishedAt?.toDate?.() || lastModified;
      return {
        url: `${baseUrl}/course/${doc.id}`,
        lastModified: date,
        changeFrequency: "weekly",
        priority: 0.8,
      };
    });
    return [...staticRoutes, ...courseRoutes];
  } catch {
    return staticRoutes;
  }
}
