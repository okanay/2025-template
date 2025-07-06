import { createFileRoute } from '@tanstack/react-router'

import { useTheme } from 'src/store/theme'

export const Route = createFileRoute('/$lang/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="flex min-h-screen bg-surface text-on-background">
      <main className="mx-auto flex max-w-7xl flex-col items-center justify-center space-y-4 p-4">
        <SetTheme />

        <div className="rounded-4xl border border-surface-container bg-surface-container px-8 py-4 text-on-surface">
          <div className="flex items-center gap-4">
            <img
              className="h-16 w-16 rounded-full"
              src="https://randomuser.me/api/portraits/men/52.jpg"
              alt="dummy-image"
            />
            <div>
              <h3 className="text-title-large font-semibold text-on-surface-variant">Okan Ay</h3>
              <p className="text-label-medium dark:text-primary">Software Engineer</p>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button className="btn-state-layer inline-flex items-center justify-center overflow-hidden rounded-full bg-primary-container px-6 py-3 text-label-large text-on-primary-container">
              Takip Et
            </button>
            <button className="btn-state-layer inline-flex items-center justify-center overflow-hidden rounded-full px-6 py-3 text-label-large text-on-primary-container">
              Mesaj Gönder
            </button>
          </div>
        </div>

        <ButtonVarians />
      </main>
    </div>
  )
}

const SetTheme = () => {
  const { setTheme, theme } = useTheme()

  return (
    <ul className="flex items-center gap-x-4">
      <button
        className={`btn-state-layer inline-flex h-10 items-center justify-center rounded-full px-6 py-3 font-medium tracking-wide ${
          theme === 'dark'
            ? 'bg-primary-container text-on-primary-container'
            : 'bg-surface-container text-on-primary-container'
        }`}
        onClick={() => setTheme('dark')}
      >
        <span className="relative z-10">Dark</span>
      </button>

      <button
        className={`btn-state-layer inline-flex h-10 items-center justify-center rounded-full px-6 py-3 font-medium tracking-wide ${
          theme === 'light'
            ? 'bg-primary-container text-on-primary-container'
            : 'bg-surface-container text-on-primary-container'
        }`}
        onClick={() => setTheme('light')}
      >
        <span className="relative z-10">Light</span>
      </button>

      <button
        className={`btn-state-layer inline-flex h-10 items-center justify-center rounded-full px-6 py-3 font-medium tracking-wide ${
          theme === 'system'
            ? 'bg-primary-container text-on-primary-container'
            : 'bg-surface-container text-on-primary-container'
        }`}
        onClick={() => setTheme('system')}
      >
        <span className="relative z-10">System</span>
      </button>
    </ul>
  )
}

const ButtonVarians = () => {
  return (
    <ul className="flex items-center gap-x-4">
      <button className="btn-state-layer inline-flex h-10 items-center justify-center rounded-full bg-surface elevated-1 px-6 py-3 font-medium tracking-wide text-primary">
        <span className="relative z-10">Elevated</span>
      </button>

      <button className="btn-state-layer inline-flex h-10 items-center justify-center rounded-full bg-primary px-6 py-3 font-medium tracking-wide text-on-primary">
        <span className="relative z-10">Filled</span>
      </button>

      <button className="btn-state-layer inline-flex h-10 items-center justify-center rounded-full bg-secondary-container px-6 py-3 font-medium tracking-wide text-on-secondary-container">
        <span className="relative z-10">Tonal</span>
      </button>

      <button className="btn-state-layer inline-flex h-10 items-center justify-center rounded-full border border-surface-container-highest px-6 py-3 font-medium tracking-wide text-on-surface-variant">
        <span className="relative z-10">Outlined</span>
      </button>

      <button className="btn-state-layer inline-flex h-10 items-center justify-center rounded-full px-6 py-3 font-medium tracking-wide text-primary">
        <span className="relative z-10">Text</span>
      </button>
    </ul>
  )
}
