import { createRootRoute, HeadContent, Outlet, redirect, Scripts } from '@tanstack/react-router'
import { type ReactNode } from 'react'
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from 'src/i18n/config'
import { getPreferedLanguage } from 'src/i18n/get-language'
import LanguageProvider from 'src/i18n/prodiver'
import { AppProviders } from 'src/providers'
import { getPreferedTheme, ThemeStore } from 'src/store/theme'
import globals from '../styles/globals.css?url'

export const Route = createRootRoute({
  beforeLoad: async (ctx) => {
    const pathSegments = ctx.location.pathname.split('/').filter(Boolean)
    const [languageSegment] = pathSegments

    const isStaticAsset =
      /\.(ico|png|jpg|jpeg|svg|webp|css|js|woff2?|ttf|eot|map|xml|webmanifest)$/i
    if (isStaticAsset.test(ctx.location.pathname)) {
      return
    }

    const matchedLanguage = SUPPORTED_LANGUAGES.find(({ value }) => value === languageSegment)

    if (matchedLanguage) {
      return { langSegment: languageSegment, currentLanguage: matchedLanguage }
    }

    const preferredLanguage = await getPreferedLanguage()
    throw redirect({
      href: `/${preferredLanguage.value}`,
      statusCode: 302,
    })
  },
  loader: async (loader) => {
    const language = loader.context?.currentLanguage || DEFAULT_LANGUAGE
    const theme = await getPreferedTheme()

    return { language, theme }
  },
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'TanStack Start Starter',
      },
    ],
    links: [
      {
        rel: 'preload stylesheet',
        as: 'style',
        type: 'text/css',
        crossOrigin: 'anonymous',
        href: globals,
      },
      {
        rel: 'icon',
        href: '/favicon.ico',
      },
      {
        rel: 'manifest',
        href: '/site.webmanifest',
        color: '#ffffff',
      },
      {
        rel: 'sitemap',
        type: 'application/xml',
        title: 'sitemap',
        href: `/api/sitemap`,
      },
      {
        rel: 'preload',
        as: 'image',
        type: 'image/svg+xml',
        href: `/images/brand.svg`,
      },
      {
        rel: 'preload',
        as: 'font',
        type: 'font/woff2',
        crossOrigin: 'anonymous',
        href: `/fonts/custom-sans/regular.woff2`,
      },
      {
        rel: 'preload',
        as: 'font',
        type: 'font/woff2',
        crossOrigin: 'anonymous',
        href: `/fonts/custom-sans/medium.woff2`,
      },
    ],
  }),

  component: RootComponent,
})

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  const { language, theme } = Route.useLoaderData()

  return (
    <html lang={language.locale} dir={language.direction} className={theme}>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

function RootComponent() {
  const { language, theme } = Route.useLoaderData()

  return (
    <RootDocument>
      <ThemeStore initialTheme={theme}>
        <LanguageProvider serverLanguage={language}>
          <AppProviders>
            <Outlet />
          </AppProviders>
        </LanguageProvider>
      </ThemeStore>
    </RootDocument>
  )
}
