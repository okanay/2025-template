import {
  argbFromHex,
  Hct,
  hexFromArgb,
  rgbaFromArgb,
  MaterialDynamicColors,
  SchemeContent,
  SchemeTonalSpot,
  SchemeVibrant,
  SchemeExpressive,
  SchemeFidelity,
  SchemeMonochrome,
  SchemeNeutral,
  DynamicScheme,
} from '@material/material-color-utilities'
import { writeFileSync } from 'fs'
import { join } from 'path'

// ===== TİP TANIMLAMALARI =====
type ColorFormat = 'hex' | 'oklch' | 'rgb'
type SchemeType =
  | 'content'
  | 'tonalSpot'
  | 'vibrant'
  | 'expressive'
  | 'fidelity'
  | 'monochrome'
  | 'neutral'

interface ThemeConfig {
  sourceColor: string
  customColors: Record<string, string>
  scheme: SchemeType
  contrastLevel: number // -1.0 (düşük), 0 (standart), 0.5 (orta), 1.0 (yüksek)
  outputFormat: ColorFormat
  outputFile: string // Çıktı dosya adı
}

interface CustomColorTokens {
  color: number
  onColor: number
  colorContainer: number
  onColorContainer: number
}

// ===== KONFIGURASYON =====
const CONFIG: ThemeConfig = {
  sourceColor: '#A674FF',
  customColors: {},
  scheme: 'content',
  contrastLevel: 0,
  outputFormat: 'rgb',
  outputFile: 'm3-theme.css',
}

// ===== YARDIMCI FONKSİYONLAR =====
const SCHEME_CLASSES = {
  content: SchemeContent,
  tonalSpot: SchemeTonalSpot,
  vibrant: SchemeVibrant,
  expressive: SchemeExpressive,
  fidelity: SchemeFidelity,
  monochrome: SchemeMonochrome,
  neutral: SchemeNeutral,
} as const

const getSchemeClass = (schemeName: SchemeType) => {
  return SCHEME_CLASSES[schemeName] || SchemeContent
}

const toKebabCase = (str: string): string => {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase()
}

// Renk formatlarını dönüştürme fonksiyonu
const formatColor = (argb: number, format: ColorFormat): string => {
  switch (format) {
    case 'hex':
      return hexFromArgb(argb)

    case 'rgb': {
      const { r, g, b } = rgbaFromArgb(argb)
      return `rgb(${r} ${g} ${b})`
    }

    case 'oklch': {
      const hct = Hct.fromInt(argb)
      const lightness = (hct.tone / 100).toFixed(4)
      const chroma = hct.chroma.toFixed(4)
      const hue = hct.hue.toFixed(4)
      return `oklch(${lightness} ${chroma} ${hue})`
    }

    default:
      return hexFromArgb(argb)
  }
}

// Custom renkler için DynamicScheme oluşturma
const createCustomColorScheme = (
  name: string,
  value: number,
  isDark: boolean,
  contrastLevel: number,
): CustomColorTokens => {
  const hct = Hct.fromInt(value)
  const SchemeClass = getSchemeClass(CONFIG.scheme)
  const scheme = new SchemeClass(hct, isDark, contrastLevel)

  // Dinamik renk anahtarları oluştur
  const colorKey = name as keyof typeof MaterialDynamicColors
  const onColorKey =
    `on${name.charAt(0).toUpperCase() + name.slice(1)}` as keyof typeof MaterialDynamicColors
  const containerKey = `${name}Container` as keyof typeof MaterialDynamicColors
  const onContainerKey =
    `on${name.charAt(0).toUpperCase() + name.slice(1)}Container` as keyof typeof MaterialDynamicColors

  return {
    color: (MaterialDynamicColors as any)[colorKey]?.getArgb(scheme) || value,
    onColor:
      (MaterialDynamicColors as any)[onColorKey]?.getArgb(scheme) ||
      (isDark ? 0xff000000 : 0xffffffff),
    colorContainer:
      (MaterialDynamicColors as any)[containerKey]?.getArgb(scheme) || scheme.primaryContainer,
    onColorContainer:
      (MaterialDynamicColors as any)[onContainerKey]?.getArgb(scheme) ||
      (isDark ? 0xffffffff : 0xff000000),
  }
}

