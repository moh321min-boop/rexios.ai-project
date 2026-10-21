import { test, expect } from '@playwright/test'

// Run against `npm run preview` for the normal (not public-demo) production build.
test('normal production disables credentials and ignores persisted demo roles', async ({
  page,
}) => {
  test.skip(process.env.QA_PRODUCTION !== 'true', 'Explicit production preview run only')
  await page.goto('/signin')
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeDisabled()
  await expect(page.getByText(/Mock login is disabled/)).toBeVisible()
  await page.evaluate(() => sessionStorage.setItem('rexios.demo.session.v1', 'demo-solver'))
  await page.goto('/problems/p-101/submit-solution?preview=solver')
  await expect(page).toHaveURL(/\/signin$/)
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeDisabled()
  await page.goto('/signup')
  await expect(page.getByRole('button', { name: 'Sign up', exact: true })).toBeDisabled()
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Where tech skills meet real problems'
  )
})

test('explicit public-demo production build accepts fixture credentials', async ({ page }) => {
  test.skip(process.env.QA_PUBLIC_DEMO !== 'true', 'Explicit public-demo preview run only')
  await page.goto('/signin')
  await page.getByLabel('Email').fill('solver@rexios.demo')
  await page.getByLabel('Password').fill('RexiosDemo123!')
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expect(page).toHaveURL(/\/problems$/)
  await page.goto('/problems/p-101/submit-solution')
  await expect(page.getByLabel('Solution summary')).toBeVisible()
  await page.reload()
  await expect(page.getByLabel('Solution summary')).toBeVisible()
})
