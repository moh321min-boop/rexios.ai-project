import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { mkdir } from 'node:fs/promises'

const sizes = [
  [320, 600],
  [375, 812],
  [430, 932],
  [768, 1024],
  [1024, 768],
  [1280, 800],
  [1440, 1040],
  [1920, 1080],
]

async function noOverflow(page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
}

async function navbarLayout(page) {
  await expect(page.locator('.site-navbar .language-switch')).toBeVisible()
  const overlaps = await page.locator('.site-navbar').evaluate((header) => {
    const boxes = [
      ...header.querySelectorAll(
        '.navbar-logo img, .navbar-logo span, .navbar-toggle, .navbar-links > *, .navbar-actions > button, .account-toggle, .language-switch'
      ),
    ]
      .filter((element) => element.getClientRects().length)
      .map((element) => ({
        label: element.getAttribute('aria-label') || element.textContent.trim(),
        rect: element.getBoundingClientRect(),
      }))
    return boxes.flatMap((a, i) =>
      boxes
        .slice(i + 1)
        .filter(
          (b) =>
            Math.min(a.rect.right, b.rect.right) - Math.max(a.rect.left, b.rect.left) > 1 &&
            Math.min(a.rect.bottom, b.rect.bottom) - Math.max(a.rect.top, b.rect.top) > 1
        )
        .map((b) => [a.label, b.label])
    )
  })
  expect(overlaps).toEqual([])
  if (page.viewportSize().width >= 1024) {
    const geometry = await page.locator('.site-navbar').evaluate((header) => {
      const links = [...header.querySelectorAll('.navbar-links > *')].map((element) =>
        element.getBoundingClientRect()
      )
      const logo = header.querySelector('.navbar-logo').getBoundingClientRect()
      const note = header.querySelector('.language-switch').getBoundingClientRect()
      return {
        gaps: links.slice(1).map((rect, i) => rect.left - links[i].right),
        centerDifference: Math.abs(logo.top + logo.height / 2 - note.top - note.height / 2),
      }
    })
    const gap = page.viewportSize().width < 1200 ? 0 : 8
    expect(geometry.gaps).toEqual([gap, gap, gap])
    expect(geometry.centerDifference).toBeLessThan(1)
  }
  await noOverflow(page)
}

for (const [width, height] of sizes) {
  test(`landing layout and navigation at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height })
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Where tech skills meet real problems'
    )
    await expect(page.getByRole('img', { name: /Rexios pixel dinosaur/ })).toBeVisible()
    expect(
      await page
        .locator('img')
        .evaluateAll((images) => images.every((image) => image.complete && image.naturalWidth > 0))
    ).toBe(true)
    await noOverflow(page)
    const cards = await page.locator('.landing-step').evaluateAll((elements) =>
      elements.map((element) => {
        const rect = element.getBoundingClientRect()
        return {
          height: rect.height,
          bottom: rect.bottom,
          clipped: element.scrollHeight > element.clientHeight,
        }
      })
    )
    expect(cards.every((card) => !card.clipped)).toBe(true)
    if (width >= 768) {
      expect(new Set(cards.map((card) => card.height)).size).toBe(1)
      expect(new Set(cards.map((card) => card.bottom)).size).toBe(1)
    }
    if (width >= 1024) await navbarLayout(page)
    await mkdir('verification/landing', { recursive: true })
    await page.screenshot({ path: `verification/landing/landing-${width}.png`, fullPage: true })
    if (width < 1024) {
      const toggle = page.getByRole('button', { name: 'Open navigation menu' })
      await toggle.focus()
      await page.keyboard.press('Enter')
      await expect(page.getByRole('button', { name: 'Close navigation menu' })).toHaveAttribute(
        'aria-expanded',
        'true'
      )
      await noOverflow(page)
      await navbarLayout(page)
      await page.screenshot({ path: `verification/landing/menu-${width}.png`, fullPage: true })
      await page.keyboard.press('Escape')
      await expect(toggle).toBeFocused()
      await toggle.click()
    }
    await page.getByRole('navigation').getByRole('button', { name: 'About', exact: true }).click()
    await expect(page.locator('.navbar-notice')).toContainText(
      'The About page is not implemented yet.'
    )
    await page.getByRole('button', { name: 'Dismiss notification' }).click()
    await expect(page.locator('.navbar-notice')).toHaveCount(0)
    if (width < 1024)
      await expect(page.getByRole('button', { name: 'Open navigation menu' })).toHaveAttribute(
        'aria-expanded',
        'false'
      )
    await page.getByRole('link', { name: 'Browse as a visitor' }).first().click()
    await expect(page).toHaveURL(/\/community$/)
  })
}

for (const width of [375, 1440]) {
  test(`landing accessibility at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1040 })
    await page.goto('/')
    expect(
      (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze())
        .violations
    ).toEqual([])
  })
}

