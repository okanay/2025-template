import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import type {
  AllMetaTypes,
  BaseMeta,
  BooleanMeta,
  I18nData,
  I18nPayload,
  RepeaterMeta,
  SectionMeta,
  SelectMeta,
  TextMeta,
  TextareaMeta,
  ValidationMeta,
} from 'src/messages/schema'

// TEST DATA
import globals from 'src/messages/en/globals.json'

//==========================================================================
// ANA SAYFA BİLEŞENİ (Entry Point)
//==========================================================================

export const Route = createFileRoute('/$lang/_auth/editor/i18n')({
  component: RouteComponent,
})

function RouteComponent() {
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
      <div className="mx-auto max-w-4xl">
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
          {viewMode === 'json' ? (
            <JsonEditorComponent
              value={jsonEditText}
              onChange={setJsonEditText}
              onSave={handleJsonSave}
              onReset={handleJsonReset}
              error={jsonError}
              isZen={isZen}
              originalData={i18nData}
            />
          ) : (
            rootFieldKeys.map((fieldKey) => (
              <FieldRenderer
                key={fieldKey}
                path={[fieldKey]}
                fieldValue={i18nData[fieldKey]}
                fieldMeta={i18nData[`_${fieldKey}`] as AllMetaTypes}
                onUpdate={handleUpdate}
              />
            ))
          )}
        </main>
      </div>
    </div>
  )
}

//==========================================================================
// ANA RENDERER (Recursive "Brain")
//==========================================================================

const FieldRenderer = ({
  path,
  fieldValue,
  fieldMeta,
  onUpdate,
}: {
  path: (string | number)[]
  fieldValue: any
  fieldMeta: AllMetaTypes | undefined
  onUpdate: (path: (string | number)[], newValue: any) => void
}) => {
  const fieldKey = path[path.length - 1]

  // --- If metadata exists (Smart Mode) ---
  if (fieldMeta) {
    switch (fieldMeta.type) {
      case 'section':
        if (!fieldValue || typeof fieldValue !== 'object' || Array.isArray(fieldValue)) return null
        return (
          <SectionComponent
            meta={fieldMeta}
            data={fieldValue as I18nData}
            path={path}
            onUpdate={onUpdate}
          />
        )

      case 'repeater':
        return (
          <RepeaterComponent
            meta={fieldMeta}
            items={fieldValue as any[]}
            onUpdate={onUpdate}
            path={path}
          />
        )

      case 'text':
      case 'email':
      case 'url':
        return (
          <TextInput
            meta={fieldMeta}
            value={String(fieldValue ?? '')}
            onUpdate={(newValue) => onUpdate(path, newValue)}
          />
        )

      case 'select':
        return (
          <SelectInput
            meta={fieldMeta}
            value={String(fieldValue ?? '')}
            onUpdate={(newValue) => onUpdate(path, newValue)}
          />
        )

      case 'textarea':
      case 'markdown':
        return (
          <TextareaInput
            meta={fieldMeta}
            value={String(fieldValue ?? '')}
            onUpdate={(newValue) => onUpdate(path, newValue)}
          />
        )

      case 'boolean':
        return (
          <BooleanToggle
            meta={fieldMeta}
            value={Boolean(fieldValue)}
            onUpdate={(newValue) => onUpdate(path, newValue)}
          />
        )

      default:
        if (fieldMeta.type === 'global') return null
        return (
          <div className="rounded-md bg-error-container p-2 text-on-error-container">
            <strong>{fieldMeta.label || fieldKey}</strong> ({fieldMeta.type}) component is not yet
            defined.
          </div>
        )
    }
  }

  // --- If metadata does not exist (Fallback Mode) ---
  const implicitLabel = String(fieldKey)

  if (typeof fieldValue === 'string') {
    return (
      <TextInput
        meta={{ type: 'text', label: implicitLabel }}
        value={fieldValue}
        onUpdate={(newValue) => onUpdate(path, newValue)}
      />
    )
  }

  if (typeof fieldValue === 'number') {
    // A NumberInput component could be created, but for now, we use text
    return (
      <TextInput
        meta={{ type: 'text', label: implicitLabel }}
        value={String(fieldValue)}
        onUpdate={(newValue) => onUpdate(path, Number(newValue) || 0)}
      />
    )
  }

  if (typeof fieldValue === 'boolean') {
    return (
      <BooleanToggle
        meta={{ type: 'boolean', label: implicitLabel }}
        value={fieldValue}
        onUpdate={(newValue) => onUpdate(path, newValue)}
      />
    )
  }

  if (Array.isArray(fieldValue)) {
    return (
      <DefaultRepeater items={fieldValue} label={implicitLabel} path={path} onUpdate={onUpdate} />
    )
  }

  if (typeof fieldValue === 'object' && fieldValue !== null) {
    const implicitMeta: SectionMeta = {
      type: 'section',
      label: implicitLabel,
      icon: '📂',
      collapsed: false,
    }
    return (
      <SectionComponent
        meta={implicitMeta}
        data={fieldValue as I18nData}
        path={path}
        onUpdate={onUpdate}
      />
    )
  }

  // If no matching type is found (e.g., null, undefined), show nothing
  return null
}

