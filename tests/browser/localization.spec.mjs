import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { mkdir, readFile, writeFile } from 'node:fs/promises'

const en = JSON.parse(await readFile('src/i18n/en.json', 'utf8'))
const ar = JSON.parse(await readFile('src/i18n/ar.json', 'utf8'))
const output = 'verification/i18n/browser'
await mkdir(output, { recursive: true })

async function openMenu(page, language = 'en') {
  const catalog = language === 'en' ? en : ar
  const button = page.getByRole('button', {
    name: catalog['navbar.open_navigation_menu'],
    exact: true,
  })
  if (await button.isVisible()) await button.click()
}
async function switchLanguage(page, target) {
  const current = await page.locator('html').getAttribute('lang')
  await openMenu(page, current)
  await page
    .getByRole('button', { name: target === 'ar' ? 'العربية' : 'English', exact: true })
    .click()
  await expect(page.locator('html')).toHaveAttribute('lang', target)
  await expect(page.locator('html')).toHaveAttribute('dir', target === 'ar' ? 'rtl' : 'ltr')
  const close = page.getByRole('button', {
    name: (target === 'ar' ? ar : en)['navbar.close_navigation_menu'],
  })
  if (await close.isVisible()) await close.click()
}
async function login(page, role) {
  await page.goto('/signin')
  await page.getByLabel('Email').fill(`${role}@rexios.demo`)
  await page.getByLabel(/^Password/).fill('RexiosDemo123!')
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expect(page).toHaveURL(role === 'member' ? /\/community$/ : /\/problems$/)
}

for (const role of ['member', 'solver', 'incomplete', 'company']) {
  test(`Arabic mobile login, restoration and protected-page logout: ${role}`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/signin')
    await switchLanguage(page, 'ar')
    await page.getByLabel(ar['signIn.email']).fill(`${role}@rexios.demo`)
    await page.getByLabel(ar['signIn.password']).fill('RexiosDemo123!')
    await page.getByRole('button', { name: ar['signIn.sign_in'], exact: true }).click()
    await expect(page).toHaveURL(role === 'member' ? /\/community$/ : /\/problems$/)
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar')
    await page.goto('/community/ask')
    await expect(page.locator('#question-title')).toBeVisible()
    await openMenu(page, 'ar')
    await expect(
      page.getByRole('link', { name: ar['profileSetup.solver_profile'], exact: true })
    ).toHaveCount(role === 'company' ? 0 : 1)
    await page.getByRole('button', { name: ar['navbar.sign_out'], exact: true }).click()
    await expect(page).toHaveURL(/\/community$/)
    await openMenu(page, 'ar')
    await expect(
      page.getByRole('button', { name: ar['signIn.sign_in'], exact: true })
    ).toBeVisible()
    await page.goto('/community/ask')
    await expect(page).toHaveURL(/\/signin$/)
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    await checkLayout(page)
  })
}

test('Arabic visitor dialog and temporary notices retain dismissal and keyboard focus', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/community')
  await switchLanguage(page, 'ar')
  const ask = page.getByRole('button', { name: ar['askQuestion.ask_a_question'], exact: true })
  await ask.click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog).toContainText(ar['authPromptModal.join_the_community_to_participate'])
  await expect(dialog.getByRole('button', { name: ar['modal.close_dialog'] })).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(
    dialog.getByRole('button', { name: ar['authPromptModal.continue_browsing'] })
  ).toBeFocused()
  expect(
    (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze())
      .violations
  ).toEqual([])
  await page.keyboard.press('Escape')
  await expect(dialog).not.toBeVisible()
  await expect(ask).toBeFocused()
  await page.goto('/signin')
  const google = page.getByRole('button', { name: ar['signIn.continue_with_google'], exact: true })
  await google.click()
  await google.click()
  await expect(page.locator('.dismissible-notice')).toHaveCount(1)
  await expect(page.locator('.dismissible-notice')).toContainText(
    ar['signIn.google_sign_in_is_not_connected_no']
  )
  const dismiss = page.getByRole('button', { name: ar['notice.dismiss_notification'] })
  await dismiss.focus()
  await page.keyboard.press('Enter')
  await switchLanguage(page, 'en')
  await expect(page.locator('.dismissible-notice')).toHaveCount(0)
})

