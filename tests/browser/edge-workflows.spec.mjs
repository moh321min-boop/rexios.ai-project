import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

async function login(page, role) {
  await page.goto('/signin')
  await page.getByLabel('Email').fill(`${role}@rexios.demo`)
  await page.getByLabel('Password').fill('RexiosDemo123!')
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expect(page).toHaveURL(/\/(community|problems)$/)
}
test('Community search, category and empty-state controls work through the browser', async ({
  page,
}) => {
  await login(page, 'member')
  await page.getByRole('textbox', { name: 'Search questions' }).fill('no-such-fixture-xyz')
  await expect(page.getByRole('heading', { name: 'No questions found' })).toBeVisible()
  await page.getByRole('button', { name: 'Clear search', exact: true }).click()
  await expect(page.getByRole('textbox', { name: 'Search questions' })).toBeFocused()
  await expect(page.getByRole('heading', { name: 'No questions found' })).toHaveCount(0)
  const category = page
    .getByRole('navigation', { name: 'Question categories' })
    .getByRole('button')
    .nth(1)
  await category.click()
  await expect(category).toHaveAttribute('aria-pressed', 'true')
  await expect(page).toHaveURL(/category=/)
  await page.getByRole('textbox', { name: 'Search questions' }).fill('no-such-fixture-xyz')
  await page.getByRole('button', { name: 'Clear filters' }).click()
  await expect(page).toHaveURL(/\/community$/)
  await page.getByRole('button', { name: 'Unanswered', exact: true }).click()
  await expect(page).toHaveURL(/sort=unanswered/)
  await page.reload()
  await expect(page.getByRole('button', { name: 'Unanswered', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true'
  )
})
test('company discussion, open mobile menu, validation and reduced-motion reflow', async ({
  page,
}, testInfo) => {
  await login(page, 'company')
  await page.goto('/problems/p-101')
  await page
    .getByLabel('Add a comment or question')
    .fill('Company demo clarification about the oven specification.')
  await page.getByRole('button', { name: 'Post comment' }).click()
  const comment = page
    .locator('.problem-comment')
    .filter({ hasText: 'Company demo clarification about the oven specification.' })
  await expect(comment).toContainText('Orient Textile Co.')
  await expect(comment).toContainText('COMPANY')
  await page.setViewportSize({ width: 375, height: 812 })
  // Wait for the breakpoint listener's close-on-resize update before opening.
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
  )
  await page.getByRole('button', { name: 'Open navigation menu' }).click()
  await expect(page.getByRole('button', { name: 'Close navigation menu' })).toHaveAttribute(
    'aria-expanded',
    'true'
  )
  // The approved mobile disclosure exposes account links directly, without
  // the desktop avatar disclosure button.
  await expect(page.getByRole('button', { name: 'Sign out', exact: true })).toBeVisible()
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze()
  await testInfo.attach('open-menu-accessibility', {
    body: JSON.stringify(result.violations),
    contentType: 'application/json',
  })
  expect(result.violations).toEqual([])
  await page.keyboard.press('Escape')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  // A 720x520 CSS viewport models the layout space of 1440x1040 at 200% zoom.
  // This verifies reflow, not the browser's native zoom controls.
  await page.setViewportSize({ width: 720, height: 520 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.getByRole('button', { name: 'Post comment' }).scrollIntoViewIfNeeded()
  await expect(page.getByRole('button', { name: 'Post comment' })).toBeInViewport()
  await page.screenshot({
    path: 'verification/final/screenshots/company-reflow-720.png',
    fullPage: true,
  })
  await page.getByRole('button', { name: 'Open navigation menu' }).click()
  await page.getByRole('button', { name: 'Sign out', exact: true }).click()
  await expect(page).toHaveURL(/\/community$/)
  await page.getByRole('button', { name: 'Open navigation menu' }).click()
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible()
})
