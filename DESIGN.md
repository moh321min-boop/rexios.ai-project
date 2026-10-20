---
version: alpha
name: Rexios AI
description: Existing Figma identity for the reconstructed English authentication, Community and Problems screens.
colors:
  primary: '#0b2a9e'
  ink: '#12122b'
  muted: '#5b5b7b'
  page: '#f8f1e1'
  surface: '#fffbf1'
  accent: '#c6ff3d'
  subtle: '#dccdaa'
  error: '#e5432a'
  error-text: '#b62c1a'
typography:
  sans:
    fontFamily: 'Cairo, sans-serif'
  brand:
    fontFamily: 'Pixelify Sans, sans-serif'
rounded:
  sm: '4px'
  md: '8px'
spacing:
  auth-card-padding: '36px'
  auth-card-gap: '18px'
components:
  button: {}
  input: {}
  card: {}
  language-switch: {}
---

# Rexios AI Design System

## Overview

The authoritative references are the saved English Figma properties and original exported screenshots described below. Authentication uses file JKJUxhJscvGDK1U9HC3zfW, signup frame 101:843 and sign-in frame 101:918. This document records the shared design system and subsequent Community, profile and Problems reconstruction. The product serves a technical community. English is implemented first; Arabic remains unavailable. No market assumptions or new visual direction are introduced.

Runtime tokens are owned by `src/styles/globals.css`; this document mirrors those tokens. Saved Figma context lives in `verification/reference/`. It is evidence, not application source, and is excluded from Tailwind scanning.

## Colors

Cream page and card surfaces, blue primary actions and artwork, lime selected accents, dark ink borders, muted secondary copy, and red validation feedback follow the saved reference. Error meaning is also communicated in text. No dark theme is specified.

