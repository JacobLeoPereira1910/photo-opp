import { defineConfig } from '@playwright/test'

const env = globalThis.process?.env ?? {}

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 45_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  workers: 1,
  retries: env.CI ? 2 : 0,
  reporter: env.CI ? [['html'], ['list']] : [['list']],
  use: {
    baseURL: env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:5173',
    headless: true,
    channel: env.PLAYWRIGHT_BROWSER_CHANNEL || 'chrome',
    viewport: {
      width: 1440,
      height: 1024,
    },
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
  },
})
