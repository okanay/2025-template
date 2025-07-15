export const I18nJsonEditor: React.FC<{
  value: string
  onChange: (newValue: string) => void
  onSave: () => void
  onReset: () => void
  error: string | null
  isZen: boolean
}> = ({ value, onChange, onSave, onReset, error, isZen }) => {
  let displayText = value
  if (isZen) {
    try {
      const parsedJson = JSON.parse(value)
      displayText = JSON.stringify(stripMetaRecursively(parsedJson), null, 2)
    } catch (e) {
      displayText = value
    }
  }

  const handleZenChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-outline/20 bg-surface p-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-title-medium text-on-surface">JSON Editörü</h2>
          <p className="text-body-medium text-on-surface-variant">
            {isZen
              ? 'Zen modunda, sadece metin içeriklerini düzenliyorsunuz.'
              : 'Zen mod kapalı, tüm veri yapısını düzenleyebilirsiniz.'}
          </p>
        </div>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onReset}
            className="btn-state-layer rounded-full px-4 py-2 text-label-large text-on-surface-variant"
          >
            Sıfırla
          </button>
          <button
            onClick={onSave}
            className="btn-state-layer rounded-full bg-primary-container px-6 py-2 text-label-large text-on-primary-container"
          >
            JSON'ı Kaydet
          </button>
        </div>
      </div>
      <textarea
        value={displayText}
        onChange={isZen ? handleZenChange : (e) => onChange(e.target.value)}
        className={`input-base min-h-[500px] font-mono text-sm ${error ? 'border-error' : 'border-outline/30'}`}
        spellCheck="false"
      />
      {error && (
        <div className="rounded-md bg-error-container p-3 text-on-error-container">
          <p className="font-bold">Hata!</p>
          <p className="font-mono text-sm">{error}</p>
        </div>
      )}
    </div>
  )
}

export function stripMetaRecursively(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(stripMetaRecursively)
  }
  if (obj !== null && typeof obj === 'object') {
    const newObj: Record<string, any> = {}
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key) && !key.startsWith('_')) {
        newObj[key] = stripMetaRecursively(obj[key])
      }
    }
    return newObj
  }
  return obj
}
