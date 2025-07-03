import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { MotionHover } from 'src/components/motion-hover'
import { RippleButton } from 'src/components/ripple-button'
import { useLanguage } from 'src/i18n/hooks/use-language'

export const Route = createFileRoute('/$lang/')({
  component: HomePage,
})

function HomePage() {
  const { changeLanguage, language } = useLanguage()
  const { t } = useTranslation('common')

  return (
    <div className="flex min-h-screen bg-surface-container-lowest text-on-background">
      <main className="mx-auto flex max-w-7xl flex-col items-center justify-center space-y-4 p-4">
        {/* <div className="rounded-xl bg-inverse-surface p-4">
          <h3 className="font-serif text-lg font-medium text-inverse-primary">Kart Başlığı</h3>
          <p className="mt-2 text-inverse-on-surface">{t('welcome')}</p>
        </div>

        <div className="rounded-xl bg-surface-container p-4">
          <h3 className="font-serif text-lg font-medium text-primary">Kart Başlığı</h3>
          <p className="mt-2 text-on-surface-variant">
            Bu kart, M3 sistem rollerini kullanarak stillendirildi. İkincil metin için
            `on-surface-variant` rolü kullanıldı.
          </p>
        </div>

        <div className="rounded-lg bg-error-container p-4 text-on-error-container">
          <p className="font-medium">Bir hata oluştu!</p>
          <p>Lütfen bilgilerinizi kontrol edip tekrar deneyin.</p>
        </div> */}

        <MotionHover />

        {/* <div className="flex items-start justify-start gap-4">
          <button
            onClick={() => changeLanguage('fr')}
            className="elevation-0 relative overflow-hidden rounded-full bg-primary-container px-6 py-3 font-medium text-on-primary-container after:absolute after:inset-0 after:bg-on-primary-container after:opacity-0 after:transition-opacity after:duration-300 after:content-[''] hover:after:opacity-hover focus-visible:after:opacity-focus"
          >
            Fransızca
          </button>

          <RippleButton
            className="relative overflow-hidden rounded-full border border-outline-variant elevated-0 bg-surface-container px-6 py-3 font-medium text-on-surface-variant after:absolute after:inset-0 after:bg-on-surface after:opacity-0 after:transition-opacity after:duration-300 after:content-[''] hover:after:opacity-hover focus-visible:after:opacity-focus"
            onClick={() => changeLanguage('en')}
          >
            English
          </RippleButton>
          <RippleButton
            className="elevation-0 relative overflow-hidden rounded-full bg-tertiary-container px-6 py-3 font-medium text-on-tertiary-container after:absolute after:inset-0 after:bg-on-tertiary-container after:opacity-0 after:transition-opacity after:duration-300 after:content-[''] hover:after:opacity-hover focus-visible:after:opacity-focus"
            onClick={() => changeLanguage('tr')}
          >
            Türkçe
          </RippleButton>
        </div> */}
      </main>
    </div>
  )
}
