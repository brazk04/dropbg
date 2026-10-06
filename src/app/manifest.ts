import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DropBG", short_name: "DropBG", description: SITE_DESCRIPTION,
    lang: "pt-BR", start_url: "/", display: "browser",
    background_color: "#ffffff", theme_color: "#163b65",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
