import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { copyFileSync } from "node:fs";

// Serve the flat URL list at the conventional /sitemap.xml path (real file, not a redirect,
// and not a sitemapindex wrapper — crawlers/GSC get the urlset directly).
const sitemapXmlAlias = {
  name: "sitemap-xml-alias",
  hooks: {
    "astro:build:done": ({ dir }) => {
      copyFileSync(new URL("sitemap-0.xml", dir), new URL("sitemap.xml", dir));
    },
  },
};

// Round 5 (P1): lastmod per URL, updated only when content actually changes.
// Default record pages: last full data extraction 2026-10-09.
const LASTMOD_BY_PREFIX = [
  ["/play/", "2026-10-22"],
  ["/login-help/", "2026-10-22"],
  ["/app/", "2026-10-22"],
  ["/download/", "2026-10-22"],
  ["/hack/", "2026-10-22"],
  ["/actions/", "2026-10-22"],
  ["/updates/", "2026-10-22"],
  ["/locations/", "2026-10-22"],
  ["/game-data/locations/", "2026-10-22"],
  ["/game-data/skills-actions/", "2026-10-22"],
  ["/locations/", "2026-10-22"],
];

function lastmodFor(url) {
  for (const [prefix, date] of LASTMOD_BY_PREFIX) {
    if (url.startsWith(`https://lagoslifeguide.app${prefix}`)) return date;
  }
  return "2026-10-09"; // record pages: last full extraction date
}

// https://astro.build/config
export default defineConfig({
  site: "https://lagoslifeguide.app",
  integrations: [
    sitemap({
      serialize(item) {
        item.lastmod = lastmodFor(item.url);
        return item;
      },
    }),
    sitemapXmlAlias,
  ],
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
