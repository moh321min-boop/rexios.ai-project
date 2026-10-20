import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/browser',
  outputDir: './verification/final/test-results',
  timeout: 60000,
  expect: { timeout: 7000 },
  workers: 1,
  retries: 0,
  reporter: [['list'], ['json', { outputFile: 'verification/final/results.json' }]],
  use: {
    baseURL: process.env.QA_BASE_URL || 'http://127.0.0.1:5173',
    channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
    viewport: { width: 1440, height: 1040 },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: process.env.QA_BASE_URL
    ? undefined
    : {
        command: 'npm run dev -- --host 127.0.0.1 --strictPort',
        env: { BROWSER: 'none' },
        url: 'http://127.0.0.1:5173',
        reuseExistingServer: !process.env.CI,
      },
})