for (const width of [375, 1440]) {
  test(`translated Community cards, search and navigation at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1040 })
    await page.goto('/community')
    await switchLanguage(page, 'ar')
    const cards = page.locator('article.question-card')
    await expect(cards).toHaveCount(4)
    const main = ['sensor', 'motor', 'scada', 'sync']
    const related = ['isolation', 'kalman', 'calibration']
    for (const name of main) {
      await expect(
        cards.getByRole('heading', { name: ar[`communityCards.${name}.title`], exact: true })
      ).toBeVisible()
      await expect(
        cards.getByText(ar[`communityCards.${name}.summary`], { exact: true })
      ).toBeVisible()
    }
    await checkLayout(page)
    await page.screenshot({ path: `${output}/community-cards-ar-${width}.png`, fullPage: true })
    await page
      .getByRole('button', { name: ar['communityFeed.show_more_questions'], exact: true })
      .click()
    await expect(cards).toHaveCount(7)
    for (const name of related) {
      await expect(
        cards.getByRole('heading', { name: ar[`communityCards.${name}.title`], exact: true })
      ).toBeVisible()
    }
    const search = page.getByRole('textbox', { name: ar['communityFeed.search_questions'] })
    await search.fill('التنبؤية')
    await expect(cards).toHaveCount(1)
    await expect(cards).toContainText(ar['communityCards.motor.title'])
    await search.fill('vibration')
    await expect(cards).toHaveCount(1)
    await search.fill('')
    await switchLanguage(page, 'en')
    for (const name of main) {
      await expect(
        cards.getByRole('heading', { name: en[`communityCards.${name}.title`], exact: true })
      ).toBeVisible()
    }
    await switchLanguage(page, 'ar')
    await cards.getByRole('link', { name: ar['communityCards.motor.title'], exact: true }).click()
    await expect(page).toHaveURL(/\/community\/questions\/q-102$/)
    await expect(
      page.getByRole('heading', { name: ar['communityCards.motor.title'], exact: true })
    ).toBeVisible()
    await checkLayout(page)
  })

  test(`translated Problems cards, search and navigation at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1040 })
    await page.goto('/problems')
    await switchLanguage(page, 'ar')
    const cards = page.locator('.problem-results article.problem-card')
    await expect(cards).toHaveCount(4)
    for (const name of ['oven', 'filling', 'motors', 'inventory']) {
      await expect(
        cards.getByRole('heading', { name: ar[`problemCards.${name}.title`], exact: true })
      ).toBeVisible()
      await expect(
        cards.getByText(ar[`problemCards.${name}.summary`], { exact: true })
      ).toBeVisible()
    }
    await checkLayout(page)
    await page.screenshot({ path: `${output}/problem-cards-ar-${width}.png`, fullPage: true })
    const search = page.getByRole('textbox', { name: ar['problems.search_problems'] })
    await search.fill('فرن صناعي')
    await expect(cards).toHaveCount(1)
    await expect(cards).toContainText(ar['problemCards.oven.title'])
    await search.fill('oven')
    await expect(cards).toHaveCount(1)
    await search.fill('')
    await switchLanguage(page, 'en')
    for (const name of ['oven', 'filling', 'motors', 'inventory']) {
      await expect(cards).toContainText([en[`problemCards.${name}.title`]])
    }
    await switchLanguage(page, 'ar')
    await cards.getByRole('link', { name: ar['problemCards.oven.title'], exact: true }).click()
    await expect(page).toHaveURL(/\/problems\/p-101$/)
    await expect(
      page.getByRole('heading', { name: ar['problemCards.oven.title'], exact: true })
    ).toBeVisible()
    await checkLayout(page)
  })
}
async function checkLayout(page) {
  await page.evaluate(() => document.fonts.ready)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  expect(
    await page
      .locator('img')
      .evaluateAll((images) =>
        images.filter((img) => !img.complete || !img.naturalWidth).map((img) => img.src)
      )
  ).toEqual([])
  const outside = await page
    .locator('input:not([type=file]), textarea, select, .navbar-toggle')
    .evaluateAll((elements) =>
      elements
        .filter((element) => {
          if (!element.getClientRects().length) return false
          const box = element.getBoundingClientRect()
          return box.left < -1 || box.right > innerWidth + 1
        })
        .map((element) => element.outerHTML)
    )
  expect(outside).toEqual([])
}

