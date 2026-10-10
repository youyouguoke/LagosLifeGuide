import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { copyFileSync } from "node:fs";

// Serve the URL index at the conventional /sitemap.xml path (real file, not a redirect).
const sitemapXmlAlias = {
  name: "sitemap-xml-alias",
  hooks: {
    "astro:build:done": ({ dir }) => {
      copyFileSync(new URL("sitemap-index.xml", dir), new URL("sitemap.xml", dir));
    },
  },
};

// https://astro.build/config
export default defineConfig({
  site: "https://lagoslifeguide.app",
  integrations: [sitemap(), sitemapXmlAlias],
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
