import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { mkdir } from 'node:fs/promises'

const password = 'RexiosDemo123!'
const sessionKey = 'rexios.demo.session.v1'
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
const screens = [
  ['visitor', 'signup', '/signup'],
  ['visitor', 'signin', '/signin'],
  ['visitor', 'community-visitor', '/community'],
  ['visitor', 'question-visitor', '/community/questions/q-101'],
  ['member', 'community-member', '/community'],
  ['member', 'question-member', '/community/questions/q-101'],
  ['member', 'ask', '/community/ask'],
  ['member', 'welcome', '/account-activated'],
  ['incomplete', 'profile', '/profile-setup'],
  ['incomplete', 'problems-list', '/problems'],
  ['incomplete', 'problem-incomplete', '/problems/p-101'],
  ['solver', 'problem-solver', '/problems/p-101'],
  ['solver', 'solution', '/problems/p-101/submit-solution'],
  ['company', 'problem-company', '/problems/p-101'],
]
async function credentials(page, role, secret = password) {
  await page.getByLabel('Email', { exact: false }).fill(`${role}@rexios.demo`)
  await page.getByLabel('Password', { exact: false }).fill(secret)
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
}
async function login(page, role) {
  await page.goto('/signin')
  await credentials(page, role)
  await expect(page).toHaveURL(role === 'member' ? /\/community$/ : /\/problems$/)
}
async function logout(page) {
  const menu = page.getByRole('button', { name: 'Open navigation menu' })
  if (await menu.isVisible()) await menu.click()
  const account = page.getByRole('button', { name: 'Account menu' })
  if (await account.isVisible()) await account.click()
  await page.getByRole('button', { name: 'Sign out', exact: true }).click()
  await expect(page).toHaveURL(/\/community$/)
  await expect(page.getByRole('button', { name: 'Account menu' })).toHaveCount(0)
}
async function signInAgain(page, role) {
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await credentials(page, role)
  await expect(page).toHaveURL(/\/community$/)
}
async function layout(page) {
  await page.evaluate(() => document.fonts.ready)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  const broken = await page
    .locator('img')
    .evaluateAll((imgs) =>
      imgs.filter((i) => !i.complete || !i.naturalWidth).map((i) => i.getAttribute('src'))
    )
  expect(broken).toEqual([])
  const controls = await page
    .locator('input:not([type=hidden]):not([type=file]), textarea, select')
    .evaluateAll((nodes) =>
      nodes
        .filter(
          (n) =>
            n.getClientRects().length &&
            (n.getBoundingClientRect().right > innerWidth + 1 || n.getBoundingClientRect().left < 0)
        )
        .map((n) => n.outerHTML)
    )
  expect(controls).toEqual([])
}
async function nav(page, width) {
  const header = page.locator('.site-navbar')
  if (!(await header.count())) return
  const toggle = page.getByRole('button', { name: 'Open navigation menu' })
  const home = page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Home', exact: true })
  if (width < 1024) {
    await expect(toggle).toBeVisible()
    await expect(home).not.toBeVisible()
    const logo = await page.locator('.navbar-logo').boundingBox(),
      button = await toggle.boundingBox()
    expect(logo.x + logo.width).toBeLessThanOrEqual(button.x)
    await toggle.focus()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('button', { name: 'Close navigation menu' })).toHaveAttribute(
      'aria-expanded',
      'true'
    )
    await expect(home).toBeVisible()
    await page.keyboard.press('Tab')
    await expect(home).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(toggle).toBeFocused()
    await expect(home).not.toBeVisible()
    await toggle.click()
    await page.setViewportSize({ width: 1100, height: 800 })
    await expect(home).toBeVisible()
    await page.setViewportSize({ width, height: sizes.find((s) => s[0] === width)[1] })
    await expect(home).not.toBeVisible()
  } else {
    await expect(toggle).not.toBeVisible()
    await expect(home).toBeVisible()
    const boxes = await page
      .locator('.navbar-row > *, .navbar-links > *, .navbar-actions > *')
      .evaluateAll((ns) =>
        ns
          .filter((n) => n.getClientRects().length)
          .map((n) => ({
            left: n.getBoundingClientRect().left,
            right: n.getBoundingClientRect().right,
          }))
      )
    expect(boxes.every((b) => b.left >= 0 && b.right <= width)).toBe(true)
  }
}
for (const [role, name, path] of screens) {
  test(`responsive ${name}: all eight viewports`, async ({ page }) => {
    test.setTimeout(120000)
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    if (role !== 'visitor') await login(page, role)
    await page.goto(path)
    await mkdir('verification/final/screenshots', { recursive: true })
    for (const [width, height] of sizes) {
      await page.setViewportSize({ width, height })
      await layout(page)
      await nav(page, width)
      await layout(page)
      await page.screenshot({
        path: `verification/final/screenshots/${name}-${width}.png`,
        fullPage: true,
      })
    }
    expect(errors).toEqual([])
  })
}
for (const role of ['member', 'solver', 'incomplete', 'company']) {
  test(`credentials, refresh, identity and logout: ${role}`, async ({ page }) => {
    await login(page, role)
    expect(await page.evaluate((key) => sessionStorage.getItem(key), sessionKey)).toBe(
      `demo-${role}`
    )
    await page.reload()
    await page.getByRole('button', { name: 'Account menu' }).click()
    await expect(page.getByText('Demo account ·', { exact: false })).toBeVisible()
    if (role === 'company')
      await expect(page.getByRole('link', { name: 'Solver profile', exact: true })).toHaveCount(0)
    await page.keyboard.press('Escape')
    await logout(page)
    expect(await page.evaluate((key) => sessionStorage.getItem(key), sessionKey)).toBeNull()
    await page.reload()
    await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible()
  })
}
test('invalid credentials, legacy query and protected return destination', async ({ page }) => {
  await page.goto('/community?preview=solver')
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible()
  await page.goto('/problems/p-101/submit-solution')
  await expect(page).toHaveURL(/\/signin$/)
  await credentials(page, 'solver', 'wrong-password')
  await expect(page.getByText(/Email or password is incorrect/)).toBeVisible()
  await expect(page.getByLabel('Password')).toBeFocused()
  await credentials(page, 'unknown')
  await expect(page.getByText(/Email or password is incorrect/)).toBeVisible()
  await credentials(page, 'solver')
  await expect(page).toHaveURL(/\/problems\/p-101\/submit-solution$/)
  await logout(page)
  await page.evaluate((key) => sessionStorage.setItem(key, 'admin'), sessionKey)
  await page.goto('/community/ask')
  await expect(page).toHaveURL(/\/signin$/)
  expect(await page.evaluate((key) => sessionStorage.getItem(key), sessionKey)).toBeNull()
})
test('member and company cannot submit; missing problems are honest', async ({ page }) => {
  for (const role of ['member', 'company']) {
    await login(page, role)
    await page.goto('/problems/p-101/submit-solution')
    await expect(
      page.getByRole('heading', {
        name:
          role === 'company' ? 'Solution submission unavailable' : 'Complete your solver profile',
      })
    ).toBeVisible()
    await expect(page.getByLabel('Solution summary')).toHaveCount(0)
    await logout(page)
  }
  await page.goto('/problems/missing')
  await expect(page.getByRole('heading', { name: 'Problem not found' })).toBeVisible()
  await page.goto('/problems/p-102')
  await expect(page.getByText(/Detailed requirements and attachments/)).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Deliverables' })).toHaveCount(0)
})
test('incomplete profile validation, completion, refresh and curated storage', async ({ page }) => {
  await login(page, 'incomplete')
  await page.goto('/problems/p-101')
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '40')
  await page.getByRole('link', { name: 'Complete solver profile' }).click()
  await page.getByRole('button', { name: 'Save solver profile' }).click()
  await expect(page.getByText('Upload your CV or add at least one link below')).toBeVisible()
  await page
    .getByLabel('CV (résumé) *', { exact: true })
    .setInputFiles({ name: 'empty.pdf', mimeType: 'application/pdf', buffer: Buffer.alloc(0) })
  await expect(page.getByText('Choose a PDF or DOCX file up to 5MB.')).toBeVisible()
  await page.getByLabel('GitHub / personal website').fill('https://example.com/demo-profile')
  await page.getByRole('button', { name: 'Save solver profile' }).click()
  await expect(page).toHaveURL(/\/problems\/p-101$/)
  await expect(page.getByRole('link', { name: 'Submit a solution', exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('link', { name: 'Submit a solution', exact: true })).toBeVisible()
  const stored = await page.evaluate(() => ({
    session: { ...sessionStorage },
    local: { ...localStorage },
  }))
  expect(Object.keys(stored.session).sort()).toEqual(['rexios.demo.profiles.v1', sessionKey].sort())
  expect(JSON.stringify(stored)).not.toMatch(/example\.com|@|RexiosDemo|Amine|\.pdf/)
  expect(stored.local).toEqual({})
})
test('problem search, filter reset, draft, uploads, submission dialog and duplicate guard', async ({
  page,
}) => {
  await login(page, 'solver')
  await page.getByRole('textbox', { name: 'Search problems' }).fill('oven')
  await expect(page.locator('article.problem-card')).toHaveCount(1)
  // React Router commits URL-backed controls in a transition; wait for that
  // controlled state instead of check()'s immediate post-click state assertion.
  await page.getByRole('checkbox', { name: 'Expert' }).click()
  await expect(page.getByRole('checkbox', { name: 'Expert' })).toBeChecked()
  await expect(page.getByRole('heading', { name: 'No matching problems' })).toBeVisible()
  await page.getByRole('button', { name: 'Reset', exact: true }).click()
  await expect(page.locator('article.problem-card')).toHaveCount(4)
  await page.locator('article.problem-card h2 a').first().click()
  await page.getByRole('link', { name: 'Submit a solution', exact: true }).click()
  await page.getByRole('button', { name: 'Submit solution', exact: true }).click()
  await expect(page.getByLabel('Solution summary')).toBeFocused()
  await page
    .getByLabel('Solution summary')
    .fill('Calibrate an ESP32 sensor and show readings in a monitoring dashboard.')
  await page.getByLabel('Link to previous work or a demo').fill('javascript:alert(1)')
  await page.getByRole('button', { name: 'Submit solution', exact: true }).click()
  await expect(page.getByText('Enter a complete http:// or https:// URL.')).toBeVisible()
  await page.getByRole('button', { name: 'Save as draft' }).click()
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await page.getByRole('link', { name: 'Submit a solution', exact: true }).click()
  await expect(page.getByLabel('Solution summary')).toHaveValue(/Calibrate/)
  await page.getByLabel('Link to previous work or a demo').fill('https://example.com/solution')
  await page
    .getByLabel('Attachments (optional)', { exact: true })
    .setInputFiles({ name: 'bad.txt', mimeType: 'text/plain', buffer: Buffer.from('test') })
  await expect(page.getByText('Choose a non-empty PDF or DOCX file up to 5MB.')).toBeVisible()
  await page.getByLabel('Attachments (optional)', { exact: true }).setInputFiles({
    name: 'demo.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4 demo fixture'),
  })
  await page.getByRole('checkbox', { name: /I confirm this work/ }).check()
  await page.getByRole('button', { name: 'Submit solution', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Local solution preview saved' })
  await expect(dialog).toBeVisible()
  await expect(dialog).toContainText('Nothing was uploaded or sent to a company')
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('Tab')
    expect(await dialog.evaluate((d) => d.contains(document.activeElement))).toBe(true)
  }
  await page.keyboard.press('Escape')
  await expect(dialog).not.toBeVisible()
  await expect(page.getByRole('button', { name: 'Submit solution', exact: true })).toBeDisabled()
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await page.getByRole('link', { name: 'Submit a solution', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Submit solution', exact: true })).toBeDisabled()
  await page.reload()
  await expect(page.getByRole('button', { name: 'Submit solution', exact: true })).toBeEnabled()
})
test('community drafts and reactions are isolated between accounts; posting and answering work', async ({
  page,
}) => {
  await login(page, 'member')
  await page.goto('/community/questions/q-101')
  await page.getByRole('button', { name: 'Helpful 12', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Helpful 13', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true'
  )
  await page.getByRole('button', { name: 'Ask a question', exact: true }).first().click()
  await page.getByRole('button', { name: 'Post question' }).click()
  await expect(page.getByLabel('Question title')).toBeFocused()
  await page.getByLabel('Question title').fill('How should I calibrate the workshop sensor?')
  await page
    .getByLabel('Problem details')
    .fill(
      'The calibrated reference differs from the workshop sensor and I need advice on the calibration process.'
    )
  await page.getByRole('button', { name: 'IoT', exact: true }).click()
  await page.getByRole('button', { name: 'Save as draft' }).click()
  await logout(page)
  await signInAgain(page, 'solver')
  await page.getByRole('button', { name: 'Ask a question', exact: true }).first().click()
  await expect(page.getByLabel('Question title')).toHaveValue('')
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await page.locator('.navbar-links').getByRole('link', { name: 'Community', exact: true }).click()
  // Use the real question link, preserving provider state during account switches.
  await page.locator('a[href="/community/questions/q-101"]').first().click()
  await expect(page.getByRole('button', { name: 'Helpful 12', exact: true })).toHaveAttribute(
    'aria-pressed',
    'false'
  )
  await logout(page)
  await signInAgain(page, 'member')
  await page.locator('a[href="/community/questions/q-101"]').first().click()
  await expect(page.getByRole('button', { name: 'Helpful 13', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true'
  )
  await page.getByRole('button', { name: 'Ask a question', exact: true }).first().click()
  await expect(page.getByLabel('Question title')).toHaveValue(
    'How should I calibrate the workshop sensor?'
  )
  await page.getByRole('button', { name: 'Post question' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'How should I calibrate the workshop sensor?'
  )
  await page
    .getByLabel('Your answer')
    .fill(
      'Compare the readings at several stable temperatures before adjusting the calibration offset.'
    )
  await page.getByRole('button', { name: 'Post answer' }).click()
  await expect(page.getByRole('heading', { name: '1 answer', exact: true })).toBeVisible()
})
test('temporary signup is honest, works in memory and disappears on reload', async ({ page }) => {
  await page.goto('/signup')
  await page.getByLabel('Email').fill('temporary-test@example.com')
  await page.getByLabel('Password *', { exact: true }).fill('Temporary123!')
  await page.getByLabel('Confirm password').fill('Temporary123!')
  await page.getByRole('checkbox').check()
  await page.getByRole('button', { name: 'Sign up', exact: true }).click()
  await expect(page).toHaveURL(/\/account-activated$/)
  expect(
    await page.evaluate(() => JSON.stringify({ ...sessionStorage, ...localStorage }))
  ).not.toMatch(/Temporary123|temporary-test/)
  await logout(page)
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await page.getByLabel('Email').fill('temporary-test@example.com')
  await page.getByLabel('Password').fill('Temporary123!')
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expect(page).toHaveURL(/\/community$/)
  await page.reload()
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await page.getByLabel('Email').fill('temporary-test@example.com')
  await page.getByLabel('Password').fill('Temporary123!')
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expect(page.getByText(/Email or password is incorrect/)).toBeVisible()
})
test('landing, mobile navigation link close, long content and short laptop', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Where tech skills meet real problems'
  )
  await login(page, 'solver')
  await page.setViewportSize({ width: 375, height: 812 })
  await page.getByRole('button', { name: 'Open navigation menu' }).click()
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Community' })
    .click()
  await expect(page.getByRole('button', { name: 'Open navigation menu' })).toHaveAttribute(
    'aria-expanded',
    'false'
  )
  await page.goto('/problems/p-101/submit-solution')
  await page.setViewportSize({ width: 1280, height: 600 })
  const field = page.getByLabel('Solution summary')
  await field.fill('Responsive sensor calibration. '.repeat(150))
  expect(await field.evaluate((e) => e.scrollHeight <= e.clientHeight + 2)).toBe(true)
  await page.getByRole('button', { name: 'Submit solution', exact: true }).scrollIntoViewIfNeeded()
  await expect(page.getByRole('button', { name: 'Submit solution', exact: true })).toBeInViewport()
  await layout(page)
})
test('problem drafts and submissions are isolated by account; comments stay on their problem', async ({
  page,
}) => {
  await login(page, 'solver')
  await page.goto('/problems/p-101/submit-solution')
  await page.getByLabel('Solution summary').fill('Karim private local draft for the oven.')
  await page.getByRole('button', { name: 'Save as draft' }).click()
  await logout(page)
  await signInAgain(page, 'incomplete')
  await page.locator('.navbar-links').getByRole('link', { name: 'Problems', exact: true }).click()
  await page.locator('article.problem-card h2 a').first().click()
  await page.getByRole('link', { name: 'Complete solver profile' }).click()
  await page.getByLabel('GitHub / personal website').fill('https://example.com/amine')
  await page.getByRole('button', { name: 'Save solver profile' }).click()
  await page.getByLabel('Add a comment or question').fill('Amine local question about the oven.')
  await page.getByRole('button', { name: 'Post comment' }).click()
  await expect(page.getByText('Amine local question about the oven.')).toBeVisible()
  await page.getByRole('link', { name: 'Submit a solution', exact: true }).click()
  await expect(page.getByLabel('Solution summary')).toHaveValue('')
  await page.getByLabel('Solution summary').fill('Amine separate proposal for the oven.')
  await page.getByRole('button', { name: 'Submit solution', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await logout(page)
  await signInAgain(page, 'solver')
  await page.locator('.navbar-links').getByRole('link', { name: 'Problems', exact: true }).click()
  await page.locator('article.problem-card h2 a').nth(1).click()
  await expect(page.getByText('Amine local question about the oven.')).toHaveCount(0)
  await page.locator('.navbar-links').getByRole('link', { name: 'Problems', exact: true }).click()
  await page.locator('article.problem-card h2 a').first().click()
  await page.getByRole('link', { name: 'Submit a solution', exact: true }).click()
  await expect(page.getByLabel('Solution summary')).toHaveValue(
    'Karim private local draft for the oven.'
  )
  await expect(page.getByRole('button', { name: 'Submit solution', exact: true })).toBeEnabled()
})
test('validation errors and visitor dialog are accessible at mobile width', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 375, height: 812 })
  const findings = []
  for (const path of ['/signin', '/signup']) {
    await page.goto(path)
    await page.locator('form button[type="submit"]').click()
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze()
    findings.push(
      ...result.violations.map((v) => ({
        path,
        id: v.id,
        nodes: v.nodes.map((n) => n.failureSummary),
      }))
    )
  }
  await page.goto('/community')
  await page.getByRole('button', { name: 'Ask a question', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  for (let i = 0; i < 7; i++) {
    await page.keyboard.press('Tab')
    expect(await dialog.evaluate((d) => d.contains(document.activeElement))).toBe(true)
  }
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze()
  findings.push(
    ...result.violations.map((v) => ({
      path: 'visitor-dialog',
      id: v.id,
      nodes: v.nodes.map((n) => n.failureSummary),
    }))
  )
  await page.keyboard.press('Escape')
  await expect(dialog).not.toBeVisible()
  await expect(page.getByRole('button', { name: 'Ask a question', exact: true })).toBeFocused()
  await testInfo.attach('error-dialog-accessibility', {
    body: JSON.stringify(findings, null, 2),
    contentType: 'application/json',
  })
  expect(findings).toEqual([])
})
for (const width of [375, 1440]) {
  for (const [role, name, path] of screens) {
    test(`WCAG ${name} at ${width}px`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: width === 375 ? 812 : 1040 })
      const findings = []
      if (role !== 'visitor') await login(page, role)
      await page.goto(path)
      await page.evaluate(() => document.fonts.ready)
      const result = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze()
      if (result.violations.length)
        findings.push({
          screen: name,
          violations: result.violations.map((v) => ({
            id: v.id,
            impact: v.impact,
            nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
          })),
        })
      await testInfo.attach('accessibility-findings', {
        body: JSON.stringify(findings, null, 2),
        contentType: 'application/json',
      })
      expect(findings).toEqual([])
    })
  }
}