for (const width of [320, 375, 768, 1024, 1440, 1920]) {
  test(`shared navbar, notices and locale persistence at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1040 })
    await page.goto('/')
    await expect(page.locator('.visitor-banner')).toHaveText(
      /Browsing is free and open to everyone/
    )
    const headerClasses = await page.locator('.site-navbar').getAttribute('class')
    await page.getByRole('button', { name: 'Dismiss visitor information' }).click()
    await switchLanguage(page, 'ar')
    await expect(page.locator('.visitor-banner')).toHaveCount(0)
    await openMenu(page, 'ar')
    await expect(page.locator('.navbar-links [aria-current=page]')).toHaveText(ar['navbar.home'])
    const about = page.getByRole('button', { name: ar['navbar.about'], exact: true })
    await about.click()
    await openMenu(page, 'ar')
    await about.click()
    await expect(page.locator('.navbar-notice')).toHaveCount(1)
    await expect(page.locator('.navbar-notice')).toContainText(
      ar['navbar.the_about_page_is_not_implemented_yet']
    )
    const dismiss = page.getByRole('button', { name: ar['notice.dismiss_notification'] })
    await dismiss.focus()
    await page.keyboard.press('Enter')
    await expect(page.locator('.navbar-notice')).toHaveCount(0)
    await page.screenshot({ path: `${output}/home-ar-${width}.png`, fullPage: true })
    await checkLayout(page)
    await openMenu(page, 'ar')
    await page
      .locator('.navbar-links')
      .getByRole('link', { name: ar['communityFeed.community'], exact: true })
      .click()
    await expect(page).toHaveURL(/\/community$/)
    await expect(page.locator('.site-navbar')).toHaveAttribute('class', headerClasses)
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar')
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    await openMenu(page, 'ar')
    await expect(page.locator('.navbar-links [aria-current=page]')).toHaveText(
      ar['communityFeed.community']
    )
    await switchLanguage(page, 'en')
    await expect(page.locator('.visitor-banner')).toContainText("You're browsing as a visitor")
    await checkLayout(page)
  })
}

const routes = [
  ['visitor', 'home', '/'],
  ['visitor', 'signin', '/signin'],
  ['visitor', 'signup', '/signup'],
  ['visitor', 'community', '/community'],
  ['visitor', 'question', '/community/questions/q-101'],
  ['visitor', 'problems', '/problems'],
  ['visitor', 'problem', '/problems/p-101'],
  ['member', 'ask', '/community/ask'],
  ['member', 'activated', '/account-activated'],
  ['incomplete', 'profile', '/profile-setup'],
  ['solver', 'solution', '/problems/p-101/submit-solution'],
]
for (const width of [375, 768, 1024, 1440, 1920]) {
  for (const language of ['en', 'ar']) {
    test(`${language} route layouts, text resources and accessibility at ${width}`, async ({
      page,
    }) => {
      test.setTimeout(240000)
      await page.setViewportSize({ width, height: 1040 })
      const audits = []
      const errors = []
      page.on('pageerror', (error) => errors.push(error.message))
      page.on('console', (message) => {
        if (message.type() === 'error' || message.type() === 'warning') errors.push(message.text())
      })
      for (const [role, name, path] of routes) {
        // Fresh session per role, without modifying any application account state.
        await page.goto('/')
        await page.evaluate(() => {
          localStorage.removeItem('rexios.language')
          sessionStorage.clear()
        })
        await page.reload()
        if (role !== 'visitor') await login(page, role)
        await page.goto(path)
        await switchLanguage(page, language)
        expect(new URL(page.url()).pathname).toBe(path)
        await checkLayout(page)
        if (await page.locator('.site-navbar').count()) {
          await openMenu(page, language)
          const current = page.locator('.navbar-links [aria-current=page]')
          const catalog = language === 'en' ? en : ar
          const active =
            path === '/'
              ? catalog['navbar.home']
              : path.startsWith('/community')
                ? catalog['communityFeed.community']
                : path.startsWith('/problems')
                  ? catalog['problems.problems']
                  : null
          if (active) await expect(current).toHaveText(active)
          else await expect(current).toHaveCount(0)
          const close = page.getByRole('button', {
            name: catalog['navbar.close_navigation_menu'],
            exact: true,
          })
          if (await close.isVisible()) {
            await close.focus()
            await page.keyboard.press('Escape')
            await expect(
              page.getByRole('button', {
                name: catalog['navbar.open_navigation_menu'],
                exact: true,
              })
            ).toBeFocused()
          }
        }
        const text = await page.locator('body').innerText()
        expect(text).not.toMatch(/\b(?:navbar|signIn|profileSetup|counts|problemUI)\.[a-zA-Z_]+/)
        // Exact UI text nodes and accessible attributes must not retain English catalog values.
        const englishLeaks = await page.locator('body').evaluate(
          (body, { en, ar }) => {
            const english = new Set(
              Object.entries(en)
                .filter(
                  ([key, value]) => value !== ar[key] && value.length > 3 && !value.includes('{{')
                )
                .map(([, value]) => value)
            )
            const leaks = []
            const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT)
            while (walker.nextNode()) {
              const node = walker.currentNode
              if (
                node.parentElement?.getClientRects().length &&
                english.has(node.textContent.trim())
              )
                leaks.push(node.textContent.trim())
            }
            for (const element of body.querySelectorAll('[aria-label], [placeholder], [title]')) {
              if (!element.getClientRects().length || element.closest('.language-switch')) continue
              for (const attr of ['aria-label', 'placeholder', 'title']) {
                const text = element.getAttribute(attr)
                if (english.has(text)) leaks.push(text)
              }
            }
            return [...new Set(leaks)]
          },
          { en, ar }
        )
        if (language === 'ar') expect(englishLeaks, name).toEqual([])
        const axe = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze()
        expect(axe.violations, name).toEqual([])
        audits.push({
          name,
          path,
          language,
          overflow: false,
          englishLeaks,
          accessibilityViolations: axe.violations.length,
          text,
        })
        await page.screenshot({
          path: `${output}/${name}-${language}-${width}.png`,
          fullPage: true,
        })
      }
      expect(errors).toEqual([])
      await writeFile(`${output}/routes-${language}-${width}.json`, JSON.stringify(audits, null, 2))
    })
  }
}

test('sign-in/sign-up values, errors and LTR controls survive language changes', async ({
  page,
}) => {
  for (const route of ['/signin', '/signup']) {
    await page.goto(route)
    await switchLanguage(page, 'en')
    await page.getByLabel('Email', { exact: false }).fill('draft@example.com')
    await page.getByLabel(/^Password/).fill('MyUnfinishedPassword123')
    await page.evaluate(() => {
      window.localeNoReload = true
    })
    await switchLanguage(page, 'ar')
    await expect(page).toHaveURL(new RegExp(`${route}$`))
    await expect(page.locator('input[type=email]')).toHaveValue('draft@example.com')
    await expect(page.locator('input[type=email]')).toHaveCSS('direction', 'ltr')
    await expect(page.locator('input[type=password]').first()).toHaveValue(
      'MyUnfinishedPassword123'
    )
    expect(await page.evaluate(() => window.localeNoReload)).toBe(true)
    await switchLanguage(page, 'en')
    await page.getByLabel('Email', { exact: false }).fill('invalid')
    await page.locator('form button[type=submit]').click()
    await expect(
      page.getByText(en['signIn.enter_a_valid_email_address'], { exact: true })
    ).toBeVisible()
    await switchLanguage(page, 'ar')
    await expect(
      page.getByText(ar['signIn.enter_a_valid_email_address'], { exact: true })
    ).toBeVisible()
    await switchLanguage(page, 'en')
  }
})

test('member session, question draft and validation survive language switching', async ({
  page,
}) => {
  await login(page, 'member')
  await page.goto('/community/ask')
  const title = page.locator('#question-title')
  const body = page.locator('textarea')
  await title.fill('Unfinished temperature sensor question')
  await body.fill('The sensor has an intermittent measurement drift. I am preserving this draft.')
  await page.getByRole('button', { name: 'Python', exact: true }).click()
  const session = await page.evaluate(() => sessionStorage.getItem('rexios.demo.session.v1'))
  await switchLanguage(page, 'ar')
  await expect(title).toHaveValue('Unfinished temperature sensor question')
  await expect(body).toHaveValue(/intermittent measurement drift/)
  expect(await page.evaluate(() => sessionStorage.getItem('rexios.demo.session.v1'))).toBe(session)
  await page.getByRole('button', { name: ar['askQuestion.save_as_draft'], exact: true }).click()
  await expect(page.locator('.dismissible-notice')).toBeVisible()
  await page.getByRole('button', { name: ar['notice.dismiss_notification'] }).click()
  await switchLanguage(page, 'en')
  await page.locator('.navbar-links').getByRole('link', { name: 'Community', exact: true }).click()
  await page
    .locator('.navbar-actions')
    .getByRole('button', { name: 'Ask a question', exact: true })
    .click()
  await expect(title).toHaveValue('Unfinished temperature sensor question')
  await expect(body).toHaveValue(/intermittent measurement drift/)
})

test('solver solution values, profile choices and draft actions remain stable', async ({
  page,
}) => {
  await login(page, 'solver')
  await page.goto('/problems/p-101/submit-solution')
  const summary = page.locator('textarea')
  await summary.fill('A work in progress solution that must survive the language switch.')
  await page.locator('input[type=url]').fill('https://example.com/demo')
  await switchLanguage(page, 'ar')
  await expect(summary).toHaveValue(
    'A work in progress solution that must survive the language switch.'
  )
  await expect(page.locator('select')).toHaveValue('10')
  await expect(page.locator('input[type=url]')).toHaveCSS('direction', 'ltr')
  await page.getByRole('button', { name: ar['askQuestion.save_as_draft'], exact: true }).click()
  await switchLanguage(page, 'en')
  await expect(page.locator('.dismissible-notice')).toContainText('Draft saved')
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await page.getByRole('link', { name: 'Submit a solution', exact: true }).click()
  await expect(summary).toHaveValue(
    'A work in progress solution that must survive the language switch.'
  )
  await page.goto('/profile-setup')
  const options = await page
    .locator('select')
    .evaluateAll((elements) => elements.map((element) => element.value))
  await switchLanguage(page, 'ar')
  expect(
    await page.locator('select').evaluateAll((elements) => elements.map((element) => element.value))
  ).toEqual(options)
})

test('reactions and technical skill labels retain their identity in both languages', async ({
  page,
}) => {
  await login(page, 'member')
  const firstReaction = page.locator('.question-card .reaction').first()
  await firstReaction.click()
  await expect(firstReaction).toHaveAttribute('aria-pressed', 'true')
  await switchLanguage(page, 'ar')
  await expect(firstReaction).toHaveAttribute('aria-pressed', 'true')
  await expect(firstReaction).toHaveAccessibleName(new RegExp(ar['reactions.helpful']))
  await firstReaction.click()
  await switchLanguage(page, 'en')
  await expect(firstReaction).toHaveAttribute('aria-pressed', 'false')
  await page.goto('/profile-setup')
  await switchLanguage(page, 'ar')
  await expect(page.getByRole('button', { name: 'C++', exact: true }).locator('span')).toHaveCSS(
    'direction',
    'ltr'
  )
})
