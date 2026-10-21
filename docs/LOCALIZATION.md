# English / Arabic interface

The existing React application uses one lightweight locale store in `src/i18n/index.ts`, subscribed through React's `useSyncExternalStore`. No localization dependency or second page implementation is introduced.

## Resources and presentation

- `src/i18n/en.json` and `src/i18n/ar.json` contain matching English and Modern Standard Arabic UI resources, grouped by meaningful component/domain prefixes.
- Call `useI18n()` in components that render translated content. `t(key, values)` supports named interpolation and `Intl.PluralRules` categories; Arabic includes zero, one, two, few, many, and other. `formatNumber` and relative-time formatting use the current locale.
- Legacy validation messages and fixture filter labels resolve through an English-to-resource lookup at the presentation boundary. Their underlying stored values, comparisons, account identities, filter URLs, and form option values do not change with language.
- New UI text should use a resource key. Do not pass user-authored content through the translation function. Questions, answers, names, industrial requirements, attachments, and code remain in their original language. The app's missing-discussion disclosure is UI text and is localized separately.
- Brand names, programming identifiers, URLs, emails, and the language selector's native language names are intentionally preserved.

## State and direction

English is the default. The `rexios.language` localStorage preference restores on refresh. Switching language updates the document's `lang` and `dir` and notifies subscribers without navigation, reload, provider remount, or form reset. If preference storage is blocked, language switching still works in memory.

Arabic uses RTL flex/grid flow and logical spacing. Directional chevrons/reply icons mirror; original logos, mascot artwork, and nondirectional icons do not. The original Cairo font files include Arabic glyphs. Arabic badges use Cairo instead of the Latin-only pixel font. Email, URL, password, and code remain LTR. User-authored prose uses automatic direction independently of surrounding UI.

## Shared navigation and notifications

Home uses the existing Community `Navbar`, including route-driven active links, its AR/EN switch, mobile disclosure, and authenticated controls. About keeps its existing unavailable-page behavior through a single dismissible notification; it does not introduce a route.

The Home browsing message uses `VisitorBanner` below the navbar. It is shown to visitors and stays dismissed across ordinary rerenders and language changes. Community keeps its own visitor message. The duplicate Home hero notice is removed.

`Notice` provides a controlled, accessible close button for temporary notices in navigation, authentication, drafts, answers, attachments, and local solution submissions. Existing banners and native dialogs retain their close controls. Inline validation, empty states, and persistent mock/session disclosures remain visible when their associated condition applies; hiding them would conceal required context. Notices do not use browser alerts or auto-dismiss timers.

## Verification

- `src/i18n/i18n.test.tsx`: resource parity, interpolation, all Arabic plural categories, static resource-key validation, preference persistence, blocked storage, and banner dismissal across locale changes.
- `tests/browser/localization.spec.mjs`: shared Home/Community navbar, keyboard notice dismissal, duplicate prevention, route active state, language persistence, forms/drafts/session preservation, RTL/LTR controls, and Arabic route screenshots/accessibility/text checks.
- `tests/browser/landing.spec.mjs`: updated for the shared navbar and the existing About placeholder, while retaining layout, navigation, card-height, and accessibility checks.
- Browser evidence is local and ignored under `verification/i18n/browser/`. Original repository documentation, auth adapters/providers, account permissions, and Git history are not changed by localization.

## Scope limits

Community sample card titles and summaries, including the three related-question titles, have explicit Arabic translations. These are reused in question headings and wherever the same sample summary appears. Only unchanged, recognized fixtures are translated; local posts and edited text retain their author's wording. Community search includes the translated card text as well as English. Detailed discussion text without an explicit resource remains in its original language.

Arabic layouts adapt the existing English designs; no approved Arabic Figma frames were supplied. Browser checks do not constitute native-device or human screen-reader certification. The four sample Problems card titles and summaries have explicit Arabic resources, also reused in breadcrumbs and detail headings. Search matches these translated titles and summaries alongside the original English text. Other industrial requirements and user-authored content retain their original language. About, OAuth, password recovery, and backend services retain their existing preview limitations.
