# still. — project direction for AI agents

This file exists so any AI (Claude or otherwise) working on this repo shares the same mental model
of what the product is and isn't. It documents *intent*, not implementation — for how the code is
organized, read the files directly; don't let this file go stale by copy-pasting code details into it.

See also:
- `README.md` — user-facing description (Thai), setup, testing, device-size reference table.
- `.impeccable.md` — short design-context brief (brand personality, aesthetic references, design principles).
- This file — fuller functional spec + guardrails, so a new template/feature lands consistently with existing ones.

## What this is

A web app ("still.") that turns a user's own photo + text into an iPhone Lock Screen wallpaper PNG,
styled to look like a music-player now-playing screen. No login, no backend, no analytics. Works
equally well on iPhone Safari and desktop browsers.

## Templates

There is a **template registry**, not one fixed layout — this is the one place this doc most needs
to stay current as templates are added.

- `custom` (original/default) — user picks the background color (from an extracted palette or a
  color picker) and can override the auto-computed text color. Shows an optional Color Palette
  swatch strip.
- `nowPlaying` — dark theme inspired by Apple Music's now-playing screen (not affiliated with
  Apple; keep template names generic, e.g. "Now Playing", never "Apple Music"). Background is a
  dark gradient computed from the extracted palette (`darkenForContrast` in `src/model.ts`
  guarantees enough contrast for the fixed light text regardless of how bright the source photo
  is) — background/foreground pickers are hidden for this template because color is automatic.
  Rounded, shadowed artwork card; remaining-time countdown (`-m:ss`) instead of total duration.

Architecture (`src/renderer.ts` + `src/renderers/`):
- `renderers/shared.ts` — helpers shared by every template (`fontFamily`, `composition`,
  `prepareFonts`, `line`, `triangle`, `fitText`, `titleText`, `roundedRectPath`).
- `renderers/<templateName>.ts` — one file per template, each exporting a
  `render<Name>(canvas, draft, image, device, outputWidth, emptyLabel)` function with the same
  signature.
- `renderer.ts` — a thin dispatcher on `draft.templateId`. Preview (`Preview.tsx`) and export
  (`App.tsx`) both call `renderWallpaper()` from here so preview and PNG output can never diverge.

**Adding a new template:** add a new `TemplateId` value in `model.ts`, add a `renderers/x.ts` file
following the same signature, register it in `renderer.ts`'s dispatch and in the `TEMPLATES` array
in `App.tsx` (id, ordinal number, badge text, i18n label key), add translations in `i18n.ts` for
all three languages, and make sure `restoreDraft()` still defaults old saved drafts to a known-good
template id (never invalidate a user's saved draft just because a new template shipped).

Shared rules across every template:
- Fixed composition, personal content — no freeform element positioning, no photo filters.
- Preview and exported PNG must be pixel-identical (same renderer, same draft).
- Playback controls, palette strip, etc. are decorative — nothing in the canvas is interactive.
- Any decorative icon should stay in this project's simple hand-drawn line/Path2D style, not a
  literal copy of another product's icon set (SF Symbols, Material, etc.).

## Photo handling

User uploads a photo (JPG/PNG/WebP/HEIC where the browser can decode it, ≤30 MB). It's cropped to a
square; the user can drag/pan and zoom (1×–4×) but there are no filters or other edits. Long edge is
downscaled to 2400px before storage to bound memory. Processing is on-device only — nothing is ever
uploaded anywhere.

## Song info

Title, artist, "current time" and "duration" are freeform text the user fills in themselves (this is
not a real music player — it doesn't read metadata from anywhere). Both time fields must match
`m:ss`/`mm:ss`/`hhh:ss`-style input and current time can't exceed duration (`parseTime`/`validTimes`
in `model.ts`). The progress dot/fill on the time bar is purely a proportional calculation
(`progress()`); it has no relationship to real playback. Transport controls (play/pause, shuffle,
repeat, etc.) are decorative artwork, not buttons.

## Colors

On upload, ~5 colors are extracted from the photo. For the `custom` template the user can pick one
as the background or set a fully custom background color; text/icon color defaults to an
auto-contrast choice (`automaticForeground()`) and can be overridden. For `nowPlaying`, both
background and text color are fully automatic (see Templates above) — don't add manual color
controls back for that template without revisiting that decision.

## Optional extras

- Color Palette swatch strip: on by default, user can hide it. Available on both templates.
- Credit line: user-editable text, hidden by default (starts empty, shown once the user enables it
  and/or types something).

## Fonts

Prefer the OS system font stack (San Francisco on Apple devices) with Noto Sans Thai/JP as
fallbacks for non-Latin text, self-hosted (no Google Fonts / third-party font network calls at
runtime — this backs the "nothing leaves the device" privacy claim). Small cross-OS rendering
differences in fallback fonts are accepted, not chased pixel-for-pixel.

## Device / image sizes

Device list starts at iPhone 12 and covers every released model sharing the same physical pixel
resolution since (see the table in `README.md` and `src/devices.ts`), sourced from Apple's published
specs (physical resolution, not logical points). The app remembers the last device picked as part of
the draft. When Apple ships a new model with a resolution already in the list, add it to the existing
group instead of creating a redundant one; only add a new group (and a new template variant, if the
aspect ratio needs it) for a genuinely new resolution.

## Live preview / lock-screen guides

The simulated clock, date, and widget positions overlay the preview by default and can be turned
off; they exist purely to help the user judge composition and are never part of the exported PNG.
Real iOS clock/widget position varies by device and user settings — the app doesn't claim pixel
accuracy there, only "close enough to plan around."

## Save & export

Export is a PNG at the selected device's exact physical resolution, no watermark. The latest draft
(text, colors, crop, template, and the image itself) autosaves to IndexedDB, scoped per browser
origin — no accounts, no cross-device sync, no server round-trip. Restoring a corrupted or
pre-migration draft must always fail soft to sensible defaults (see `restoreDraft()`), never throw
or silently drop the user's photo/text without a chance to re-download.

## Editor look & feel

Light, airy, minimal chrome; the wallpaper preview is the focal point and controls are secondary.
Desktop: preview left, editing tools in a right-hand panel. Mobile: editing tools stack below the
preview. Interface ships in Thai (default), English, and Japanese with a persistent language
switcher; switching language must never translate or alter user-authored wallpaper content (song
title, artist, credit, etc.) — see `i18n.ts` and `useLanguage()`.

## Non-goals

No user accounts, no backend/API, no analytics or telemetry, no cross-device sync, no offline
install (no service worker), no photo filters/freeform layout editing, no claim of affiliation with
Apple or any music service.
