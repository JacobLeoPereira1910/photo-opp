import { test, expect } from '@playwright/test'

const apiBaseUrl = globalThis.process?.env?.PLAYWRIGHT_API_BASE_URL || 'http://127.0.0.1:3333'

test('expired QR public page shows a recovery message', async ({ page }) => {
  await page.goto(`${apiBaseUrl}/api/v1/activation/photos/playwright-expired-demo/access`)

  await expect(page.getByRole('heading', { name: /Este QR Code expirou/i })).toBeVisible()
  await expect(page.getByText(/Volte ao promotor para gerar um novo acesso/i)).toBeVisible()
  await expect(page.getByText(/Acesso expirado/i)).toBeVisible()
})
