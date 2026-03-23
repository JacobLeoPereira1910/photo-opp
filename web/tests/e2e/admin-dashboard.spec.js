import { test, expect } from '@playwright/test'
import { loginAs } from './helpers/auth.js'

test('admin can navigate sections and apply photo and log filters', async ({ page }) => {
  await loginAs(page, 'admin')

  await expect(page.getByRole('heading', { name: /Painel de operação/i })).toBeVisible()

  await page.locator('nav').getByRole('button', { name: /Fotos e QR/i }).click()
  await expect(page.getByRole('heading', { name: /Fotos e QR Codes/i })).toBeVisible()

  await page.getByLabel('Buscar fotos').fill('nexlab')
  await page.getByLabel('Status das fotos').selectOption('ready')
  await page.getByRole('button', { name: 'Filtrar' }).click()

  await expect(page.getByLabel('Buscar fotos')).toHaveValue('nexlab')
  await expect(page.getByLabel('Status das fotos')).toHaveValue('ready')

  await page.locator('nav').getByRole('button', { name: /Logs/i }).click()
  await expect(page.getByRole('heading', { name: /Rastreabilidade/i })).toBeVisible()

  await page.getByLabel('Ação dos logs').selectOption('auth.login.success')
  await page.getByRole('button', { name: 'Filtrar' }).click()

  await expect(page.getByLabel('Ação dos logs')).toHaveValue('auth.login.success')
  await expect(page.getByRole('button', { name: /Exportar CSV/i })).toBeVisible()
})
