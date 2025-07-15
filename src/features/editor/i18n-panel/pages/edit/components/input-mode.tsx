import { ChevronDownIcon, TrashIcon } from 'lucide-react'
import {
  AllMetaTypes,
  BaseMeta,
  BooleanMeta,
  ColorMeta,
  ContextualMeta,
  I18nData,
  PluralMeta,
  RepeaterMeta,
  SectionMeta,
  SelectMeta,
  TextMeta,
  TextareaMeta,
} from 'src/messages/schema'
import { useValidation } from '../hooks/use-validation'
import { useI18nPanel } from '../store'
import { useRef, useState } from 'react'

export const I18nInputMode = ({
  path,
  fieldValue,
  fieldMeta,
}: {
  path: (string | number)[]
  fieldValue: any
  fieldMeta: AllMetaTypes | undefined
}) => {
  const { updateField } = useI18nPanel()
  const fieldKey = path[path.length - 1]
  const implicitLabel = String(fieldKey)

  // Determine what to render based on meta type or value type
  const getTypeToRender = (): string => {
    if (fieldMeta?.type) {
      return fieldMeta.type
    }

    // Fallback to value type
    if (fieldValue === null || fieldValue === undefined) return 'null'
    if (typeof fieldValue === 'string') return 'string'
    if (typeof fieldValue === 'number') return 'number'
    if (typeof fieldValue === 'boolean') return 'boolean'
    if (Array.isArray(fieldValue)) return 'array'
    if (typeof fieldValue === 'object') return 'object'

    return 'unknown'
  }

  const typeToRender = getTypeToRender()

  switch (typeToRender) {
    // Text-based inputs (single line)
    case 'text':
    case 'email':
    case 'url':
    case 'string':
    case 'number':
      return (
        <TextInput
          meta={(fieldMeta as TextMeta) || { type: 'text', label: implicitLabel }}
          value={String(fieldValue ?? '')}
          onUpdate={(newValue) => {
            const finalValue =
              typeToRender === 'number' || typeof fieldValue === 'number'
                ? Number(newValue) || 0
                : newValue
            updateField(path, finalValue)
          }}
        />
      )

    // Text-based inputs (multi line)
    case 'textarea':
    case 'markdown':
      return (
        <TextareaInput
          meta={fieldMeta as TextareaMeta}
          value={String(fieldValue ?? '')}
          onUpdate={(newValue) => updateField(path, newValue)}
        />
      )

    // Selection inputs
    case 'select':
      return (
        <SelectInput
          meta={fieldMeta as SelectMeta}
          value={String(fieldValue ?? '')}
          onUpdate={(newValue) => updateField(path, newValue)}
        />
      )

    // Boolean inputs
    case 'boolean':
      return (
        <BooleanToggle
          meta={(fieldMeta as BooleanMeta) || { type: 'boolean', label: implicitLabel }}
          value={Boolean(fieldValue)}
          onUpdate={(newValue) => updateField(path, newValue)}
        />
      )

    // Container inputs (object-like)
    case 'section':
    case 'object':
      if (!fieldValue || typeof fieldValue !== 'object' || Array.isArray(fieldValue)) return null
      return (
        <SectionComponent
          meta={
            (fieldMeta as SectionMeta) || {
              type: 'section',
              label: implicitLabel,
              icon: '📂',
              collapsed: false,
            }
          }
          data={fieldValue as I18nData}
          path={path}
        />
      )

    // Container inputs (array-like)
    case 'repeater':
      return (
        <RepeaterComponent
          meta={fieldMeta as RepeaterMeta}
          items={fieldValue as any[]}
          path={path}
        />
      )

    case 'radio':
      return (
        <RadioInput
          meta={fieldMeta as SelectMeta}
          value={String(fieldValue ?? '')}
          onUpdate={(newValue) => updateField(path, newValue)}
        />
      )

    // Color inputs (YENİ)
    case 'color':
      return (
        <ColorInput
          meta={fieldMeta as ColorMeta}
          value={String(fieldValue ?? '#000000')}
          onUpdate={(newValue) => updateField(path, newValue)}
        />
      )

    // Contextual inputs (YENİ)
    case 'contextual':
      return (
        <ContextualInput
          meta={fieldMeta as ContextualMeta}
          value={(fieldValue as Record<string, string>) || {}}
          onUpdate={(newValue) => updateField(path, newValue)}
        />
      )

    // Plural inputs (YENİ)
    case 'plural':
      return (
        <PluralInput
          meta={fieldMeta as PluralMeta}
          value={String(fieldValue ?? '')}
          onUpdate={(newValue) => updateField(path, newValue)}
        />
      )

    case 'array':
      return (
        <DefaultRepeater items={fieldValue} label={fieldMeta?.label || implicitLabel} path={path} />
      )

    // Special cases (no render)
    case 'global':
    case 'null':
      return null

    // Unknown/unsupported types
    default:
      if (fieldMeta) {
        return (
          <div className="my-2 flex flex-col rounded-md bg-on-error-container p-3 text-error-container">
            <span className="text-title-medium">{fieldMeta.label || fieldKey}</span>
            <span className="text-title-small">
              ({fieldMeta.type}) react component daha hazır değil.
            </span>
          </div>
        )
      }
      return null
  }
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
    <div className="my-2 flex w-full flex-col gap-y-1">
      <label className="text-title-small font-normal text-on-surface-variant">{meta.label}</label>
      {children}
      <div className="min-h-fit px-1">
        {error ? (
          <p className="text-label-medium text-error">{error}</p>
        ) : meta.hint ? (
          <div className="mt-1 flex min-h-fit w-fit flex-col items-center rounded-xl bg-secondary-container px-2 py-1 text-center text-on-secondary-container">
            <p className="text-label-medium text-on-surface-variant/70">{meta.hint}</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}

const RepeaterComponent = ({
  meta,
  items,
  path,
}: {
  meta: RepeaterMeta
  items: any[]
  path: (string | number)[]
}) => {
  const { updateField } = useI18nPanel()

  const handleAddItem = () => {
    const newItem = Object.keys(meta.fields).reduce(
      (acc, key) => {
        const fieldMeta = meta.fields[key]
        acc[key] = fieldMeta.type === 'boolean' ? false : fieldMeta.type === 'repeater' ? [] : ''
        return acc
      },
      {} as Record<string, any>,
    )
    updateField(path, [...(items || []), newItem])
  }

  const handleRemoveItem = (index: number) => {
    updateField(
      path,
      items.filter((_, i) => i !== index),
    )
  }

  return (
    <FormField meta={meta}>
      <div className="flex flex-col rounded-lg border border-outline/20 bg-surface-container-lowest px-3 pt-3">
        {(items || []).map((item, index) => (
          <div
            key={index}
            className="relative mb-4 rounded-md border border-outline/20 bg-surface p-3"
          >
            <button
              onClick={() => handleRemoveItem(index)}
              title="Bu elemanı sil"
              className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full text-on-surface-variant/50 transition-colors hover:bg-error-container hover:text-on-error-container"
            >
              <TrashIcon size={16} />
            </button>
            <div className="flex flex-col px-1">
              {Object.keys(meta.fields).map((fieldKey) => (
                <I18nInputMode
                  key={fieldKey}
                  path={[...path, index, fieldKey]}
                  fieldValue={item[fieldKey]}
                  fieldMeta={meta.fields[fieldKey]}
                />
              ))}
            </div>
          </div>
        ))}
        <button
          onClick={handleAddItem}
          className="btn-state-layer mt-2 mb-4 self-start rounded-full bg-secondary-container px-4 py-1.5 text-label-large font-medium text-on-secondary-container"
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
}: {
  items: any[]
  label: string
  path: (string | number)[]
}) => {
  return (
    <div className="mb-4 flex flex-col">
      <label className="text-label-large font-medium text-on-surface-variant">{label}</label>
      <div className="flex flex-col rounded-lg border border-outline/30 p-4">
        {items.map((item, index) => (
          <I18nInputMode
            key={index}
            path={[...path, index]}
            fieldValue={item}
            fieldMeta={undefined}
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
}: {
  meta: SectionMeta
  data: I18nData
  path: (string | number)[]
}) => {
  return (
    <details
      open={!meta.collapsed}
      className="group mb-8 overflow-hidden rounded-xl border border-outline/20"
    >
      <summary className="flex cursor-pointer items-center bg-surface-container px-4 py-3 hover:bg-surface-container-high">
        <div className="flex flex-row items-start">
          {meta.icon && (
            <span className="mt-0.5 mr-2 text-title-small opacity-80">{meta.icon}</span>
          )}
        </div>
        <h2 className="text-title-medium font-semibold text-on-surface">{meta.label}</h2>
        <span className="ml-auto text-on-surface-variant transition-transform group-open:rotate-180">
          <ChevronDownIcon size={20} />
        </span>
      </summary>
      <div className="flex flex-col border-t border-outline/20 bg-surface-container-lowest p-4">
        {Object.keys(data).map((fieldKey) => {
          if (fieldKey.startsWith('_')) return null
          return (
            <I18nInputMode
              key={fieldKey}
              path={[...path, fieldKey]}
              fieldValue={data[fieldKey]}
              fieldMeta={data[`_${fieldKey}`] as unknown as AllMetaTypes}
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
  <div>
    <div className="flex min-h-[2.5rem] items-center justify-between">
      <div className="flex flex-col">
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
      <div className="mt-1 flex min-h-fit w-fit flex-col items-center rounded-xl bg-secondary-container px-2 py-1 text-center text-on-secondary-container">
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
        className="input-base appearance-none border-outline/30 pr-8"
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
        <ChevronDownIcon size={20} />
      </div>
    </div>
  </FormField>
)

// 1. RADIO INPUT - Array hazırlayıp döndür, state düzeltmesi
const RadioInput = ({
  meta,
  value,
  onUpdate,
}: {
  meta: SelectMeta
  value: string
  onUpdate: (v: string) => void
}) => {
  // Array olarak hazırla
  const options = meta.options.map((option) => {
    const optValue = typeof option === 'string' ? option : option.value
    const optLabel = typeof option === 'string' ? option : option.label
    const isChecked = String(value) === String(optValue)

    return {
      value: String(optValue),
      label: optLabel,
      isChecked,
    }
  })

  return (
    <FormField meta={meta}>
      <div className="flex flex-wrap gap-6">
        {options.map((opt) => (
          <label
            key={opt.value}
            htmlFor={opt.value}
            className="flex cursor-pointer items-center gap-2 rounded-full py-2 text-label-large text-primary transition-all duration-300 has-checked:bg-primary has-checked:px-6 has-checked:text-on-primary"
            onClick={() => onUpdate(opt.value)}
          >
            <input
              type="radio"
              id={opt.value}
              name={`radio-${meta.label}`}
              value={opt.value}
              checked={opt.isChecked}
              readOnly
              className="hidden"
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
    </FormField>
  )
}

// 2. COLOR INPUT - Boolean hiyerarşisi ama renk kutusu tasarımı
const ColorInput = ({
  meta,
  value,
  onUpdate,
}: {
  meta: ColorMeta
  value: string
  onUpdate: (v: string) => void
}) => {
  const colorInputRef = useRef<HTMLInputElement>(null)

  const handleColorClick = () => {
    colorInputRef.current?.click()
  }

  const currentColor = value || '#000000'

  return (
    <div>
      <div className="flex min-h-[2.5rem] items-center justify-between">
        <div className="flex flex-col">
          <label className="text-title-small font-normal text-on-surface-variant">
            {meta.label}
          </label>
          {meta.description && (
            <p className="text-label-medium text-on-surface-variant/70">{meta.description}</p>
          )}
        </div>
        <button
          type="button"
          onClick={handleColorClick}
          className="relative inline-flex h-8 w-12 shrink-0 cursor-pointer rounded-md border-2 border-outline/30 transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-primary/50 focus:outline-none"
          style={{ backgroundColor: currentColor }}
        >
          <input
            ref={colorInputRef}
            type="color"
            value={currentColor}
            onChange={(e) => onUpdate(e.target.value)}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
        </button>
      </div>
      {meta.hint && (
        <div className="mt-1 flex min-h-fit w-fit flex-col items-center rounded-xl bg-secondary-container px-2 py-1 text-center text-on-secondary-container">
          <p className="text-label-medium text-on-surface-variant/70">{meta.hint}</p>
        </div>
      )}
    </div>
  )
}

// 3. PLURAL INPUT - Contextual ile benzer konsept, tek alan
const PluralInput = ({
  meta,
  value,
  onUpdate,
}: {
  meta: PluralMeta
  value: string
  onUpdate: (v: string) => void
}) => {
  const error = useValidation(value, meta)

  return (
    <FormField meta={meta} error={error}>
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-label-large font-medium text-on-surface-variant">
          <span>📝</span>
          <span>Değişken: {meta.variable}</span>
        </div>

        <textarea
          value={value}
          onChange={(e) => onUpdate(e.target.value)}
          placeholder={`Mesajınızı yazın... {${meta.variable}} değişkenini kullanabilirsiniz`}
          rows={3}
          className={`input-base min-h-[80px] ${error ? 'border-error' : 'border-outline/30'}`}
        />
      </div>
    </FormField>
  )
}

// 4. CONTEXTUAL INPUT - Plural ile benzer konsept, statik label yaklaşımı
const ContextualInput = ({
  meta,
  value,
  onUpdate,
}: {
  meta: ContextualMeta
  value: Record<string, string>
  onUpdate: (v: Record<string, string>) => void
}) => {
  const handleContextChange = (context: string, newValue: string) => {
    onUpdate({
      ...value,
      [context]: newValue,
    })
  }

  return (
    <FormField meta={meta}>
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-label-large font-medium text-on-surface-variant">
          <span>🌐</span>
          <span>Bağlam: {meta.context_key}</span>
        </div>

        {meta.contexts.map((context) => (
          <div key={context} className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-primary-container px-3 py-1 text-label-medium text-on-primary-container">
                {context}
              </span>
            </div>

            <textarea
              value={value[context] || ''}
              onChange={(e) => handleContextChange(context, e.target.value)}
              placeholder={`${context} durumu için mesaj yazın...`}
              rows={2}
              className="input-base border-outline/30"
            />
          </div>
        ))}

        {meta.variables && meta.variables.length > 0 && (
          <div className="rounded-md bg-secondary-container/20 p-3">
            <p className="text-label-small text-on-surface-variant">
              Değişkenler: {meta.variables.map((v) => `{${v}}`).join(', ')}
            </p>
          </div>
        )}
      </div>
    </FormField>
  )
}
