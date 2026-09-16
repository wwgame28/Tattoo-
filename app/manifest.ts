import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FrameGuide — умная камера",
    short_name: "FrameGuide",
    description: "Композиция, свет, резкость и AI-оценка кадра",
    start_url: "/camera",
    display: "standalone",
    background_color: "#080a0d",
    theme_color: "#080a0d",
    orientation: "portrait",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