Accessibility corrections from the final browser audit: small error text uses `error-text` (#b62c1a) while original error borders/icons retain #e5432a; the green skill-match caption uses #137a43; locked-feature text uses the existing muted token. The original lighter text failed WCAG AA contrast. These are deliberate, limited differences from the exported colors.

## Typography

Local Cairo fonts use weights 400, 500, 600, and 700. Pixelify Sans 700 supplies the wordmark and the uppercase skill/company badges in the supplied Problems screenshots. Desktop headings are 44px/55px, body copy 16px/25.6px, labels 13px/18.2px, and buttons 15px/21px.

## Layout

At 1440 × 1040, the form area is 880px and artwork is 560px. Desktop uses fluid 11:7 grid columns from 1024px upwards. The centered card has a 480px maximum width with 36px padding and 18px gaps. Fields are 48px high. Normal document flow accommodates short screens and validation messages without a fixed 1040px canvas.

Below 1024px, a single-row blue header places the original logo on the left and AR/EN controls on the right. At the user's latest request, the separate large dinosaur illustration is hidden on mobile; the small mark within the logo remains. The promotional heading and paragraph are also omitted. The header is 72px tall (64px below 360px). Only one language switch is displayed and exposed to keyboard/accessibility navigation at each breakpoint; desktop and mobile placements reuse the same component. Mobile fields remain 44px high with 16px input text, action links have 44px targets, and the form title is 28px on phones. Card padding/gaps are 20px/10px, reduced to 12px/6px below 360px. No form content is clipped or hidden. This compact composition is a user-authorized adaptation, not a verified mobile Figma reproduction.

At desktop heights up to 900px, card padding/gaps reduce to 28px/12px and outer padding to 72px above/24px below. At 1600px and wider with heights above 900px, the card grows to 560px with 40px padding, 22px gaps, 48px titles, and 52px fields; the mascot grows to 480px. Other desktop widths retain the 480px card and reference sizing. At 1024–1199px the mascot is 312px wide, otherwise 360px until the wide desktop rule applies. Whole pixel-cell mascot sizes avoid fractional SVG seams. Primary artwork uses grid flow; only decorative pixels are absolutely positioned. The 1440 × 1040 reference geometry is preserved. Natural scrolling remains available for small viewports, validation feedback, keyboard space, and zoom.

## Elevation & Depth

Cards use a 6px hard ink shadow and buttons a 4px hard shadow. No blur, gradient, or rounded-pill substitution is used in authentication.

## Shapes

Cards have an 8px radius; fields and buttons use 4px. Borders are 2px. Decorative square positions are transcribed from the reference into `src/data/authArtwork.ts`.

## Components

`AuthLayout`, `Input`, `Button`, `GoogleButton`, `EmailDivider`, `RexiosLogo`, and `LanguageSwitch` own shared authentication presentation. Inputs have native labels, autocomplete, error associations, and visible focus. The sign-in page owns validation and feedback. Passwords remain masked and are never stored.

Original SVGs in `public/figma` supply the wordmark mascot, large mascot, and Google icon. There is no new illustration. Motion is limited to functional busy feedback and respects reduced motion. English feedback distinguishes unavailable integrations from completed actions. There are no charts or data visualizations in these screens.

## Do's and Don'ts

- Reuse the shared authentication controls and exact local assets.
- Keep the initial sign-in state neutral; show errors only after actual validation or rejected mock credentials.
- Do not claim real authentication, OAuth, or password recovery is connected.
- Do not infer layouts for other routes from the authentication screens.

## Application screen continuation

Saved English frame properties in `verification/reference` are the authority for the community feed, question detail, Ask a Question, Profile Setup and Account Activated. The matching original SVG groups and Cairo/Pixelify files are served locally. Original raster screenshots for these application frames are not present in the saved project; compare layout properties and assets, and do not claim pixel-identical image diffs. The question code block requests JetBrains Mono, whose font file is missing; a system monospace fallback is used.

Community uses 48px desktop outer padding, 240px categories, flexible cards, 300px widgets and 32px column gaps. Question detail uses the same outer padding with flexible discussion and a 300px sidebar. Forms use 120px desktop horizontal padding, an 828px main card and a 340px sidebar at 1440px; cards have 36px padding and 22px gaps. Large viewports cap these layouts rather than stretching text indefinitely. At intermediate widths sidebars reflow; mobile presents a single column with 16px outer padding and readable controls. These are responsive adaptations because no approved mobile frame is saved.

`Navbar` is shared by all non-auth application pages. At >=1024px the reference links and actions remain in one row. Below 1024px the logo stays left and a 44px hamburger/X button stays right. A non-modal disclosure opens in normal flow below them, containing all navigation and account actions. Escape restores toggle focus; selecting a link or changing the route/breakpoint closes it. The blank landing page has no shell.

`QuestionCard`, `Reactions`, `AnswerCard`, `MarkdownEditor`, `Chip`, `Tag`, `Input`, `Textarea` and `Select` provide shared application controls. Textarea starts at the Figma 132px height; Community's MarkdownEditor expands with content. Modal uses native dialog focus containment and background inertness, styled with the saved cream/ink border and shadow tokens. Native select popups remain browser-owned because the saved design only specifies their closed triggers. All displayed counts/content are sample fixtures; missing answer bodies and related discussions are explicitly identified. Arabic, About, notifications and backend integrations have honest unavailable feedback.

## Problems workflow — approved local screenshot references

The four original 2× PNG exports in `verification/figma-problems/` are the visual authority for the list, incomplete-profile detail, eligible-solver detail and solution form. The user explicitly authorized these local references while the Figma quota is exhausted; no further MCP request is needed. Desktop screenshots normalize to 1440 CSS pixels wide. The pages reuse the established Cairo/Pixelify fonts, color tokens, fields, buttons, chips, tags, avatar, icons, modal and navbar. `styles/problems.css` scopes the feature's layout and badge typography.

At 1440px the list uses 48px outer padding, a 272px filter column and a 32px gap. Detail uses a 952px main column, 32px gap and 360px summary. Submission uses 120px outer padding, 828px form, 32px gap and 340px summary. Layouts cap at 1440px. Below 1024px detail displays title, summary, requirements and discussion in that order; submission shows the problem summary before the form. Below 640px list filters stack above results. These are responsive adaptations; no mobile Figma frames were supplied.

Reference limitations: the list shows selected difficulty/skill filters while displaying records outside those filters. The working default deliberately leaves filters unselected and shows all four provided records. The reward slider starts at the labeled 10,000–200,000 DZD bounds; the unlabeled inset thumb values cannot be inferred. The delivery selector offers only the visible 10-day option because its other options were not supplied. Original attachment files, submission terms, some small icon SVGs, alternate problem requirements and production matching/eligibility rules are missing. Existing lucide icons approximate the missing clock, users, company seal, reward, reply and success symbols.

## Credential-based demo continuation

The final audit replaces URL roles and footer selectors with the existing sign-in form and a centrally gated mock adapter. Small explanatory captions on authentication and welcome screens disclose demo behavior. These captions and actual fixture profile states can change card height/content compared with the static Figma frame; preserve the existing visual hierarchy, assets and layout rather than claiming a zero-pixel difference. See README for credentials and production gating. The account menu shows the actual fixture identity, solver profile link where applicable and Sign out. No new company dashboard is designed.
