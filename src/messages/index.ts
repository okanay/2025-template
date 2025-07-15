import translationTR from './tr/translation.json'
import translationEN from './en/translation.json'

import commonTR from './tr/common.json'
import commonEN from './en/common.json'

import errorPagesTR from './tr/error-pages.json'
import errorPagesEN from './en/error-pages.json'

import seoTR from './tr/seo.json'
import seoEN from './en/seo.json'

export type TranslationNS = (typeof ns)[number]

export const defaultNS = 'translation'
export const ns = ['translation', 'common', 'error-pages', 'seo'] as const
export const ns_dictionary = [
  { label: 'Temel Çeviriler', ns: ns[0] },
  { label: 'Sıradan Çeviriler', ns: ns[1] },
  { label: 'Hata Sayfaları', ns: ns[2] },
  { label: 'SEO Etiketleri', ns: ns[3] },
]

const resource = {
  tr: {
    translation: translationTR,
    common: commonTR,
    globals: errorPagesTR,
    seo: seoTR,
  },
  en: {
    translation: translationEN,
    common: commonEN,
    globals: errorPagesEN,
    seo: seoEN,
  },
}

export default resource
