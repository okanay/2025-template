import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Search } from 'lucide-react'
import { CountryPhonePrefixes } from 'src/constants/country-code'
import useClickOutside from 'src/hooks/use-click-outside'
import { useKeysEvents } from 'src/hooks/use-key-events'
import { useLanguage } from 'src/i18n/hooks/use-language'

// --- Types ---
interface PhoneInputProps extends Omit<React.ComponentProps<'input'>, 'onChange' | 'value'> {
  onChange?: (value: PhoneValue | null) => void
  value?: PhoneValue | null
  initialISO?: string
  initialPrefix?: string
  label?: string
  error?: string
}

interface PrefixSelectProps {
  value: string
  onChange: (iso: string) => void
  disabled?: boolean
}

interface TelInputProps {
  value: string
  onChange: (value: string) => void
  countryCode: string
  placeholder?: string
  disabled?: boolean
}

interface FormatRule {
  pattern: string
  length: number
  placeholder: string
}

export interface PhoneValue {
  iso: string
  prefix: string
  value: string
}

const DEFAULT_ISO = 'TR'

const formatRules: Record<string, FormatRule> = {
  default: {
    pattern: '### ### ####',
    length: 11,
    placeholder: '123 456 7890',
  },
  '90': {
    pattern: '(###) ### ## ##',
    length: 10,
    placeholder: '(532) 123 45 67',
  },
  '1': {
    pattern: '(###) ###-####',
    length: 10,
    placeholder: '(123) 456-7890',
  },
  '44': {
    pattern: '## #### ####',
    length: 10,
    placeholder: '71 2345 6789',
  },
  '49': {
    pattern: '### ########',
    length: 11,
    placeholder: '176 12345678',
  },
  '33': {
    pattern: '# ## ## ## ##',
    length: 9,
    placeholder: '6 12 34 56 78',
  },
  '61': {
    pattern: '# #### ####',
    length: 9,
    placeholder: '4 1234 5678',
  },
  '81': {
    pattern: '##-####-####',
    length: 10,
    placeholder: '90-1234-5678',
  },
  '7': {
    pattern: '(###) ###-##-##',
    length: 10,
    placeholder: '(912) 345-67-89',
  },
  '91': {
    pattern: '##### #####',
    length: 10,
    placeholder: '12345 67890',
  },
  '86': {
    pattern: '### #### ####',
    length: 11,
    placeholder: '123 4567 8901',
  },
  '55': {
    pattern: '(##) #####-####',
    length: 11,
    placeholder: '(11) 91234-5678',
  },
  '34': {
    pattern: '### ### ###',
    length: 9,
    placeholder: '612 345 678',
  },
  '39': {
    pattern: '### ### ####',
    length: 10,
    placeholder: '333 123 4567',
  },
  '62': {
    pattern: '###-####-#####',
    length: 12,
    placeholder: '812-3456-7890',
  },
}

// --- Main Phone Input Component (Wrapper) ---
export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  initialISO = DEFAULT_ISO,
  label,
  error,
  placeholder,
  disabled,
  required,
  ref,
}) => {
  // Internal state management
  const [internalValue, setInternalValue] = useState<PhoneValue>(() => {
    if (value) {
      return value
    }
    const country = getCountryByISO(initialISO)
    return {
      iso: country.iso,
      prefix: country.code,
      value: '',
    }
  })

  // Controlled vs Uncontrolled
  const isControlled = value !== undefined
  const currentValue = isControlled ? value || internalValue : internalValue

  // Update internal value when controlled value changes
  useEffect(() => {
    if (isControlled && value) {
      setInternalValue(value)
    }
  }, [value, isControlled])

  // Handle ISO change
  const handleISOChange = useCallback(
    (newISO: string) => {
      const country = getCountryByISO(newISO)
      const newValue: PhoneValue = {
        iso: country.iso,
        prefix: country.code,
        value: currentValue.value,
      }

      if (!isControlled) {
        setInternalValue(newValue)
      }
      onChange?.(newValue.value ? newValue : null)
    },
    [currentValue.value, isControlled, onChange],
  )

  // Handle number change
  const handleNumberChange = useCallback(
    (newNumber: string) => {
      const newValue: PhoneValue = {
        ...currentValue,
        value: newNumber,
      }

      console.log(newValue)

      if (!isControlled) {
        setInternalValue(newValue)
      }
      onChange?.(newNumber ? newValue : null)
    },
    [currentValue, isControlled, onChange],
  )

  return (
    <div
      ref={ref}
      data-disabled={disabled ? 'true' : 'false'}
      className="group/p flex w-full max-w-sm flex-col gap-1.5"
    >
      {label && (
        <label className="text-sm font-medium text-on-surface">
          {label}
          {required && <span className="ml-1 text-on-error">*</span>}
        </label>
      )}
      <div
        aria-disabled={disabled}
        className="flex divide-x rounded-md border border-outline bg-surface focus-within:border-outline-variant aria-disabled:cursor-not-allowed aria-disabled:border-outline aria-disabled:opacity-disabled"
      >
        <PrefixSelect value={currentValue.iso} onChange={handleISOChange} disabled={disabled} />
        <div className="relative flex-1">
          <TelInput
            value={currentValue.value}
            onChange={handleNumberChange}
            countryCode={currentValue.prefix}
            placeholder={placeholder}
            disabled={disabled}
          />
        </div>
      </div>
      {error && <p className="mt-1 text-sm text-on-error">{error}</p>}
    </div>
  )
}

