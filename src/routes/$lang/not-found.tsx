import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Link } from 'src/i18n/link'

export const CustomNotFoundPage = () => {
  const { t } = useTranslation('not-found')

  return (
    <main className="flex min-h-screen items-center justify-center bg-background text-on-background">
      <div className="mx-auto flex max-w-7xl flex-col items-center bg-surface p-6 text-center">
        <h1 className="mb-4 text-7xl font-extrabold text-primary">404</h1>
        <p className="text-3xl font-semibold text-on-surface">{t('title')}</p>
        <p className="mt-2 mb-6 text-xl font-semibold text-on-surface-variant">
          {t('description')}
        </p>
        <Link
          to="/$lang"
          className={`state-layer inline-flex h-16 w-32 items-center justify-center overflow-hidden rounded-full bg-secondary-container text-lg font-medium tracking-wide text-on-secondary-container transition-transform duration-500 hover:before:opacity-hover focus:before:opacity-focus active:scale-95 active:before:opacity-pressed`}
        >
          {t('return-link')}
        </Link>
      </div>
    </main>
  )
}

export const Route = createFileRoute('/$lang/not-found')({
  component: CustomNotFoundPage,
})
