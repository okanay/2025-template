import translationTR from './tr/translation.json'
import translationEN from './en/translation.json'

import commonTR from './tr/common.json'
import commonEN from './en/common.json'

import notFoundTR from './tr/not-found.json'
import notFoundEN from './en/not-found.json'

export const defaultNS = 'translation'
export const ns = ['translation', 'common', 'not-found']

const resource = {
  tr: {
    translation: translationTR,
    common: commonTR,
    'not-found': notFoundTR,
  },
  en: {
    translation: translationEN,
    common: commonEN,
    'not-found': notFoundEN,
  },
}

export default resource
