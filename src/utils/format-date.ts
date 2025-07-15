import { SUPPORTED_LANGUAGES } from 'src/i18n/config'

export const formatDate = (date: string | Date, language: LanguageValue) => {
  // Temel validasyon
  if (!date || !(date instanceof Date || typeof date === 'string')) {
    return ''
  }

  try {
    const d = new Date(date)

    // Geçersiz tarih kontrolü
    if (isNaN(d.getTime())) {
      return ''
    }

    const locale = SUPPORTED_LANGUAGES.find((l) => l.value === language)?.locale || 'en-US'

    // Hydration safety için consistent formatting
    const options: Intl.DateTimeFormatOptions = {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC', // Bu key - sunucu ve istemci aynı timezone'da çalışır
    }

    return d.toLocaleDateString(locale, options)
  } catch (error) {
    console.error('Date formatting error:', error)
    return ''
  }
}
