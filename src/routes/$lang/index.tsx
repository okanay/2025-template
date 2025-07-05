import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'src/store/theme'

export const Route = createFileRoute('/$lang/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="flex min-h-screen bg-surface text-on-background">
      <main className="mx-auto flex max-w-7xl flex-col items-center justify-center space-y-4 p-4">
        <div className="rounded-xl bg-inverse-surface p-4">
          <h3 className="font-serif text-lg font-medium text-inverse-primary">Kart Başlığı</h3>
          <p className="mt-2 text-inverse-on-surface">Merhaba</p>
        </div>

        <div className="rounded-xl bg-surface-container p-4">
          <h3 className="font-serif text-lg font-medium text-primary">Kart Başlığı</h3>
          <p className="mt-2 text-on-surface-variant">
            Bu kart, M3 sistem rollerini kullanarak stillendirildi. İkincil metin için
            `on-surface-variant` rolü kullanıldı.
          </p>
        </div>

        <ul className="flex items-center gap-x-4">
          <button
            className={`state-layer inline-flex h-10 items-center justify-center overflow-hidden rounded-full elevated-1 bg-surface px-6 py-3 font-medium tracking-wide text-primary transition-all duration-500 hover:elevated-2 hover:before:opacity-hover focus:before:opacity-focus active:before:opacity-pressed`}
          >
            <span className="relative z-10">Elevated</span>
          </button>

          <button
            className={`state-layer inline-flex h-10 items-center justify-center overflow-hidden rounded-full bg-primary px-6 py-3 font-medium tracking-wide text-on-primary transition-all duration-500 hover:before:opacity-hover focus:before:opacity-focus active:before:opacity-pressed`}
          >
            <span className="relative z-10">Filled</span>
          </button>

          <button
            className={`state-layer inline-flex h-10 items-center justify-center overflow-hidden rounded-full bg-secondary-container px-6 py-3 font-medium tracking-wide text-on-secondary-container transition-all duration-500 hover:before:opacity-hover focus:before:opacity-focus active:before:opacity-pressed`}
          >
            <span className="relative z-10">Tonal</span>
          </button>

          <button
            className={`state-layer inline-flex h-10 items-center justify-center overflow-hidden rounded-full border border-surface-container-highest px-6 py-3 font-medium tracking-wide text-on-surface-variant transition-all duration-500 hover:before:opacity-hover focus:before:opacity-focus active:before:opacity-pressed`}
          >
            <span className="relative z-10">Outlined</span>
          </button>

          <button
            className={`state-layer inline-flex h-10 items-center justify-center overflow-hidden rounded-full px-6 py-3 font-medium tracking-wide text-primary transition-all duration-500 hover:before:opacity-hover focus:before:opacity-focus active:before:opacity-pressed`}
          >
            <span className="relative z-10">Text</span>
          </button>
        </ul>

        <SetTheme />
      </main>
    </div>
  )
}

const SetTheme = () => {
  const { setTheme, theme } = useTheme()

  return (
    <ul className="flex items-center gap-x-4">
      <button
        className={`state-layer inline-flex h-10 items-center justify-center overflow-hidden rounded-full px-6 py-3 font-medium tracking-wide transition-all duration-500 ${
          theme === 'dark'
            ? 'bg-primary text-on-primary'
            : 'bg-surface text-primary hover:before:opacity-hover focus:before:opacity-focus active:before:opacity-pressed'
        }`}
        onClick={() => setTheme('dark')}
      >
        <span className="relative z-10">Dark</span>
      </button>

      <button
        className={`state-layer inline-flex h-10 items-center justify-center overflow-hidden rounded-full px-6 py-3 font-medium tracking-wide transition-all duration-500 ${
          theme === 'light'
            ? 'bg-primary text-on-primary'
            : 'bg-surface text-primary hover:before:opacity-hover focus:before:opacity-focus active:before:opacity-pressed'
        }`}
        onClick={() => setTheme('light')}
      >
        <span className="relative z-10">Light</span>
      </button>

      <button
        className={`state-layer inline-flex h-10 items-center justify-center overflow-hidden rounded-full px-6 py-3 font-medium tracking-wide transition-all duration-500 ${
          theme === 'system'
            ? 'bg-primary text-on-primary'
            : 'bg-surface text-primary hover:before:opacity-hover focus:before:opacity-focus active:before:opacity-pressed'
        }`}
        onClick={() => setTheme('system')}
      >
        <span className="relative z-10">System</span>
      </button>
    </ul>
  )
}
