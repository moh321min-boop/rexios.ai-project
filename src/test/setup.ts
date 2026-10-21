import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'
import { setLanguage, LANGUAGE_KEY } from '@/i18n'
import { webcrypto } from 'node:crypto'
Object.defineProperty(window.crypto, 'subtle', { value: webcrypto.subtle, configurable: true })

afterEach(() => {
  cleanup()
  setLanguage('en')
  localStorage.removeItem(LANGUAGE_KEY)
  sessionStorage.clear()
})
