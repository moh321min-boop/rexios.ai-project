import { t } from './index'

/** Only known, unchanged fixture text is localized. User-authored values stay untouched. */
export function fixtureText(value: string | undefined, original: string | undefined) {
  return value !== undefined && value === original ? t(value) : (value ?? '')
}