test('landing signup links and signed-in responsive navbar', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Get started', exact: true }).click()
  await expect(page).toHaveURL(/\/signup$/)
  await page.goto('/')
  await page.getByRole('link', { name: 'Create a free account', exact: true }).click()
  await expect(page).toHaveURL(/\/signup$/)
  await page.goto('/signin')
  await page.getByLabel('Email').fill('member@rexios.demo')
  await page.getByLabel('Password').fill('RexiosDemo123!')
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expect(page).toHaveURL(/\/community$/)
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Account menu' })).toBeVisible()
  await navbarLayout(page)
  await page.screenshot({ path: 'verification/landing/member-1440.png', fullPage: true })
  await page.setViewportSize({ width: 320, height: 600 })
  await page.getByRole('button', { name: 'Open navigation menu' }).click()
  await expect(page.getByRole('button', { name: 'Sign out', exact: true })).toBeVisible()
  await noOverflow(page)
  await page.setViewportSize({ width: 1440, height: 1040 })
  await page.setViewportSize({ width: 375, height: 812 })
  await expect(page.getByRole('button', { name: 'Open navigation menu' })).toHaveAttribute(
    'aria-expanded',
    'false'
  )
})

for (const width of [375, 768, 1440, 1920]) {
  test(`navbar active state follows client-side navigation at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1040 })
    await page.goto('/')
    // A document marker proves these transitions do not reload the application.
    await page.evaluate(() => {
      window.rexiosNavigationCheck = true
    })
    const nav = page.getByRole('navigation', { name: 'Main navigation' })
    async function openMenu() {
      const toggle = page.getByRole('button', { name: 'Open navigation menu' })
      if (await toggle.isVisible()) await toggle.click()
    }
    for (const [label, path] of [
      ['Home', '/'],
      ['Community', '/community'],
      ['Problems', '/problems'],
      ['Home', '/'],
    ]) {
      await openMenu()
      await nav.getByRole('link', { name: label, exact: true }).click()
      await expect(page).toHaveURL(new RegExp(`${path}$`))
      await openMenu()
      await page.mouse.move(0, 0)
      await expect(nav.locator('[aria-current="page"]')).toHaveText(label)
      await expect(nav.getByRole('link', { name: label, exact: true })).toHaveCSS(
        'background-color',
        'rgb(238, 241, 255)'
      )
      for (const inactive of ['Home', 'Community', 'Problems'].filter((name) => name !== label)) {
        await expect(nav.getByRole('link', { name: inactive, exact: true })).toHaveCSS(
          'background-color',
          'rgba(0, 0, 0, 0)'
        )
      }
      expect(await page.evaluate(() => window.rexiosNavigationCheck)).toBe(true)
      await noOverflow(page)
      await page
        .locator('.site-navbar')
        .screenshot({ path: `verification/landing/navbar-${label.toLowerCase()}-${width}.png` })
    }
    await nav.getByRole('link', { name: 'Community', exact: true }).hover()
    await expect(nav.locator('[aria-current="page"]')).toHaveText('Home')
    await page.mouse.move(0, 0)
    await expect(nav.getByRole('link', { name: 'Community', exact: true })).toHaveCSS(
      'background-color',
      'rgba(0, 0, 0, 0)'
    )
    for (const [path, active] of [
      ['/community/questions/q-101', 'Community'],
      ['/problems/p-101', 'Problems'],
    ]) {
      await page.goto(path)
      await openMenu()
      await expect(nav.locator('[aria-current="page"]')).toHaveText(active)
    }
    for (const path of ['/signin', '/signup']) {
      await page.goto(path)
      await expect(page.locator('.navbar-links [aria-current="page"]')).toHaveCount(0)
    }
  })
}
