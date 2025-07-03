import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
  redirect,
} from "@tanstack/react-router";
import { type ReactNode } from "react";
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from "src/i18n/config";
import { getPreferedLanguage } from "src/i18n/get-language";
import LanguageProvider from "src/i18n/prodiver";
import globals from "../styles/globals.css?url";
import { AppProviders } from "src/providers";

export const Route = createRootRoute({
  beforeLoad: async (ctx) => {
    const segments = ctx.location.pathname.split("/").filter(Boolean);
    const [langSegment] = segments;

    const staticAssetPattern =
      /\.(ico|png|jpg|jpeg|svg|webp|css|js|woff2?|ttf|eot|map|xml|webmanifest)$/i;
    if (staticAssetPattern.test(ctx.location.pathname)) {
      return;
    }

    const currentLanguage = SUPPORTED_LANGUAGES.find(
      ({ value }) => value === langSegment,
    );

    if (currentLanguage) {
      return { langSegment, currentLanguage };
    }

    const preferedLanguage = await getPreferedLanguage();
    throw redirect({
      href: `/${preferedLanguage.value}`,
      statusCode: 302,
    });
  },
  loader: async ({ context }) => {
    const language = context?.currentLanguage || DEFAULT_LANGUAGE;
    return { language };
  },
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "TanStack Start Starter",
      },
    ],
    links: [
      {
        rel: "preload stylesheet",
        as: "style",
        type: "text/css",
        crossOrigin: "anonymous",
        href: globals,
      },
      {
        rel: "icon",
        href: "/favicon.ico",
      },
      {
        rel: "manifest",
        href: "/site.webmanifest",
        color: "#ffffff",
      },
      {
        rel: "sitemap",
        type: "application/xml",
        title: "sitemap",
        href: `/api/sitemap`,
      },
      {
        rel: "preload",
        as: "image",
        type: "image/svg+xml",
        href: `/images/brand.svg`,
      },
      {
        rel: "preload",
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
        href: `/fonts/custom-sans/regular.woff2`,
      },
      {
        rel: "preload",
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
        href: `/fonts/custom-sans/medium.woff2`,
      },
    ],
  }),
  component: RootComponent,
});

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  const { language } = Route.useLoaderData();

  return (
    <html lang={language.locale} dir={language.direction}>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { language } = Route.useLoaderData();

  return (
    <RootDocument>
      <LanguageProvider serverLanguage={language}>
        <AppProviders>
          <Outlet />
        </AppProviders>
      </LanguageProvider>
    </RootDocument>
  );
}
