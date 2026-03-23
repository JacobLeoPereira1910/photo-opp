import { expect } from '@playwright/test'

const credentialsByRole = {
  admin: {
    email: 'admin@nexlab.com',
    password: '123456',
    destination: /\/admin$/,
  },
  promoter: {
    email: 'promoter@nexlab.com',
    password: '123456',
    destination: /\/activation$/,
  },
}

export async function loginAs(page, role = 'promoter') {
  const credentials = credentialsByRole[role]

  if (!credentials) {
    throw new Error(`Unsupported role for E2E login: ${role}`)
  }

  await page.goto('/login')
  await page.locator('input[aria-label="E-mail"]').fill(credentials.email)
  await page.locator('input[aria-label="Senha"]').fill(credentials.password)
  await page.getByRole('button', { name: 'Entrar na conta' }).click()

  await expect(page).toHaveURL(credentials.destination)
}
