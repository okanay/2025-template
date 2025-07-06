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

        {/* M3 Version */}
        <div className="rounded-xl border border-surface-container-highest bg-surface-container p-4 text-on-surface">
          <div className="flex items-center gap-4">
            <img
              className="h-16 w-16 rounded-full"
              src="https://randomwordgenerator.com/img/picture-generator/53e3d5424f57ab14f1dc8460962e33791c3ad6e04e507440762e7adc9049c3_640.jpg"
              alt="Kullanıcı profili"
            />
            <div>
              <h3 className="text-title-large font-semibold">Ceren Yılmaz</h3>
              <p className="text-body-medium font-medium text-on-surface-variant">@cerenyilmaz</p>
            </div>
          </div>
          <p className="mt-4 text-body-large">
            Full Stack Yazılım Mühendisi. GoLang, TanStack ve teknoloji hakkında yazıyorum.
          </p>
          <div className="mt-4 flex gap-2">
            <button className="state-layer inline-flex h-10 items-center justify-center overflow-hidden rounded-full bg-primary px-6 py-3 text-label-large font-medium tracking-wide text-on-primary transition-all duration-500 hover:before:opacity-hover focus:before:opacity-focus active:before:opacity-pressed">
              Takip Et
            </button>
            <button className="state-layer inline-flex h-10 items-center justify-center overflow-hidden rounded-full bg-secondary-container px-6 py-3 text-label-large font-medium tracking-wide text-on-secondary-container transition-all duration-500 hover:before:opacity-hover focus:before:opacity-focus active:before:opacity-pressed">
              Mesaj Gönder
            </button>
          </div>
        </div>

        {/* Tailwind Version */}
        <div className="rounded-xl border border-gray-300 bg-gray-100 p-4 text-gray-800">
          <div className="flex items-center gap-4">
            <img
              className="h-16 w-16 rounded-full"
              src="https://randomwordgenerator.com/img/picture-generator/53e3d5424f57ab14f1dc8460962e33791c3ad6e04e507440762e7adc9049c3_640.jpg"
              alt="Kullanıcı profili"
            />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Ceren Yılmaz</h3>
              <p className="text-sm font-medium text-gray-500">@cerenyilmaz</p>
            </div>
          </div>
          <p className="mt-4 text-base text-gray-700">
            Full Stack Yazılım Mühendisi. GoLang, TanStack ve teknoloji hakkında yazıyorum.
          </p>
          <div className="mt-4 flex gap-2">
            <button className="inline-flex h-10 items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none">
              Takip Et
            </button>
            <button className="inline-flex h-10 items-center justify-center rounded-full bg-gray-200 px-6 py-3 text-sm font-medium text-gray-800 transition hover:bg-gray-300 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:outline-none">
              Mesaj Gönder
            </button>
          </div>
        </div>
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

const ButtonVarians = () => {
  return (
    <>
      <div className="rounded-xl bg-surface-container p-4">
        <h3 className="font-serif text-lg font-medium text-primary">Kart Başlığı</h3>
        <p className="mt-2 text-on-surface-variant">
          Bu kart, M3 sistem rollerini kullanarak stillendirildi. İkincil metin için
          `on-surface-variant` rolü kullanıldı.
        </p>
      </div>

      <ul className="flex items-center gap-x-4">
        <button className="state-layer inline-flex h-10 items-center justify-center overflow-hidden rounded-full elevated-1 bg-surface px-6 py-3 font-medium tracking-wide text-primary transition-all duration-500 hover:elevated-2 hover:before:opacity-hover focus:before:opacity-focus active:before:opacity-pressed">
          <span className="relative z-10">Elevated</span>
        </button>

        <button className="state-layer inline-flex h-10 items-center justify-center overflow-hidden rounded-full bg-primary px-6 py-3 font-medium tracking-wide text-on-primary transition-all duration-500 hover:before:opacity-hover focus:before:opacity-focus active:before:opacity-pressed">
          <span className="relative z-10">Filled</span>
        </button>

        <button className="state-layer inline-flex h-10 items-center justify-center overflow-hidden rounded-full bg-secondary-container px-6 py-3 font-medium tracking-wide text-on-secondary-container transition-all duration-500 hover:before:opacity-hover focus:before:opacity-focus active:before:opacity-pressed">
          <span className="relative z-10">Tonal</span>
        </button>

        <button className="state-layer inline-flex h-10 items-center justify-center overflow-hidden rounded-full border border-surface-container-highest px-6 py-3 font-medium tracking-wide text-on-surface-variant transition-all duration-500 hover:before:opacity-hover focus:before:opacity-focus active:before:opacity-pressed">
          <span className="relative z-10">Outlined</span>
        </button>

        <button className="state-layer inline-flex h-10 items-center justify-center overflow-hidden rounded-full px-6 py-3 font-medium tracking-wide text-primary transition-all duration-500 hover:before:opacity-hover focus:before:opacity-focus active:before:opacity-pressed">
          <span className="relative z-10">Text</span>
        </button>
      </ul>
    </>
  )
}
