import { ChevronDownIcon, TrashIcon, PlusIcon } from 'lucide-react'
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

    case 'color':
      return (
        <ColorInput
          meta={fieldMeta as ColorMeta}
          value={String(fieldValue ?? '#000000')}
          onUpdate={(newValue) => updateField(path, newValue)}
        />
      )

    case 'plural':
      return (
        <PluralInput
          meta={fieldMeta as PluralMeta}
          value={(fieldValue as Record<string, string>) || {}}
          onUpdate={(newValue) => updateField(path, newValue)}
        />
      )

    case 'contextual':
      return (
        <ContextualInput
          meta={fieldMeta as ContextualMeta}
          value={(fieldValue as Record<string, string>) || {}}
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
          <div className="my-3 rounded-xl border border-error/20 bg-error-container/10 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-error text-on-error">
                <span className="text-label-medium">⚠</span>
              </div>
              <div className="flex-1">
                <div className="text-title-small font-medium text-error">
                  {fieldMeta.label || fieldKey}
                </div>
                <div className="text-body-small text-error/70">
                  ({fieldMeta.type}) türü için React bileşeni henüz hazır değil.
                </div>
              </div>
            </div>
          </div>
        )
      }
      return null
  }
}

//==========================================================================
// TEMEL WRAPPER VE YARDIMCI BİLEŞENLER
//==========================================================================

const FormField = ({
  meta,
  error,
  children,
  className = '',
}: {
  meta: BaseMeta
  error?: string | null
  children: React.ReactNode
  className?: string
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-body-medium font-medium text-on-surface">{meta.label}</label>

      <div className="relative">{children}</div>

      {/* Error & Hint Messages */}
      <div className="min-h-fit">
        {error ? (
          <div className="flex items-center gap-2 text-body-small text-error">
            <span className="text-xs">●</span>
            <span>{error}</span>
          </div>
        ) : meta.hint ? (
          <div className="flex items-center gap-2 text-body-small text-on-surface-variant">
            <span className="text-xs">💡</span>
            <span>{meta.hint}</span>
          </div>
        ) : null}
      </div>
    </div>
  )
}

const Card = ({
  children,
  className = '',
  elevation = 1,
}: {
  children: React.ReactNode
  className?: string
  elevation?: 0 | 1 | 2 | 3 | 4 | 5
}) => {
  return (
    <div
      className={`mb-6 rounded-xl border border-surface-container-highest bg-surface ${className}`}
    >
      {children}
    </div>
  )
}

