import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import ts from 'typescript'
import { resources, setLanguage, getLanguage, LANGUAGE_KEY, t } from './index'
import { LanguageSwitch } from '@/components/shared/LanguageSwitch'
import { VisitorBanner } from '@/components/shared/VisitorBanner'

describe('bilingual resources', () => {
  it('has matching nonempty resources and interpolation parameters', () => {
    expect(Object.keys(resources.ar).sort()).toEqual(Object.keys(resources.en).sort())
    for (const key of Object.keys(resources.en) as (keyof typeof resources.en)[]) {
      expect(resources.ar[key].trim(), key).not.toBe('')
      const parameters = (text: string) =>
        [...text.matchAll(/\{\{(\w+)\}\}/g)].map((x) => x[1]).sort()
      // Arabic singular and dual nouns encode the count without an explicit numeral.
      const expected = parameters(resources.en[key])
      const actual = parameters(resources.ar[key])
      expect(actual, key).toEqual(
        /_(one|two)$/.test(key) ? expected.filter((parameter) => parameter !== 'count') : expected
      )
    }
  })

  it('resolves all literal resource keys used in application components', () => {
    function inspect(directory: string) {
      for (const item of readdirSync(directory, { withFileTypes: true })) {
        const path = join(directory, item.name)
        if (item.isDirectory()) {
          inspect(path)
          continue
        }
        if (!path.endsWith('.tsx') || path.includes('.test.')) continue
        const source = ts.createSourceFile(
          path,
          readFileSync(path, 'utf8'),
          ts.ScriptTarget.Latest,
          true,
          ts.ScriptKind.TSX
        )
        function visit(node: ts.Node) {
          if (ts.isCallExpression(node) && node.expression.getText(source) === 't') {
            const argument = node.arguments[0]
            if (argument && ts.isStringLiteral(argument) && /^[a-zA-Z]+\./.test(argument.text)) {
              expect(
                Object.hasOwn(resources.en, argument.text) ||
                  Object.hasOwn(resources.en, `${argument.text}_other`),
                `${path}: ${argument.text}`
              ).toBe(true)
            }
          }
          ts.forEachChild(node, visit)
        }
        visit(source)
      }
    }
    inspect(join(process.cwd(), 'src'))
  })

  it('uses singular/plural in English and all six Arabic plural categories', () => {
    expect(t('counts.answers', { count: 1 })).toBe('1 answer')
    expect(t('counts.answers', { count: 4 })).toBe('4 answers')
    setLanguage('ar')
    for (const count of [0, 1, 2, 3, 11, 102]) {
      const category = new Intl.PluralRules('ar').select(count)
      const resource = resources.ar[`counts.answers_${category}` as keyof typeof resources.ar]
      expect(t('counts.answers', { count })).toBe(resource.replace('{{count}}', String(count)))
    }
    expect(t('problem.replyingTo', { name: 'Samir' })).toContain('Samir')
    expect(t('2 hours ago')).toBe(new Intl.RelativeTimeFormat('ar').format(-2, 'hour'))
    expect(t('user-authored text')).toBe('user-authored text')
  })

  it('updates document direction and storage without remounting dismissed banners', async () => {
    const user = userEvent.setup()
    render(
      <>
        <LanguageSwitch />
        <VisitorBanner />
      </>
    )
    await user.click(screen.getByRole('button', { name: 'Dismiss visitor information' }))
    await user.click(screen.getByRole('button', { name: 'العربية' }))
    expect(document.documentElement).toHaveAttribute('lang', 'ar')
    expect(document.documentElement).toHaveAttribute('dir', 'rtl')
    expect(localStorage.getItem(LANGUAGE_KEY)).toBe('ar')
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'العربية' })).toHaveAttribute('aria-pressed', 'true')
    await user.click(screen.getByRole('button', { name: 'English' }))
    expect(document.documentElement).toHaveAttribute('dir', 'ltr')
  })

  it('still switches when preference storage is unavailable', () => {
    const storage = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    act(() => setLanguage('ar'))
    expect(getLanguage()).toBe('ar')
    expect(document.documentElement.dir).toBe('rtl')
    storage.mockRestore()
  })
})
