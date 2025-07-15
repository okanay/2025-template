import { SparklesIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { AllMetaTypes, I18nPayload } from 'src/messages/schema'
import { I18nInputMode } from './components/input-mode'
import { stripMetaRecursively, I18nJsonEditor } from './components/json-mode'
import { ModeButton } from './components/mode-button'

import globals from 'src/messages/en/globals.json'

export function EditFile() {
  const [i18nData, setI18nData] = useState<I18nPayload>(globals as any)

  const [viewMode, setViewMode] = useState<'ui' | 'json'>('ui')
  const [isZen, setIsZen] = useState<boolean>(true)

  const [jsonEditText, setJsonEditText] = useState(() => JSON.stringify(globals, null, 2))
  const [jsonError, setJsonError] = useState<string | null>(null)

  // Ana veri veya mod değiştiğinde JSON editörünü senkronize et
  useEffect(() => {
    // Sadece JSON modunda değilken senkronize et, kullanıcının yazdıklarını ezmemek için
    if (viewMode !== 'json') {
      const fullJson = JSON.stringify(i18nData, null, 2)
      setJsonEditText(fullJson)
    }
  }, [i18nData, viewMode])

  const handleUpdate = (path: (string | number)[], newValue: any) => {
    setI18nData((currentData) => {
      const newData = JSON.parse(JSON.stringify(currentData))
      let currentLevel: any = newData
      for (let i = 0; i < path.length - 1; i++) {
        currentLevel = currentLevel[path[i]]
      }
      currentLevel[path[path.length - 1]] = newValue
      return newData
    })
  }

  const handleJsonSave = () => {
    try {
      // Zen modunda iken, kullanıcı sadece metinleri görür ama kaydettiği şey
      // meta verileriyle birleştirilmiş tam datadır.
      const fullDataObject = JSON.parse(JSON.stringify(i18nData))
      const contentOnlyObject = JSON.parse(jsonEditText)

      // Özyinelemeli olarak sadece içerik verilerini güncelle
      const mergeContent = (target: any, source: any) => {
        for (const key in source) {
          if (target.hasOwnProperty(key) && !key.startsWith('_')) {
            if (
              typeof source[key] === 'object' &&
              source[key] !== null &&
              !Array.isArray(source[key])
            ) {
              mergeContent(target[key], source[key])
            } else {
              target[key] = source[key]
            }
          }
        }
      }

      mergeContent(fullDataObject, contentOnlyObject)
      setI18nData(fullDataObject)
      setJsonError(null)
      alert('JSON başarıyla güncellendi!')
      setViewMode('ui')
      setIsZen(false)
    } catch (e: any) {
      setJsonError(`Geçersiz JSON: ${e.message}`)
    }
  }

  const handleJsonReset = () => {
    const dataToReset = isZen ? stripMetaRecursively(i18nData) : i18nData
    setJsonEditText(JSON.stringify(dataToReset, null, 2))
    setJsonError(null)
  }

  const rootFieldKeys = Object.keys(i18nData).filter(
    (key) => !key.startsWith('_') && key !== '_meta',
  )

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6" data-zen-mode={isZen}>
      <div className="mx-auto max-w-3xl">
        <header className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <h1 className="text-headline-small text-on-background">i18n Editörü</h1>
          <div className="flex w-full flex-shrink-0 items-center gap-2 sm:w-auto">
            {/* GÖRÜNÜM SEÇİCİ */}
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
            {/* ZEN MODU TOGGLE */}
            <button
              onClick={() => setIsZen(!isZen)}
              title="Zen Modu Aç/Kapat"
              className={`btn-state-layer flex items-center gap-2 rounded-full border border-outline/30 px-3 py-1.5 transition-colors ${
                isZen
                  ? 'bg-tertiary-container text-on-tertiary-container'
                  : 'bg-surface-container text-on-surface-variant'
              }`}
            >
              <SparklesIcon />
              <span className="text-label-large">Zen</span>
            </button>
          </div>
        </header>
        <main className="flex flex-col gap-4">
          <div className={viewMode === 'json' ? 'flex flex-col gap-4' : 'hidden'}>
            <I18nJsonEditor
              value={jsonEditText}
              onChange={setJsonEditText}
              onSave={handleJsonSave}
              onReset={handleJsonReset}
              error={jsonError}
              isZen={isZen}
            />
          </div>

          <div className={viewMode === 'ui' ? 'flex flex-col gap-4' : 'hidden'}>
            {rootFieldKeys.map((fieldKey) => (
              <I18nInputMode
                key={fieldKey}
                path={[fieldKey]}
                fieldValue={i18nData[fieldKey]}
                fieldMeta={i18nData[`_${fieldKey}`] as AllMetaTypes}
                onUpdate={handleUpdate}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
