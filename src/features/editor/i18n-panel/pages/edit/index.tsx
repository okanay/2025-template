import { Route } from 'src/routes/$lang/_auth/editor.i18n.edit'
import { ArrowLeft, Save, SparklesIcon } from 'lucide-react'
import { useEffect } from 'react'
import { I18nInputMode } from './components/input-mode'
import { I18nJsonEditor } from './components/json-mode'
import { ModeButton } from './components/mode-button'
import type { AllMetaTypes, I18nPayload } from 'src/messages/schema'
import { useI18nPanel } from './store'
import { useNavigate } from '@tanstack/react-router'

export function EditFile() {
  const search = Route.useSearch()
  const navigate = useNavigate()

  const {
    // Data
    fileData,
    i18nData,

    // UI State
    viewMode,
    isZen,

    // API State
    isLoading,
    isSaving,
    error,

    // Actions
    loadFile,
    saveFile,
    setViewMode,
    setZenMode,
  } = useI18nPanel()

  // Load file on mount or when search params change
  useEffect(() => {
    loadFile(search.lang, search.ns)
  }, [search.lang, search.ns, loadFile])

  const handleSave = async () => {
    try {
      await saveFile(search.lang, search.ns)
    } catch (err) {}
  }

  const handleGoBack = () =>
    navigate({
      to: '/$lang/editor/i18n/select',
      params: {
        lang: 'tr',
      },
    })

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="text-body-large text-on-surface-variant">Dosya yükleniyor...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="mx-auto max-w-md p-6 text-center">
          <p className="mb-4 text-body-large text-error">{error}</p>
          <button
            aria-label="Geri Dön"
            onClick={handleGoBack}
            className="btn-state-layer rounded-full bg-primary-container px-6 py-2 text-label-large text-on-primary-container"
          >
            Geri Dön
          </button>
        </div>
      </div>
    )
  }

  const rootFieldKeys = Object.keys(i18nData).filter(
    (key) => !key.startsWith('_') && key !== '_meta',
  )

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6" data-zen-mode={isZen}>
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <button
              aria-label="Geri Dön"
              onClick={handleGoBack}
              className="btn-state-layer rounded-full p-2 text-on-surface-variant hover:bg-surface-container"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-headline-small text-on-background">
                {search.lang}/{search.ns}.json
              </h1>
              <p className="text-body-medium text-on-surface-variant">
                Branch: {fileData?.branch || 'main'}
              </p>
            </div>
          </div>

          <div className="flex w-full flex-shrink-0 items-center gap-2 sm:w-auto">
            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn-state-layer inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-label-large text-on-primary"
            >
              <Save size={16} />
              {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>

            {/* View Mode Selector */}
            <div className="flex items-center rounded-full border border-outline/30 bg-surface-container p-1">
              <ModeButton
                isActive={viewMode === 'ui'}
                onClick={() => setViewMode('ui')}
                label="UI"
              />
              <ModeButton
                isActive={viewMode === 'json'}
                onClick={() => setViewMode('json')}
                label="JSON"
              />
            </div>

            {/* Zen Mode Toggle */}
            <button
              onClick={() => setZenMode(!isZen)}
              title="Zen Modu Aç/Kapat"
              className={`btn-state-layer flex items-center gap-2 rounded-full border border-outline/30 px-3 py-1.5 transition-colors ${
                isZen
                  ? 'bg-tertiary-container text-on-tertiary-container'
                  : 'bg-surface-container text-on-surface-variant'
              }`}
            >
              <SparklesIcon size={16} />
              <span className="text-label-large">Zen</span>
            </button>
          </div>
        </header>

        <main className="flex flex-col gap-4">
          {/* JSON Editor */}
          <div className={viewMode === 'json' ? 'flex flex-col gap-4' : 'hidden'}>
            <I18nJsonEditor />
          </div>

          {/* UI Editor */}
          <div className={viewMode === 'ui' ? 'flex flex-col' : 'hidden'}>
            {rootFieldKeys.map((fieldKey) => (
              <I18nInputMode
                key={fieldKey}
                path={[fieldKey]}
                fieldValue={i18nData[fieldKey]}
                fieldMeta={i18nData[`_${fieldKey}`] as AllMetaTypes}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
