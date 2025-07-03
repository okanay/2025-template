// app/routes/sitemap[.]xml.tsx
import { createServerFileRoute } from "@tanstack/react-start/server";

export const ServerRoute = createServerFileRoute("/sitemap.xml").methods({
  GET: async () => {
    const isDevelopment = process.env.NODE_ENV !== "production";
    const baseUrl = getBaseUrl();

    const staticPages: SitemapUrl[] = [
      {
        url: "/",
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1.0,
      },
    ];

    const sitemapConfig: SitemapResponse = {
      urls: staticPages,
      host: baseUrl,
    };

    const sitemapXml = generateSitemapXml(sitemapConfig, baseUrl);

    return new Response(sitemapXml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": getCacheControl(isDevelopment),
        "Content-Disposition": "inline",
      },
    });
  },
});

// Helper functions
function normalizeUrl(url: string, baseUrl: string): string {
  const cleanBaseUrl = baseUrl.replace(/\/$/, "");
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  return `${cleanBaseUrl}${cleanUrl}`;
}

function formatDate(date: Date | string | undefined): string {
  if (!date) return new Date().toISOString();

  if (typeof date === "string") {
    // Eğer string zaten ISO format'taysa direkt döndür
    if (date.includes("T") || date.includes("Z")) return date;
    // Eğer sadece tarih formatındaysa Date'e çevir
    return new Date(date).toISOString();
  }

  return date.toISOString();
}

function generateSitemapXml(config: SitemapResponse, baseUrl: string): string {
  const lines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
  ];

  config.urls.forEach((urlConfig) => {
    lines.push("  <url>");
    lines.push(`    <loc>${normalizeUrl(urlConfig.url, baseUrl)}</loc>`);

    if (urlConfig.lastModified) {
      lines.push(
        `    <lastmod>${formatDate(urlConfig.lastModified)}</lastmod>`,
      );
    }

    if (urlConfig.changeFrequency) {
      lines.push(`    <changefreq>${urlConfig.changeFrequency}</changefreq>`);
    }

    if (urlConfig.priority !== undefined) {
      lines.push(`    <priority>${urlConfig.priority.toFixed(1)}</priority>`);
    }

    // Add alternate language links
    if (urlConfig.alternates?.languages) {
      Object.entries(urlConfig.alternates.languages).forEach(([lang, href]) => {
        lines.push(
          `    <xhtml:link rel="alternate" hreflang="${lang}" href="${href}" />`,
        );
      });
    }

    lines.push("  </url>");
  });

  lines.push("</urlset>");
  return lines.join("\n");
}

function getBaseUrl(): string {
  return (
    process.env.VITE_APP_CANONICAL_URL ||
    process.env.VITE_APP_FRONTEND_URL ||
    process.env.VERCEL_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

function getCacheControl(isDev: boolean): string {
  return isDev
    ? "no-cache, no-store, must-revalidate"
    : "public, max-age=1800, s-maxage=1800, stale-while-revalidate=1800";
}

// Types
interface SitemapUrl {
  url: string;
  lastModified?: Date | string;
  changeFrequency?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority?: number;
  alternates?: {
    languages?: { [key: string]: string };
    media?: { [key: string]: string };
  };
}

interface SitemapResponse {
  urls: SitemapUrl[];
  host?: string;
}

export type { SitemapUrl, SitemapResponse };