const JsonEditorComponent = ({
  value,
  onChange,
  onSave,
  onReset,
  error,
  isZen,
  originalData,
}: any) => {
  // Zen modunda ise sadece meta'ları temizlenmiş halini göster.
  let displayText = value
  if (isZen) {
    try {
      // Sadece geçerli bir JSON ise Zen görünümünü oluşturmayı dene.
      const parsedJson = JSON.parse(value)
      displayText = JSON.stringify(stripMetaRecursively(parsedJson), null, 2)
    } catch (e) {
      // JSON geçersizse, çökme. Kullanıcının yazdığı ham metni göstermeye devam et.
      // Zen modu bu durumda efektif olarak pasif kalır.
      displayText = value
    }
  }

  // Zen modundayken kullanıcı sadece içeriği düzenleyebilmeli.
  // Kaydetme işlemi, bu içeriği ana veriyle birleştirecek.
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
              ? 'Sadece metin içeriklerini düzenliyorsunuz.'
              : 'Veriyi doğrudan JSON formatında düzenleyebilirsiniz.'}
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

//==========================================================================
// YARDIMCI & YAPISAL BİLEŞENLER
//==========================================================================

const FormField = ({
  meta,
  error,
  children,
}: {
  meta: BaseMeta
  error?: string | null
  children: React.ReactNode
}) => {
  return (
    <div className="flex w-full flex-col gap-1.5">
      <label className="text-title-small font-normal text-on-surface-variant">{meta.label}</label>
      {children}
      <div className="min-h-[1rem] px-1">
        {error ? (
          <p className="text-label-medium text-error">{error}</p>
        ) : meta.hint ? (
          <p className="text-label-medium text-on-surface-variant/70">{meta.hint}</p>
        ) : null}
      </div>
    </div>
  )
}

const RepeaterComponent = ({
  meta,
  items,
  onUpdate,
  path,
}: {
  meta: RepeaterMeta
  items: any[]
  onUpdate: (path: (string | number)[], newValue: any) => void
  path: (string | number)[]
}) => {
  const handleAddItem = () => {
    const newItem = Object.keys(meta.fields).reduce(
      (acc, key) => {
        const fieldMeta = meta.fields[key]
        acc[key] = fieldMeta.type === 'boolean' ? false : fieldMeta.type === 'repeater' ? [] : ''
        return acc
      },
      {} as Record<string, any>,
    )
    onUpdate(path, [...(items || []), newItem])
  }

  const handleRemoveItem = (index: number) => {
    onUpdate(
      path,
      items.filter((_, i) => i !== index),
    )
  }

  return (
    // TASARIM: Repeater ana etiketi de FormField içine alındı.
    <FormField meta={meta}>
      <div className="flex flex-col gap-3 rounded-lg border border-outline/20 bg-surface-container-lowest p-3">
        {(items || []).map((item, index) => (
          <div key={index} className="relative rounded-md border border-outline/20 bg-surface p-3">
            {/* TASARIM: Silme butonu daha şık bir ikona dönüştü. */}
            <button
              onClick={() => handleRemoveItem(index)}
              title="Bu elemanı sil"
              className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full text-on-surface-variant/50 transition-colors hover:bg-error-container hover:text-on-error-container"
            >
              <TrashIcon />
            </button>
            <div className="flex flex-col gap-3 pr-4">
              {Object.keys(meta.fields).map((fieldKey) => (
                <FieldRenderer
                  key={fieldKey}
                  path={[...path, index, fieldKey]}
                  fieldValue={item[fieldKey]}
                  fieldMeta={meta.fields[fieldKey]}
                  onUpdate={onUpdate}
                />
              ))}
            </div>
          </div>
        ))}
        <button
          onClick={handleAddItem}
          className="btn-state-layer mt-2 self-start rounded-full bg-secondary-container px-4 py-1.5 text-label-large font-medium text-on-secondary-container"
        >
          {meta.addButton || 'Yeni Ekle'}
        </button>
      </div>
    </FormField>
  )
}

