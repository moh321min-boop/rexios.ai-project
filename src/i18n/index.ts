import { useSyncExternalStore } from 'react'
import en from './en.json'
import ar from './ar.json'

export type Language = 'en' | 'ar'
export type TranslationKey = keyof typeof en
export const LANGUAGE_KEY = 'rexios.language'
export const resources = { en, ar }
const listeners = new Set<() => void>()
const englishKeys = new Map(Object.entries(en).map(([key, value]) => [value, key]))
function savedLanguage(): Language {
  try {
    return localStorage.getItem(LANGUAGE_KEY) === 'ar' ? 'ar' : 'en'
  } catch {
    return 'en'
  }
}
let language = savedLanguage()
function updateDocument() {
  if (typeof document === 'undefined') return
  document.documentElement.lang = language
  document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
}
updateDocument()
export function setLanguage(next: Language) {
  if (next !== 'en' && next !== 'ar') return
  language = next
  try {
    localStorage.setItem(LANGUAGE_KEY, next)
  } catch {
    // The preference still works in memory if browser storage is unavailable.
  }
  updateDocument()
  listeners.forEach((listener) => listener())
}
export const getLanguage = () => language
const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
/** Subscription only: switching language never remounts routes or auth/form providers. */
export function useI18n() {
  const current = useSyncExternalStore(subscribe, getLanguage, () => 'en' as Language)
  return { language: current, setLanguage, t }
}
export function formatNumber(value: number) {
  return new Intl.NumberFormat(language === 'ar' ? 'ar-DZ' : 'en-US').format(value)
}
type Values = Record<string, string | number>
/**
 * UI keys are canonical. Existing validation/fixture labels also resolve through the
 * English catalog so their stored values and business comparisons never change.
 * Do not pass user-written content through this function.
 */
export function t(key: TranslationKey | string | number | undefined, values: Values = {}): string {
  if (typeof key === 'number') return formatNumber(key)
  if (!key) return ''
  const resolved =
    Object.hasOwn(en, key) || Object.hasOwn(en, `${key}_other`) ? key : englishKeys.get(key)
  if (!resolved) {
    if (language === 'ar') {
      const relative = key.match(/^(\d+)\s+(minute|hour|day|week|month|year)s?\s+ago$/i)
      if (relative)
        return new Intl.RelativeTimeFormat('ar', { numeric: 'always' }).format(
          -Number(relative[1]),
          relative[2]!.toLowerCase() as Intl.RelativeTimeFormatUnit
        )
    }
    return key
  }
  let resourceKey = resolved
  if (typeof values.count === 'number') {
    const form = new Intl.PluralRules(language).select(values.count)
    if (Object.hasOwn(en, `${resolved}_${form}`)) resourceKey = `${resolved}_${form}`
  }
  const catalog = resources[language] as Record<string, string>
  return (catalog[resourceKey] ?? en[resourceKey as TranslationKey]).replace(
    /\{\{(\w+)\}\}/g,
    (_, name: string) =>
      typeof values[name] === 'number' ? formatNumber(values[name]) : String(values[name] ?? '')
  )
}