PhoneInput.displayName = 'PhoneInput'

// --- Prefix Select Component ---
const PrefixSelect: React.FC<PrefixSelectProps> = ({ value, onChange, disabled }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const selectedCountry = getCountryByISO(value)
  const { language } = useLanguage()

  const filteredCountries = useMemo(() => {
    const search = searchTerm.toLowerCase()
    return CountryPhonePrefixes.filter((country) => {
      const countryName = getCountryName(country.iso, language.locale).toLowerCase()
      return (
        country.code.includes(search) ||
        country.iso.toLowerCase().includes(search) ||
        countryName.includes(search)
      )
    }).sort((a, b) => {
      const nameA = getCountryName(a.iso, language.locale).toLowerCase()
      const nameB = getCountryName(b.iso, language.locale).toLowerCase()
      return nameA.localeCompare(nameB)
    })
  }, [searchTerm, language.locale])

  const [preview, setPreview] = useState(-1)
  const listRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const dropdownRef = useClickOutside<HTMLDivElement>(
    () => {
      setIsOpen(false)
      setSearchTerm('')
      setPreview(-1)
    },
    isOpen,
    triggerRef,
  )

  const handleSelect = useCallback(
    (country: (typeof CountryPhonePrefixes)[0]) => {
      onChange(country.iso)
      setSearchTerm('')
      setIsOpen(false)
      setPreview(-1)
    },
    [onChange],
  )

  const navigatePreview = useCallback(
    (direction: 'up' | 'down') => {
      setPreview((prev) => {
        const newPreview =
          direction === 'down'
            ? prev === filteredCountries.length - 1
              ? 0
              : prev + 1
            : prev <= 0
              ? filteredCountries.length - 1
              : prev - 1

        if (newPreview >= 0 && listRef.current) {
          const activeItem = listRef.current.children[newPreview] as HTMLElement
          if (activeItem) {
            activeItem.scrollIntoView({ block: 'nearest' })
          }
        }

        return newPreview
      })
    },
    [filteredCountries.length],
  )

  useKeysEvents(
    useCallback(
      (key: string) => {
        if (isOpen) {
          switch (key) {
            case 'Escape':
              setIsOpen(false)
              setSearchTerm('')
              setPreview(-1)
              break
            case 'ArrowDown':
              navigatePreview('down')
              break
            case 'ArrowUp':
              navigatePreview('up')
              break
            case 'Enter':
              if (preview >= 0 && filteredCountries[preview]) {
                handleSelect(filteredCountries[preview])
              }
              break
            default:
              break
          }
        }
      },
      [isOpen, navigatePreview, preview, filteredCountries, handleSelect],
    ),
  )

  useEffect(() => {
    if (isOpen && listRef.current) {
      const selectedIndex = filteredCountries.findIndex((c) => c.iso === value)
      if (selectedIndex >= 0) {
        const selectedItem = listRef.current.children[selectedIndex] as HTMLElement
        if (selectedItem) {
          selectedItem.scrollIntoView({ block: 'center' })
        }
      }
    }
  }, [isOpen, value, filteredCountries])

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
        className="z-30 flex h-10 w-full min-w-fit items-center justify-between gap-1 rounded-l px-3 ring-1 ring-transparent outline-none ring-inset hover:bg-surface-container-low focus:ring-outline disabled:cursor-not-allowed disabled:opacity-disabled aria-expanded:ring-outline"
      >
        <span className="font-medium text-on-surface">+{selectedCountry.code}</span>
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 z-20 mt-1 flex max-h-60 w-sm flex-col overflow-hidden rounded-md border border-outline-variant bg-surface-container-lowest"
        >
          <div className="sticky top-0 rounded-t-md border-b border-outline bg-surface-container p-2">
            <div className="relative">
              <input
                type="text"
                autoFocus
                value={searchTerm}
                placeholder="Ülke ara..."
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setPreview(-1)
                }}
                className="w-full rounded border border-outline bg-surface px-3 py-1.5 pr-8 text-sm hover:border-outline-variant hover:placeholder-on-surface-variant focus:outline-none"
              />
              <Search
                size={16}
                className="absolute top-1/2 right-2.5 -translate-y-1/2 text-on-surface-variant"
              />
            </div>
          </div>
          <div ref={listRef} role="listbox" className="overflow-y-auto rounded-b-md py-1">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country, index) => (
                <button
                  key={country.iso}
                  type="button"
                  role="option"
                  aria-selected={country.iso === value}
                  data-active={preview === index}
                  onClick={() => handleSelect(country)}
                  onMouseEnter={() => setPreview(index)}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-surface-container aria-selected:bg-primary aria-selected:text-on-primary data-[active=true]:bg-surface-container"
                >
                  <span className="truncate">{getCountryName(country.iso, language.locale)}</span>
                  <span className="text-xs">+{country.code}</span>
                </button>
              ))
            ) : (
              <p className="px-3 py-2 text-center text-sm text-on-surface-variant">
                Sonuç bulunamadı
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// --- Tel Input Component ---
const TelInput: React.FC<TelInputProps> = ({
  value,
  onChange,
  countryCode,
  placeholder,
  disabled,
}) => {
  const currentRule = formatRules[countryCode] || formatRules.default
  const displayValue = formatPhoneDisplay(value, countryCode)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRawValue = event.target.value.replace(/\D/g, '')
    if (newRawValue.length > currentRule.length) return
    onChange(newRawValue)
  }

  return (
    <input
      type="tel"
      inputMode="tel"
      className="h-10 w-full rounded-r-md bg-surface px-3 py-2 text-on-surface focus:placeholder-on-surface-variant disabled:cursor-not-allowed disabled:opacity-on-disabled"
      placeholder={placeholder || currentRule.placeholder}
      value={displayValue}
      onChange={handleChange}
      disabled={disabled}
    />
  )
}

