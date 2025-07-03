// app/routes/robots[.]txt.tsx
import { createServerFileRoute } from "@tanstack/react-start/server";

// Types
interface RobotRule {
  userAgent: string | string[];
  allow?: string | string[];
  disallow?: string | string[];
  crawlDelay?: number;
}

interface RobotsResponse {
  rules: RobotRule[];
  sitemap?: string | string[];
  host?: string;
}

// Main route
export const ServerRoute = createServerFileRoute("/robots.txt").methods({
  GET: async () => {
    const isDevelopment = process.env.NODE_ENV !== "production";
    const baseUrl = getBaseUrl();

    const robotsConfig: RobotsResponse = {
      rules: [
        {
          userAgent: "Googlebot",
          allow: "/",
          disallow: ["/admin/", "/api/auth/", "/private/"],
        },
        {
          userAgent: "Googlebot-Image",
          allow: ["/images/", "/assets/"],
          disallow: "/private/",
        },
        {
          userAgent: ["Bingbot", "Slurp"],
          allow: "/",
          disallow: ["/admin/", "/api/"],
          crawlDelay: 1,
        },
        {
          userAgent: ["SemrushBot", "AhrefsBot", "MJ12bot"],
          disallow: "/",
        },
        {
          userAgent: "*",
          allow: "/",
          disallow: isDevelopment
            ? "/"
            : ["/admin/", "/api/auth/", "/private/"],
        },
      ],
      sitemap: `${baseUrl}/sitemap.xml`,
      host: isDevelopment
        ? undefined
        : baseUrl.replace("https://", "").replace("http://", ""),
    };

    const robotsContent = formatRobotsContent(robotsConfig);

    return new Response(robotsContent, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": getCacheControl(isDevelopment),
      },
    });
  },
});

// Helper functions
function normalizeToArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function formatRobotsContent(config: RobotsResponse): string {
  const lines: string[] = [];

  // Add host if specified
  if (config.host) {
    lines.push(`Host: ${config.host}`);
    lines.push("");
  }

  // Add rules
  config.rules.forEach((rule) => {
    const userAgents = normalizeToArray(rule.userAgent);

    userAgents.forEach((agent) => {
      lines.push(`User-agent: ${agent}`);

      // Add allows first
      normalizeToArray(rule.allow).forEach((path) => {
        lines.push(`Allow: ${path}`);
      });

      // Add disallows
      normalizeToArray(rule.disallow).forEach((path) => {
        lines.push(`Disallow: ${path}`);
      });

      // Add crawl delay
      if (rule.crawlDelay) {
        lines.push(`Crawl-delay: ${rule.crawlDelay}`);
      }

      lines.push(""); // Empty line after each rule
    });
  });

  // Add sitemaps
  normalizeToArray(config.sitemap).forEach((sitemap) => {
    lines.push(`Sitemap: ${sitemap}`);
  });

  return lines.join("\n").trim();
}

function getBaseUrl(): string {
  return (
    process.env.VITE_APP_FRONTEND_URL ||
    process.env.VERCEL_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

function getCacheControl(isDev: boolean): string {
  return isDev
    ? "no-cache, no-store, must-revalidate"
    : "public, max-age=14400, s-maxage=86400, stale-while-revalidate=43200";
}

export type { RobotRule, RobotsResponse };
