import { CookieAttributes } from 'node_modules/@types/js-cookie'

declare global {
  type Language = (typeof SUPPORTED_LANGUAGES)[number]
  type LanguageValue = Language['value']
  type LanguageLocale = Language['locale']
}

export const SUPPORTED_LANGUAGES = [
  {
    label: 'Türkçe',
    value: 'tr',
    locale: 'tr-TR',
    supportLocale: ['tr-TR'],
    direction: 'ltr',
  },
  {
    label: 'İngilizce',
    value: 'en',
    locale: 'en-US',
    supportLocale: ['en-US', 'en-GB', 'en-CA', 'en-AU', 'en-IE'],
    direction: 'ltr',
  },
] as const

export const LANGUAGES_VALUES = SUPPORTED_LANGUAGES.map((language) => language.value); // prettier-ignore
export const DEFAULT_LANGUAGE: Language = SUPPORTED_LANGUAGES[0]
export const FALLBACK_LANGUAGE: Language = SUPPORTED_LANGUAGES[0]

export const I18N_STORAGE_KEY = 'language'
export const I18N_COOKIE_NAME = 'language'
export const I18N_COOKIE_OPTIONS = {
  expires: 365,
  path: '/',
  sameSite: 'lax' as CookieAttributes['sameSite'],
}