// --- Utility Functions ---
export const formatPhoneNumber = (phoneValue: PhoneValue | null): string => {
  if (!phoneValue || !phoneValue.value) return ''
  return `+${phoneValue.prefix}${phoneValue.value}`
}

export const parsePhoneNumber = (
  phoneString: string,
  defaultISO: string = DEFAULT_ISO,
): PhoneValue | null => {
  if (!phoneString) return null

  // +905325461234 formatından parse et
  const match = phoneString.match(/^\+(\d{1,3})(\d+)$/)
  if (!match) return null

  const prefix = match[1]
  const number = match[2]

  // Prefix'e göre ülkeyi bul
  const country = CountryPhonePrefixes.find((c) => c.code === prefix)
  if (!country) {
    // Eğer bulamazsa default ISO kullan
    const defaultCountry = getCountryByISO(defaultISO)
    return {
      iso: defaultCountry.iso,
      prefix: defaultCountry.code,
      value: phoneString.replace(/\D/g, ''),
    }
  }

  return {
    iso: country.iso,
    prefix: country.code,
    value: number,
  }
}

// --- Helper Functions (Sadece değişenler) ---
const getCountryName = (isoCode: string, locale: string = 'tr-TR'): string => {
  try {
    const displayNames = new Intl.DisplayNames([locale], { type: 'region' })
    return displayNames.of(isoCode) || isoCode
  } catch {
    return isoCode
  }
}

const formatPhoneDisplay = (rawNumber: string, countryCode: string): string => {
  const rule = formatRules[countryCode] || formatRules.default
  if (!rawNumber) return ''

  const cleanNumber = rawNumber.slice(0, rule.length)
  let formatted = ''
  let numberIndex = 0

  for (const char of rule.pattern) {
    if (numberIndex >= cleanNumber.length) break
    if (char === '#') {
      formatted += cleanNumber[numberIndex++]
    } else {
      formatted += char
    }
  }
  return formatted
}

const getCountryByISO = (iso: string) => {
  const country = CountryPhonePrefixes.find((c) => c.iso === iso)
  if (country) {
    return country
  }
  // Fallback ülkesinin de bulunamadığı bir edge case'i engellemek için
  const defaultCountry = CountryPhonePrefixes.find((c) => c.iso === DEFAULT_ISO)
  if (!defaultCountry) {
    // Bu durum geliştirme aşamasında bir hata fırlatmalı
    throw new Error(`Default country with ISO "${DEFAULT_ISO}" not found.`)
  }
  return defaultCountry
}
