/**
 * 'select' ve 'radio' tipleri için bir seçenek objesinin yapısını tanımlar.
 */
export type SelectOption = {
  label: string
  value: string | number
}

export interface GlobalMeta extends BaseMeta {
  type: 'global'
  _schemaVersion?: string
  _locale?: string
  _lastModified?: string
}

//==========================================================================
// TEMEL META TİPLERİ (BASE TYPES)
//==========================================================================

/**
 * Tüm meta tiplerinin paylaştığı temel özellikleri içerir.
 */
export interface BaseMeta {
  /**
   * Editör panelinde bu alan için gösterilecek etiket.
   * Eğer belirtilmezse, anahtarın kendisi (key) kullanılabilir.
   */
  label?: string
  /**
   * Alanın ne işe yaradığını açıklayan yardımcı metin.
   */
  description?: string
  /**
   * Alanın altında görünen küçük ipucu metni. Örn: "SEO için ideal."
   */
  hint?: string
  /**
   * Bu alanın doldurulmasının zorunlu olup olmadığını belirtir.
   * @default false
   */
  required?: boolean
  /**
   * Bu alanın editör tarafından düzenlenip düzenlenemeyeceğini belirtir.
   * @default false
   */
  readonly?: boolean
}

/**
 * Metin tabanlı alanlar için doğrulama kurallarını içeren temel tip.
 */
export interface ValidationMeta extends BaseMeta {
  /**
   * İzin verilen minimum karakter sayısı.
   */
  minLength?: number
  /**
   * İzin verilen maksimum karakter sayısı.
   */
  maxLength?: number
  /**
   * Girdinin uyması gereken Regex deseni.
   */
  pattern?: string
  /**
   * Başarısız olan doğrulama kuralları için özel hata mesajları.
   * Örn: { minLength: "Bu alan en az 10 karakter olmalıdır." }
   */
  validationMessages?: Partial<Record<'minLength' | 'maxLength' | 'pattern' | 'required', string>>
}

//==========================================================================
// AYRIŞTIRILMIŞ META TİPLERİ (DISCRIMINATED UNION MEMBERS)
//==========================================================================

export interface SectionMeta extends BaseMeta {
  type: 'section'
  /**
   * Bölümlerin UI'daki sıralamasını belirler.
   */
  order?: number
  /**
   * Bölüm başlığının yanında gösterilecek ikon (emoji veya ikon adı).
   */
  icon?: string
  /**
   * Bölümün panel ilk yüklendiğinde kapalı olarak gelip gelmeyeceği.
   * @default false
   */
  collapsed?: boolean
}

export interface TextMeta extends ValidationMeta {
  type: 'text' | 'email' | 'url'
  /**
   * Girdi alanı boşken görünen örnek metin.
   */
  placeholder?: string
}

export interface TextareaMeta extends ValidationMeta {
  type: 'textarea' | 'markdown'
  placeholder?: string
}

export interface NumberMeta extends BaseMeta {
  type: 'number'
  min?: number
  max?: number
  step?: number
}

export interface BooleanMeta extends BaseMeta {
  type: 'boolean'
}

export interface SelectMeta extends BaseMeta {
  type: 'select' | 'radio'
  /**
   * Seçeneklerin listesi. String dizisi veya {label, value} objeleri olabilir.
   */
  options: (string | SelectOption)[]
}

export interface DateMeta extends BaseMeta {
  type: 'date' | 'datetime'
}

export interface ColorMeta extends BaseMeta {
  type: 'color'
}

export interface MediaMeta extends BaseMeta {
  type: 'media'
  /**
   * Kabul edilen dosya tipleri. Örn: "image/png, image/jpeg"
   */
  accept?: string
  /**
   * Maksimum dosya boyutu. Örn: "5MB"
   */
  maxSize?: string
}

export interface ObjectMeta extends BaseMeta {
  type: 'object'
  /**
   * Bu nesnenin içindeki alanların meta tanımları.
   * NOT: Bu alan aslında verinin kendisinde değil, meta objesinin içinde tanımlanır.
   * Ancak tutarlılık için tip tanımında bulunabilir.
   */
  fields?: Record<string, AllMetaTypes>
}

export interface RepeaterMeta extends BaseMeta {
  type: 'repeater'
  /**
   * Listenin içindeki her bir elemanın form alanlarını tanımlar.
   */
  fields: Record<string, AllMetaTypes>
  /**
   * Her bir liste elemanının başlığında görünecek dinamik etiket.
   * Örn: "{{fields.title}}" veya "Soru #{{index}}"
   */
  itemLabel?: string
  /**
   * Yeni eleman ekleme butonunun metni.
   * @default "Yeni Ekle"
   */
  addButton?: string
  /**
   * Minimum eleman sayısı.
   */
  min?: number
  /**
   * Maksimum eleman sayısı.
   */
  max?: number
  /**
   * Elemanların sürükle-bırak ile yeniden sıralanıp sıralanamayacağını belirtir.
   * @default true
   */
  reorderable?: boolean
  /**
   * Elemanların açılıp kapanabilir (akordiyon) olup olmadığını belirtir.
   * @default true
   */
  openable?: boolean
}

export interface PluralMeta extends BaseMeta {
  type: 'plural'
  /**
   * Çoğul kuralını tetikleyecek değişkenin adı. Örn: "count"
   */
  variable: string
}

export interface ContextualMeta extends BaseMeta {
  type: 'contextual'
  /**
   * Hangi bağlamın kullanılacağını belirleyen anahtarın adı. Örn: "status"
   */
  context_key: string
  /**
   * Geçerli bağlamların listesi. Örn: ["pending", "shipped", "delivered"]
   */
  contexts: string[]
  /**
   * Metin içinde kullanılabilecek değişkenlerin listesi.
   */
  variables?: string[]
}

//==========================================================================
// ANA BİRLEŞTİRİLMİŞ TİP (MAIN UNION TYPE)
//==========================================================================

/**
 * `type` özelliğine göre ayrıştırılmış tüm olası meta tiplerinin birleşimi.
 * Bu, projemizdeki tüm meta kurallarını kapsayan ana tiptir.
 */
export type AllMetaTypes =
  | GlobalMeta
  | SectionMeta
  | TextMeta
  | TextareaMeta
  | NumberMeta
  | BooleanMeta
  | SelectMeta
  | DateMeta
  | ColorMeta
  | MediaMeta
  | ObjectMeta
  | RepeaterMeta
  | PluralMeta
  | ContextualMeta

//==========================================================================
// PAYLOAD (VERİ) TİPLERİ
//==========================================================================

/**
 * JSON dosyasındaki bir değerin olabileceği tipleri tanımlar.
 * Kendisine referans vererek iç içe geçmiş (nested) yapıları destekler.
 */
export type I18nValue =
  | string
  | number
  | boolean
  | I18nData // iç içe nesne
  | I18nValue[] // iç içe dizi

/**
 * Anahtar-değer çiftlerinden oluşan bir çeviri objesi.
 */
export interface I18nData {
  [key: string]: I18nValue
}

/**
 * Son `translation.json` dosyasının tam yapısı.
 * Bu, hem çeviri verilerini (`I18nData`) hem de `_` ile başlayan
 * meta verilerini (`AllMetaTypes`) birleştiren nihai tiptir.
 */
export type I18nPayload = I18nData & {
  [TKey in `_${string}`]?: AllMetaTypes
}
