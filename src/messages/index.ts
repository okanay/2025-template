import translationTR from './tr/translation.json'
import translationEN from './en/translation.json'

import commonTR from './tr/common.json'
import commonEN from './en/common.json'

import notFoundTR from './tr/globals.json'
import notFoundEN from './en/globals.json'

export const defaultNS = 'translation'
export const ns = ['translation', 'common', 'globals']

const resource = {
  tr: {
    translation: translationTR,
    common: commonTR,
    globals: notFoundTR,
  },
  en: {
    translation: translationEN,
    common: commonEN,
    globals: notFoundEN,
  },
}

export default resource