const Button = ({
  children,
  onClick,
  variant = 'filled',
  size = 'medium',
  disabled = false,
  className = '',
  type = 'button',
  ...props
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'filled' | 'outlined' | 'text' | 'tonal'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit' | 'reset'
}) => {
  const baseClasses =
    'btn-state-layer inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-disabled'

  const sizeClasses = {
    small: 'px-3 py-1.5 text-label-medium min-h-8',
    medium: 'px-6 py-2.5 text-label-large min-h-10',
    large: 'px-8 py-3 text-title-small min-h-12',
  }

  const variantClasses = {
    filled: 'bg-primary text-on-primary shadow-sm hover:shadow-md',
    outlined: 'border border-outline bg-surface text-primary hover:bg-primary/hover',
    text: 'text-primary hover:bg-primary/hover',
    tonal: 'bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

//==========================================================================
// KONTEYNER BİLEŞENLERİ
//==========================================================================

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
    <FormField meta={meta} className="space-y-4">
      <Card className="space-y-4 p-6">
        {/* Repeater Header */}
        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
              <span className="text-label-medium font-bold">{(items || []).length}</span>
            </div>
            <span className="text-title-small font-medium text-on-surface">Öğeler</span>
          </div>

          <Button onClick={handleAddItem} variant="tonal" size="small" className="gap-1">
            <PlusIcon size={16} />
            {meta.addButton || 'Yeni Ekle'}
          </Button>
        </div>

        {/* Repeater Items */}
        <div className="space-y-4">
          {(items || []).map((item, index) => (
            <Card key={index} className="relative p-4" elevation={0}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex space-y-4">
                  {Object.keys(meta.fields).map((fieldKey) => (
                    <I18nInputMode
                      key={fieldKey}
                      path={[...path, index, fieldKey]}
                      fieldValue={item[fieldKey]}
                      fieldMeta={meta.fields[fieldKey]}
                    />
                  ))}
                </div>

                <Button
                  onClick={() => handleRemoveItem(index)}
                  variant="text"
                  size="small"
                  className="mt-1 shrink-0 text-error hover:bg-error/hover"
                >
                  <TrashIcon size={16} />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {(items || []).length === 0 && (
          <div className="py-8 text-center">
            <div className="flex flex-col items-center gap-2 text-on-surface-variant">
              <div className="text-2xl opacity-50">📝</div>
              <span className="text-body-medium">Henüz öğe eklenmemiş</span>
            </div>
          </div>
        )}
      </Card>
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
    <div className="space-y-4">
      <label className="block text-body-medium font-medium text-on-surface">{label}</label>
      <Card className="space-y-4 p-4">
        {items.map((item, index) => (
          <I18nInputMode
            key={index}
            path={[...path, index]}
            fieldValue={item}
            fieldMeta={undefined}
          />
        ))}
      </Card>
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
    <Card className="overflow-hidden" elevation={2}>
      <details open={!meta.collapsed} className="group">
        <summary className="btn-state-layer flex cursor-pointer items-center gap-3 bg-surface-container p-4 hover:bg-surface-container-high">
          {meta.icon && <span className="text-title-medium">{meta.icon}</span>}
          <h2 className="flex-1 text-title-medium font-semibold text-on-surface">{meta.label}</h2>
          <ChevronDownIcon
            size={20}
            className="text-on-surface-variant transition-transform duration-200 group-open:rotate-180"
          />
        </summary>

        <div className="space-y-4 border-t border-outline-variant/20 bg-surface-container-lowest p-4">
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
    </Card>
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
        className={`input-base ${error ? 'border-error' : 'border-outline/30'}`}
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
  <div className="space-y-2">
    <div className="flex items-center justify-between rounded-xl bg-surface-container-low p-3">
      <div className="flex-1">
        <label className="block text-body-medium font-medium text-on-surface">{meta.label}</label>
        {meta.description && (
          <p className="mt-1 text-body-small text-on-surface-variant">{meta.description}</p>
        )}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onUpdate(!value)}
        className={`btn-state-layer relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-200 ${
          value ? 'bg-primary' : 'bg-outline'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full shadow-sm ring-0 transition-all duration-200 ${
            value ? 'translate-x-6 bg-on-primary' : 'translate-x-0 bg-surface'
          }`}
        />
      </button>
    </div>

    {meta.hint && (
      <div className="flex items-center gap-2 text-body-small text-on-surface-variant">
        <span className="text-xs">💡</span>
        <span>{meta.hint}</span>
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
        className="input-base appearance-none pr-10"
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
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-on-surface-variant">
        <ChevronDownIcon size={20} />
      </div>
    </div>
  </FormField>
)

const RadioInput = ({
  meta,
  value,
  onUpdate,
}: {
  meta: SelectMeta
  value: string
  onUpdate: (v: string) => void
}) => {
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
      <div className="grid grid-cols-1 gap-2">
        {options.map((opt) => (
          <label
            key={opt.value}
            className={`btn-state-layer flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-all duration-200 ${
              opt.isChecked
                ? 'border-primary bg-primary-container text-on-primary-container'
                : 'border-outline-variant bg-surface hover:bg-surface-container-low'
            }`}
            onClick={() => onUpdate(opt.value)}
          >
            <div
              className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                opt.isChecked ? 'border-primary bg-primary' : 'border-outline'
              }`}
            >
              {opt.isChecked && <div className="h-2 w-2 rounded-full bg-on-primary" />}
            </div>
            <span className="text-body-medium font-medium">{opt.label}</span>
            <input
              type="radio"
              value={opt.value}
              checked={opt.isChecked}
              readOnly
              className="sr-only"
            />
          </label>
        ))}
      </div>
    </FormField>
  )
}

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
  const currentColor = value || '#000000'

  const handleColorClick = () => {
    colorInputRef.current?.click()
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between rounded-xl bg-surface-container-low p-3">
        <div>
          <label className="block text-body-medium font-medium text-on-surface">{meta.label}</label>
          <span className="font-mono text-body-small text-on-surface-variant">{currentColor}</span>
        </div>

        <button
          type="button"
          onClick={handleColorClick}
          className="btn-state-layer relative h-12 w-16 shrink-0 cursor-pointer rounded-lg border-2 border-outline-variant shadow-sm transition-all duration-200 hover:scale-105"
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
    </div>
  )
}

const PluralInput = ({
  meta,
  value,
  onUpdate,
}: {
  meta: PluralMeta
  value: Record<string, string>
  onUpdate: (v: Record<string, string>) => void
}) => {
  const allPluralForms = [
    { key: 'zero', label: 'Sıfır', description: 'Hiç yok (0)', emoji: '0️⃣' },
    { key: 'one', label: 'Tekil', description: 'Bir tane (1)', emoji: '1️⃣' },
    { key: 'two', label: 'İkili', description: 'İki tane (2)', emoji: '2️⃣' },
    { key: 'few', label: 'Az', description: 'Birkaç tane (3-6)', emoji: '🔢' },
    { key: 'many', label: 'Çok', description: 'Çok sayıda (7-10)', emoji: '📊' },
    { key: 'other', label: 'Diğer', description: 'Geri kalan (11+)', emoji: '♾️' },
  ]

  const existingForms = allPluralForms.filter(
    (form) => value && Object.prototype.hasOwnProperty.call(value, form.key),
  )

  const [activeForm, setActiveForm] = useState(
    existingForms.length > 0 ? existingForms[0].key : 'other',
  )

  const handlePluralChange = (formKey: string, newValue: string) => {
    onUpdate({
      ...value,
      [formKey]: newValue,
    })
  }

  const activeFormData = allPluralForms.find((f) => f.key === activeForm)

  return (
    <FormField meta={meta}>
      <Card className="space-y-4 p-4">
        {/* Form Selector */}
        <div className="flex flex-wrap gap-2">
          {existingForms.map((form) => (
            <Button
              key={form.key}
              onClick={() => setActiveForm(form.key)}
              variant={activeForm === form.key ? 'filled' : 'outlined'}
              size="small"
              className="gap-1"
            >
              <span>{form.emoji}</span>
              <span>{form.label}</span>
            </Button>
          ))}
        </div>

        {/* Active Form Info */}
        {activeFormData && (
          <div className="rounded-lg bg-secondary-container/30 p-3">
            <div className="flex items-center gap-2 text-body-small text-on-surface-variant">
              <span>{activeFormData.emoji}</span>
              <span>
                <strong>{activeFormData.label}:</strong> {activeFormData.description}
              </span>
            </div>
          </div>
        )}

        {/* Text Input */}
        <textarea
          value={value[activeForm] || ''}
          onChange={(e) => handlePluralChange(activeForm, e.target.value)}
          placeholder={`${activeFormData?.label} durumu için mesaj... {{${meta.variable}}} kullanabilirsiniz`}
          rows={4}
          className={`input-base resize-y border-outline/30`}
        />
      </Card>
    </FormField>
  )
}

const ContextualInput = ({
  meta,
  value,
  onUpdate,
}: {
  meta: ContextualMeta
  value: Record<string, string>
  onUpdate: (v: Record<string, string>) => void
}) => {
  const [activeContext, setActiveContext] = useState(meta.contexts[0] || '')

  const handleContextChange = (newValue: string) => {
    onUpdate({
      ...value,
      [activeContext]: newValue,
    })
  }

  return (
    <FormField meta={meta}>
      <Card className="space-y-4 p-4">
        {/* Context Selector */}
        <div className="flex flex-wrap gap-2">
          {meta.contexts.map((context) => (
            <Button
              key={context}
              onClick={() => setActiveContext(context)}
              variant={activeContext === context ? 'filled' : 'outlined'}
              size="small"
            >
              {context}
            </Button>
          ))}
        </div>

        {/* Active Context Info */}
        <div className="rounded-lg bg-tertiary-container/30 p-3">
          <div className="flex items-center gap-2 text-body-small text-on-surface-variant">
            <span>🌐</span>
            <span>
              <strong>Aktif Bağlam:</strong> {activeContext}
            </span>
          </div>
        </div>

        {/* Text Input */}
        <textarea
          value={value[activeContext] || ''}
          onChange={(e) => handleContextChange(e.target.value)}
          placeholder={`${activeContext} durumu için mesaj yazın...`}
          rows={4}
          className={`input-base resize-y border-outline/30`}
        />
      </Card>
    </FormField>
  )
}
