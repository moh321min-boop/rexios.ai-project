export function focusFirstError() {
  requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
}
export function isWebLink(value: string) {
  if (!value.trim()) return true
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`)
    return (
      ['https:', 'http:'].includes(url.protocol) &&
      url.hostname.includes('.') &&
      !/\s/.test(value) &&
      !value.includes('@')
    )
  } catch {
    return false
  }
}
