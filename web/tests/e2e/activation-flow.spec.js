import { test, expect } from '@playwright/test'
import { loginAs } from './helpers/auth.js'
import { mockActivationCamera } from './helpers/mock-camera.js'

test('promoter completes the flow until the QR delivery screen', async ({ page }) => {
  await mockActivationCamera(page)
  await loginAs(page, 'promoter')

  await expect(page.getByRole('heading', { name: /Photo Opp/i })).toBeVisible()
  await page.getByRole('button', { name: /Iniciar/i }).click()

  await expect(page).toHaveURL(/\/activation\/camera$/)
  await expect(page.getByRole('heading', { name: /Capture o momento/i })).toBeVisible()
  await expect(page.getByTestId('capture-button')).toBeEnabled()

  await page.getByTestId('capture-button').click()

  await expect(page).toHaveURL(/\/activation\/review$/, {
    timeout: 20_000,
  })

  await page.getByRole('button', { name: 'Continuar' }).click()

  await expect(page).toHaveURL(/\/activation\/share$/)
  await expect(page.getByRole('heading', { name: /Aponte a camera do celular para o QR Code/i })).toBeVisible()
  await expect(page.getByRole('img', { name: 'QR code da foto' })).toBeVisible()
  await expect(page.getByRole('link', { name: /Abrir página pública/i })).toBeVisible()
})
