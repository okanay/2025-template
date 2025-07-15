import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Link } from 'src/i18n/link'

export const CustomErrorPage = () => {
  const { t } = useTranslation('globals')

  return (
    <main className="flex min-h-screen items-center justify-center bg-background text-on-background">
      <div className="mx-auto flex max-w-7xl flex-col items-center bg-surface p-6 text-center">
        <h1 className="mb-4 text-7xl font-extrabold text-primary">500</h1>
        <p className="text-3xl font-semibold text-on-surface">{t('error.title')}</p>
        <p className="mt-2 mb-6 max-w-2xl text-xl font-semibold text-balance text-on-surface-variant">
          {t('error.description')}
        </p>
        <Link
          to="/"
          className={`btn-state-layer inline-flex h-16 items-center justify-center overflow-hidden rounded-full bg-secondary-container px-8 text-lg font-medium tracking-wide text-on-secondary-container transition-transform duration-500 hover:before:opacity-hover focus:before:opacity-focus active:before:opacity-pressed`}
        >
          {t('error.return-link')}
        </Link>
      </div>
    </main>
  )
}

export const Route = createFileRoute('/$lang/error')({
  staleTime: 0,
  gcTime: 0,
  component: CustomErrorPage,
  head: () => {
    return {
      links: [
        {
          rel: 'preload',
          as: 'font',
          type: 'font/woff2',
          crossOrigin: 'anonymous',
          href: `/fonts/custom-sans/semibold.woff2`,
        },
        {
          rel: 'preload',
          as: 'font',
          type: 'font/woff2',
          crossOrigin: 'anonymous',
          href: `/fonts/custom-sans/extra-bold.woff2`,
        },
      ],
    }
  },
})