// ===== SEMANTİK TOKEN'LARI OLUŞTURMA =====
const generateSemanticTokens = (
  sourceColor: number,
  customColors: Record<string, string>,
  format: ColorFormat,
  contrastLevel: number,
): string => {
  const sourceHct = Hct.fromInt(sourceColor)
  const SchemeClass = getSchemeClass(CONFIG.scheme)

  // Light ve Dark tema şemaları
  const lightScheme = new SchemeClass(sourceHct, false, contrastLevel)
  const darkScheme = new SchemeClass(sourceHct, true, contrastLevel)

  const generateSchemeCss = (scheme: DynamicScheme, isDark: boolean): string => {
    const cssLines: string[] = []

    // Material Design renk rolleri
    const colorRoles = {
      // Primary grup
      primary: MaterialDynamicColors.primary,
      'on-primary': MaterialDynamicColors.onPrimary,
      'primary-container': MaterialDynamicColors.primaryContainer,
      'on-primary-container': MaterialDynamicColors.onPrimaryContainer,

      // Secondary grup
      secondary: MaterialDynamicColors.secondary,
      'on-secondary': MaterialDynamicColors.onSecondary,
      'secondary-container': MaterialDynamicColors.secondaryContainer,
      'on-secondary-container': MaterialDynamicColors.onSecondaryContainer,

      // Tertiary grup
      tertiary: MaterialDynamicColors.tertiary,
      'on-tertiary': MaterialDynamicColors.onTertiary,
      'tertiary-container': MaterialDynamicColors.tertiaryContainer,
      'on-tertiary-container': MaterialDynamicColors.onTertiaryContainer,

      // Error grup
      error: MaterialDynamicColors.error,
      'on-error': MaterialDynamicColors.onError,
      'error-container': MaterialDynamicColors.errorContainer,
      'on-error-container': MaterialDynamicColors.onErrorContainer,

      // Background ve Surface
      background: MaterialDynamicColors.background,
      'on-background': MaterialDynamicColors.onBackground,
      surface: MaterialDynamicColors.surface,
      'on-surface': MaterialDynamicColors.onSurface,
      'surface-variant': MaterialDynamicColors.surfaceVariant,
      'on-surface-variant': MaterialDynamicColors.onSurfaceVariant,

      // Outline ve diğerleri
      outline: MaterialDynamicColors.outline,
      'outline-variant': MaterialDynamicColors.outlineVariant,
      shadow: MaterialDynamicColors.shadow,
      scrim: MaterialDynamicColors.scrim,
      'surface-tint': MaterialDynamicColors.surfaceTint,

      // Inverse renkler
      'inverse-surface': MaterialDynamicColors.inverseSurface,
      'inverse-on-surface': MaterialDynamicColors.inverseOnSurface,
      'inverse-primary': MaterialDynamicColors.inversePrimary,

      // Surface konteynerler
      'surface-container-lowest': MaterialDynamicColors.surfaceContainerLowest,
      'surface-container-low': MaterialDynamicColors.surfaceContainerLow,
      'surface-container': MaterialDynamicColors.surfaceContainer,
      'surface-container-high': MaterialDynamicColors.surfaceContainerHigh,
      'surface-container-highest': MaterialDynamicColors.surfaceContainerHighest,
    }

    // Ana renkleri ekle
    Object.entries(colorRoles).forEach(([key, dynamicColor]) => {
      const colorValue = formatColor(dynamicColor.getArgb(scheme), format)
      cssLines.push(`    --color-${key}: ${colorValue};`)
    })

    cssLines.push('') // Boşluk

    // Custom renkleri ekle
    Object.entries(customColors).forEach(([name, value]) => {
      const customTokens = createCustomColorScheme(name, argbFromHex(value), isDark, contrastLevel)

      cssLines.push(`    --color-${name}: ${formatColor(customTokens.color, format)};`)
      cssLines.push(`    --color-on-${name}: ${formatColor(customTokens.onColor, format)};`)
      cssLines.push(
        `    --color-${name}-container: ${formatColor(customTokens.colorContainer, format)};`,
      )
      cssLines.push(
        `    --color-on-${name}-container: ${formatColor(customTokens.onColorContainer, format)};`,
      )
    })

    return cssLines.join('\n').trimEnd()
  }

  // Light ve dark tema CSS'lerini oluştur
  const lightCss = generateSchemeCss(lightScheme, false)
  const darkCss = generateSchemeCss(darkScheme, true)

  return `${lightCss}
  }

  /* Dark theme */
  .dark {
${darkCss}
  }`
}

// ===== TAILWIND V4 THEME OLUŞTURMA =====
const generateTailwindV4Theme = (): string => {
  const sourceColor = argbFromHex(CONFIG.sourceColor)

  const semanticTokens = generateSemanticTokens(
    sourceColor,
    CONFIG.customColors,
    CONFIG.outputFormat,
    CONFIG.contrastLevel,
  )

  return `/*
 * Material Design 3 Theme for Tailwind CSS v4
 * Generated with:
 *   - Source Color: ${CONFIG.sourceColor}
 *   - Scheme: ${CONFIG.scheme}
 *   - Contrast: ${CONFIG.contrastLevel}
 *   - Format: ${CONFIG.outputFormat}
 */

@theme {
${semanticTokens}
}`
}

// ===== DOSYAYA YAZMA =====
const saveThemeToFile = (): void => {
  try {
    const theme = generateTailwindV4Theme()
    const filePath = join(process.cwd(), CONFIG.outputFile)

    writeFileSync(filePath, theme, 'utf-8')
  } catch (error) {
    console.error('❌ Dosya yazılırken hata oluştu:', error)
  }
}

// Çalıştır
saveThemeToFile()
