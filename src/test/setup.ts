import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'
import { webcrypto } from 'node:crypto'
Object.defineProperty(window.crypto, 'subtle', { value: webcrypto.subtle, configurable: true })

afterEach(() => {
  cleanup()
  sessionStorage.clear()
})
