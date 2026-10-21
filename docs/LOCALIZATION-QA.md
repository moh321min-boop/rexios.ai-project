# Navbar, notifications and localization QA

## Implemented

- Home, Community and Problems use the same shared navbar. Removed the special Home navbar and the Problems-only navigation gap override. Active links follow React Router, including nested routes; About keeps one dismissible placeholder notice.
- Home visitor information uses the existing Community banner design below the navbar. Dismissal survives language switches and ordinary rerenders. The redundant hero message is removed.
- Temporary notices share an accessible close control. Existing validation messages stay associated with fields; persistent preview disclosures and empty states remain visible while relevant.
- Added 414 matching English/Modern Standard Arabic resource entries, immediate global switching, localStorage preference restoration, interpolation, pluralization and locale-aware numbers/relative times.
- Added RTL layout adjustments, original Cairo Arabic glyph support, appropriate icon mirroring, automatic direction for user content, and explicit LTR email/URL/password/code. Original assets and Latin technical labels retain their identity.
- Kept filter values, option values, reaction IDs, session identity and draft keys independent of language. Switching does not navigate or remount form/auth providers.

## Files for this work

Created:

- `src/i18n/index.ts`, `en.json`, `ar.json`, `i18n.test.tsx`
- `src/components/shared/Notice.tsx`
- `src/styles/localization.css`
- `tests/browser/localization.spec.mjs`
- `docs/LOCALIZATION.md`, `docs/LOCALIZATION-QA.md`

Updated UI:

- Layout: `Navbar.tsx`, `AuthLayout.tsx`.
- Shared components: `AuthPromptModal.tsx`, `FormattedText.tsx`, `GoogleButton.tsx`, `LanguageSwitch.tsx`, `MarkdownEditor.tsx`, `Reactions.tsx`, `RexiosLogo.tsx`, `VisitorBanner.tsx`.
- Controls: `Button.tsx`, `Chip.tsx`, `FigmaIcon.tsx`, `Input.tsx`, `Modal.tsx`, `Select.tsx`, `Tag.tsx`, `Textarea.tsx`.
- Community features: `CategoriesSidebar.tsx`, `CommunityRulesWidget.tsx`, `PopularTagsWidget.tsx`, `QuestionCard.tsx`, `TopContributorsWidget.tsx`.
- Question features: `AnswerCard.tsx`, `AnswerInputForm.tsx`.
- Problems components: `ProblemUI.tsx`.
- Pages: `LandingPage.tsx`, `SignInPage.tsx`, `SignUpPage.tsx`, `ProfileSetupPage.tsx`, `AccountActivatedPage.tsx`, `CommunityFeedPage.tsx`, `QuestionDetailPage.tsx`, `AskQuestionPage.tsx`, `ProblemsPage.tsx`, `ProblemDetailPage.tsx`, `SubmitSolutionPage.tsx`.
- Styles: `globals.css`, `landing.css`, `problems.css`.
- Tests: `src/test/setup.ts`, `tests/browser/landing.spec.mjs`.
- Existing implementation notes: `DESIGN.md`, `UX-CONTRACT.md`, `docs/FRONTEND.md` updated to remove obsolete statements about unavailable Arabic and the former Home navbar.

Landing files were already present as untracked work when this request began. Earlier changes to `App.tsx`, `tests/browser/frontend.spec.mjs`, `tests/browser/production.spec.mjs`, and `docs/FINAL-AUDIT.md` were preserved. Original team `README.md`, `CONTRIBUTING.md`, `LICENCE`, and `ROLES.md` remain unchanged. No dependency, authentication provider, permission module, staging, commit, or push changes were made.

## Browser results

Chrome/Playwright: 84 distinct checks passed across the full run and targeted follow-up; two production-mode-only checks were intentionally skipped because this was a development-server run.

- The full run reported 80 passed, one failed, two skipped. The Ask responsive menu assertion failed during a development hot reload while edits were in progress. With source edits stopped, its full eight-viewport rerun passed.
- Three additional final checks passed: Arabic navbar at 320px and 1024px, and reaction/technical-label identity across language changes.
- Shared navbar, Home and About dismissal, duplicate prevention, preference restoration and RTL/LTR toggling were checked at 320, 375, 768, 1024, 1440 and 1920px.
- English screen/state checks cover 320, 375, 430, 768, 1024, 1280, 1440 and 1920px. Existing sign-in, signup, permissions, profile, filters, drafts, submissions and account-isolation regressions pass.
- All eleven implemented page types were checked in Arabic at 375px and 1440px: Home, sign-in, signup, Community, question detail, Problems, problem detail, Ask, Account Activated, Profile Setup and Submit Solution. No horizontal overflow, missing images, visible resource keys, exact untranslated catalog labels, or automated WCAG A/AA violations were found in those checks.
- Screenshots were visually inspected for representative Home, authentication, Community, profile, problem and submission layouts. This is an adaptation of the English design, not certification against an approved Arabic Figma frame.

Evidence (ignored local files): `verification/i18n/full-browser-results.json`, `final-targeted-results.json`, `browser/routes-375.json`, `browser/routes-1440.json`, and page PNGs under `verification/i18n/browser/`. English matrix captures remain under `verification/final/screenshots/` and `verification/landing/`.

## Unit checks

The final isolated `npm run test` run passed all 63 tests in ten files. An earlier concurrent run had two five-second timeouts while browser/build verification was running; the unchanged tests passed in the isolated run. No test timeout limits were raised or assertions removed.

Final sequential validation also passed `npm run typecheck`, `npm run lint`, `npm run format:check`, and `npm run build`. The production bundle is 458.39 kB JavaScript (138.00 kB gzip) and 64.66 kB CSS (11.47 kB gzip). No production deployment was performed.

## Remaining limitations

User questions, answers, profile names, sample industrial descriptions, company names, URLs and programming identifiers retain their original language. English/Arabic selector endonyms remain recognizable in both languages. Native select/file pickers are browser/OS-owned. Automated accessibility checks supplement screenshot review; they are not a native-device or manual screen-reader certification. About, OAuth, recovery, real authentication and backend services retain their existing preview limitations.
