import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "VeySkill — Structured Learning & Verified Credentials",
    short_name: "VeySkill",
    description:
      "Transform video playlists into distraction-free masterclasses with interactive notes, quizzes, and cryptographic certificates of completion.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0d9488",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/favicon.png",
        sizes: "48x48",
        type: "image/png",
      },
    ],
  };
}
