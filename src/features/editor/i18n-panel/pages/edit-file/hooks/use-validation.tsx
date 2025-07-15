import { useState, useEffect } from 'react'
import { ValidationMeta } from 'src/messages/schema'

/**
 * Gelen değeri ve meta kurallarını analiz ederek bir validasyon mesajı döndürür.
 * @param value Kontrol edilecek değer.
 * @param meta Alanın validasyon kurallarını içeren meta objesi.
 * @returns Hata mesajı (string) veya hata yoksa null.
 */
export function useValidation(value: string, meta: ValidationMeta): string | null {
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Required
    if (meta.required && !value) {
      setError(meta.validationMessages?.required || 'Bu alan zorunludur.')
      return
    }

    // MinLength
    if (meta.minLength && value.length < meta.minLength) {
      setError(
        meta.validationMessages?.minLength || `En az ${meta.minLength} karakter girmelisiniz.`,
      )
      return
    }

    // MaxLength
    if (meta.maxLength && value.length > meta.maxLength) {
      setError(
        meta.validationMessages?.maxLength || `En fazla ${meta.maxLength} karakter girebilirsiniz.`,
      )
      return
    }

    // Pattern (Regex)
    if (meta.pattern) {
      const regex = new RegExp(meta.pattern)
      if (!regex.test(value)) {
        setError(meta.validationMessages?.pattern || 'Lütfen geçerli bir formatta giriniz.')
        return
      }
    }

    // Tüm kontrollerden geçerse hatayı temizle
    setError(null)
  }, [value, meta])

  return error
}
