import {
  DEFAULT_LANGUAGE,
  FALLBACK_LANGUAGE,
  I18N_COOKIE_NAME,
  I18N_STORAGE_KEY,
  LANGUAGES_VALUES,
} from './config'
import i18n from 'i18next'
import Backend from 'i18next-http-backend'

import { initReactI18next } from 'react-i18next'
import resource, { defaultNS, ns } from 'src/messages'

const i18nConfig = (initialLanguage: LanguageValue = DEFAULT_LANGUAGE.value) => {
  if (!i18n.isInitialized) {
    i18n
      .use(Backend)
      .use(initReactI18next)
      .init({
        // resources: resource,
        lng: initialLanguage,
        backend: {
          loadPath: 'https://assets.hoi.com.tr/messages/{{lng}}/{{ns}}.json',
          crossDomain: true,
          requestOptions: {
            cache: 'default',
          },
        },
        fallbackLng: FALLBACK_LANGUAGE.value,
        supportedLngs: LANGUAGES_VALUES,
        defaultNS: defaultNS,
        ns: ns,
        interpolation: {
          escapeValue: false,
        },
        react: {
          useSuspense: true,
        },
        detection: {
          lookupCookie: I18N_COOKIE_NAME,
          lookupLocalStorage: I18N_STORAGE_KEY,
          caches: ['localStorage', 'cookie'],
        },
      })
  } else if (i18n.language !== initialLanguage) {
    i18n.changeLanguage(initialLanguage)
  }

  return i18n
}

export default i18nConfig