const DefaultRepeater = ({
  items,
  label,
  path,
  onUpdate,
}: {
  items: any[]
  label: string
  path: (string | number)[]
  onUpdate: (path: (string | number)[], newValue: any) => void
}) => {
  return (
    <div className="flex flex-col gap-4">
      <label className="text-label-large font-medium text-on-surface-variant">{label}</label>
      <div className="flex flex-col gap-2 rounded-lg border border-outline/30 p-4">
        {items.map((item, index) => (
          // Dizinin her bir elemanı için tekrar ana renderer'ı çağırıyoruz.
          // Bu, dizinin string, number veya obje içermesine bakılmaksızın çalışır.
          <FieldRenderer
            key={index}
            path={[...path, index]}
            fieldValue={item}
            fieldMeta={undefined}
            onUpdate={onUpdate}
          />
        ))}
      </div>
    </div>
  )
}

const SectionComponent = ({
  meta,
  data,
  path,
  onUpdate,
}: {
  meta: SectionMeta
  data: I18nData
  path: (string | number)[]
  onUpdate: (path: (string | number)[], newValue: any) => void
}) => {
  return (
    <details
      open={!meta.collapsed}
      className="group overflow-hidden rounded-xl border border-outline/20"
    >
      <summary className="flex cursor-pointer items-center gap-3 bg-surface-container px-4 py-3 hover:bg-surface-container-high">
        {meta.icon && <span className="text-lg opacity-80">{meta.icon}</span>}
        <h2 className="text-title-medium font-semibold text-on-surface">{meta.label}</h2>
        <span className="ml-auto text-on-surface-variant transition-transform group-open:rotate-180">
          <ChevronDownIcon />
        </span>
      </summary>
      <div className="flex flex-col gap-0 border-t border-outline/20 bg-surface-container-lowest p-4">
        {Object.keys(data).map((fieldKey) => {
          if (fieldKey.startsWith('_')) return null
          return (
            <FieldRenderer
              key={fieldKey}
              path={[...path, fieldKey]}
              fieldValue={data[fieldKey]}
              fieldMeta={data[`_${fieldKey}`] as unknown as AllMetaTypes}
              onUpdate={onUpdate}
            />
          )
        })}
      </div>
    </details>
  )
}

//==========================================================================
// INPUT BİLEŞENLERİ
//==========================================================================

const TextInput = ({
  meta,
  value,
  onUpdate,
}: {
  meta: TextMeta
  value: string
  onUpdate: (v: string) => void
}) => {
  const error = useValidation(value, meta)
  return (
    <FormField meta={meta} error={error}>
      <input
        type={meta.type}
        value={value}
        onChange={(e) => onUpdate(e.target.value)}
        placeholder={meta.placeholder}
        className={`input-base ${error ? 'border-error' : 'border-outline/30'}`}
      />
    </FormField>
  )
}

