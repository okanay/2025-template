import translationTR from './tr/translation.json'
import translationEN from './en/translation.json'

import commonTR from './tr/common.json'
import commonEN from './en/common.json'

import notFoundTR from './tr/globals.json'
import notFoundEN from './en/globals.json'

import seoTR from './tr/seo.json'
import seoEN from './en/seo.json'

export const defaultNS = 'translation'
export const ns = ['translation', 'common', 'globals', 'seo']
export const ns_dictionary = [
  { label: 'Çeviri', ns: ns[0] },
  { label: 'Ortak', ns: ns[1] },
  { label: 'Genel', ns: ns[2] },
  { label: 'SEO', ns: ns[3] },
]

const resource = {
  tr: {
    translation: translationTR,
    common: commonTR,
    globals: notFoundTR,
    seo: seoTR,
  },
  en: {
    translation: translationEN,
    common: commonEN,
    globals: notFoundEN,
    seo: seoEN,
  },
}

export default resource
