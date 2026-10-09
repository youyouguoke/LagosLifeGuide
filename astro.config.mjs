import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://lagoslifeguide.app",
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
  // PRD v1.1 §2 used /data/*; UIUX v1.3 §5.2 and the Stitch kit use /game-data/*.
  // Canonical routes are /game-data/*; /data/* redirects keep PRD-era links working.
  redirects: {
    "/data/jobs/": "/game-data/",
    "/data/housing-costs/": "/game-data/",
    "/data/skills-actions/": "/game-data/",
    "/data/locations/": "/game-data/",
  },
});