const TextareaInput = ({
  meta,
  value,
  onUpdate,
}: {
  meta: TextareaMeta
  value: string
  onUpdate: (v: string) => void
}) => {
  const error = useValidation(value, meta)
  return (
    <FormField meta={meta} error={error}>
      <textarea
        value={value}
        onChange={(e) => onUpdate(e.target.value)}
        placeholder={meta.placeholder}
        rows={4}
        className={`input-base min-h-[80px] ${error ? 'border-error' : 'border-outline/30'}`}
      />
    </FormField>
  )
}

const BooleanToggle = ({
  meta,
  value,
  onUpdate,
}: {
  meta: BooleanMeta
  value: boolean
  onUpdate: (v: boolean) => void
}) => (
  // TASARIM: Toggle ve çevresindeki yapı daha kompakt ve hizalı.
  <div>
    <div className="flex min-h-[2.5rem] items-center justify-between">
      <div className="flex flex-col gap-0.5">
        <label className="text-title-small font-normal text-on-surface-variant">{meta.label}</label>
        {meta.description && (
          <p className="text-label-medium text-on-surface-variant/70">{meta.description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onUpdate(!value)}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-primary/50 focus:outline-none ${
          value ? 'bg-primary' : 'bg-outline'
        }`}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-on-primary shadow ring-0 transition duration-200 ease-in-out ${
            value ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
    {meta.hint && (
      <div className="min-h-[1rem] px-1 pt-1.5">
        <p className="text-label-medium text-on-surface-variant/70">{meta.hint}</p>
      </div>
    )}
  </div>
)

const SelectInput = ({
  meta,
  value,
  onUpdate,
}: {
  meta: SelectMeta
  value: string
  onUpdate: (v: string) => void
}) => (
  <FormField meta={meta}>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onUpdate(e.target.value)}
        className={`input-base appearance-none border-outline/30 pr-8`}
      >
        {meta.options.map((option) => {
          const optValue = typeof option === 'string' ? option : option.value
          const optLabel = typeof option === 'string' ? option : option.label
          return (
            <option key={String(optValue)} value={String(optValue)}>
              {optLabel}
            </option>
          )
        })}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-on-surface-variant">
        <ChevronDownIcon />
      </div>
    </div>
  </FormField>
)

//==========================================================================
// İKONLAR
//==========================================================================

const TrashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
)

const ChevronDownIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
)

const SparklesIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 3L9.27 9.27L3 12l6.27 2.73L12 21l2.73-6.27L21 12l-6.27-2.73L12 3z" />
    <path d="M3 21l3-3" />
    <path d="M18 3l3 3" />
  </svg>
)

//==========================================================================
// HOOK & Helpers
//==========================================================================

const ModeButton = ({ isActive, onClick, label }: any) => (
  <button
    onClick={onClick}
    className={`rounded-full px-4 py-1 text-label-large transition-colors ${isActive ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-on-surface/10'}`}
  >
    {label}
  </button>
)

function stripMetaRecursively(obj: any): any {
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

/**
 * Gelen değeri ve meta kurallarını analiz ederek bir validasyon mesajı döndürür.
 * @param value Kontrol edilecek değer.
 * @param meta Alanın validasyon kurallarını içeren meta objesi.
 * @returns Hata mesajı (string) veya hata yoksa null.
 */
function useValidation(value: string, meta: ValidationMeta): string | null {
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Required
    if (meta.required && !value) {
      setError(meta.validationMessages?.required || 'Bu alan zorunludur.')
      return
    }

    // MinLength
    if (meta.minLength && value.length < meta.minLength) {
      setError(
        meta.validationMessages?.minLength || `En az ${meta.minLength} karakter girmelisiniz.`,
      )
      return
    }

    // MaxLength
    if (meta.maxLength && value.length > meta.maxLength) {
      setError(
        meta.validationMessages?.maxLength || `En fazla ${meta.maxLength} karakter girebilirsiniz.`,
      )
      return
    }

    // Pattern (Regex)
    if (meta.pattern) {
      const regex = new RegExp(meta.pattern)
      if (!regex.test(value)) {
        setError(meta.validationMessages?.pattern || 'Lütfen geçerli bir formatta giriniz.')
        return
      }
    }

    // Tüm kontrollerden geçerse hatayı temizle
    setError(null)
  }, [value, meta])

  return error
}
