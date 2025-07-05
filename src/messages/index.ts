import commonTR from './tr/common.json'
import commonEN from './en/common.json'

export const defaultNS = 'translation'
export const ns = ['translation', 'common']

const resource = {
  tr: {
    translation: {},
    common: commonTR,
  },
  en: {
    translation: {},
    common: commonEN,
  },
}

export default resource
