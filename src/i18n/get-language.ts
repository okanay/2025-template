import { getCookie, getHeader } from '@tanstack/react-start/server'
import { createServerFn } from '@tanstack/react-start'
import { DEFAULT_LANGUAGE, I18N_COOKIE_NAME, SUPPORTED_LANGUAGES } from './config'

export const getPreferedLanguage = createServerFn({ method: 'GET' }).handler(async () => {
  const langCookie = getCookie(I18N_COOKIE_NAME)
  const langHeader = getHeader('accept-language')?.split(',')[0]?.trim()

  // Cookie check
  if (langCookie) {
    const cookieLanguage = SUPPORTED_LANGUAGES.find(({ supportLocale }) =>
      supportLocale.includes(langCookie as never),
    )
    if (cookieLanguage) return cookieLanguage
  }

  if (langHeader) {
    const headerLanguage = SUPPORTED_LANGUAGES.find(({ supportLocale }) =>
      supportLocale.includes(langHeader as never),
    )
    if (headerLanguage) return headerLanguage
  }

  return DEFAULT_LANGUAGE
})
