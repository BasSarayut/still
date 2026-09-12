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

- `custom` — the unified Music Player. Classic, Now Playing and Minimal are starting presets
  within this template. Applying a preset resets player styling while preserving the user's photo,
  crop, song text, manually chosen background color and signature. The player supports solid,
  custom gradient and photo-derived dark backgrounds; each supports a manual foreground override.
  Artwork size, radius, shadow, vertical position and spacing are adjustable. Title and artist have
  independent fonts, sizes, weights and colors. Progress, time labels, controls and heart decoration
  have their own settings. Keep preview crop interaction and export on the same player layout;
  it moves the composition upward as necessary to leave room for the palette and signature.
  Saved `nowPlaying` drafts migrate to `custom` with the dark preset. Preserve their image, crop,
  content and old manual colors, even when those colors are not currently used by the dark preset.
- `polaroid` — instant-film paper with Classic, Clean, Diary, Cinema and Noir presets. Presets
  preserve the photo, crop, title, artist, date/note, wall colors and credit while resetting paper
  styling. Paper and caption ink are independently editable from wall colors; automatic paper
  ink follows paper contrast. Photo ratio, border, caption area, corners, rotation, placement,
  shadow, typography, tape and wall pattern are customizable. Use the shared `polaroidLayout`
  for rendering and crop interaction, including inverse rotation for pointer movement. Keep
  the whole rotated card and caption inside the canvas with room for palette and credit.
  Old drafts without `polaroid` settings open as Classic and inherit their saved progress/pause
  toggles. New playback settings belong to this template; hidden progress bypasses time validation.
- `albumCover` — a color area above an edge-to-edge rectangular photo. The split and up to 12
  independent text blocks are editable, including typography and percentage-based positions.
  Supports a 2400 × 2400 square canvas or the selected iPhone size. Uses its own text content,
  rather than the player's title, artist and playback times. Classic, Poster, Cassette, Vinyl
  and Zine are starting presets that set the split ratio plus typography and position for the
  four built-in text roles (artist, title, credits, note). Applying a preset keeps each role's
  current text and visibility and leaves any custom text blocks beyond those four untouched,
  resetting only style and position (see `applyCoverPreset`).

Architecture (`src/renderer.ts` + `src/renderers/`):
- `renderers/shared.ts` — helpers shared by every template (`fontFamily`, `composition`,
  `prepareFonts`, `line`, `triangle`, `fitText`, `titleText`, `roundedRectPath`).
- `renderers/<templateName>.ts` — one file per template, each exporting a
  `render<Name>(canvas, draft, image, device, outputWidth, emptyLabel)` function with the same
  signature.
- `renderer.ts` — a thin dispatcher on `draft.templateId`. Preview (`Preview.tsx`) and export
  (`App.tsx`) both call `renderWallpaper()` from here so preview and PNG output can never diverge.

Concert Ticket (`concertTicket`) adds Photo Pass, Classic Stub and Midnight Live presets.
It owns event information independently of song and album content. Each field keeps an editable
label, string value (including leading zeros), visibility, order and typography. Presets preserve
field content/order/visibility, badge text, custom stub text, photo/crop and wallpaper background;
they reset ticket styling. Linked stubs display seating fields, with event/date repeated in landscape;
unlinking the stub returns seating fields to the main body and allows a personal stub message.
Use `ticketLayout` for both paper rendering and the rotated crop hit target. Hidden fields reflow;
the whole card stays within the canvas, and paper grain uses a fixed seed for stable exports.
Turning off the ticket photo permits text-only PNG export. Ticket export bypasses music time
validation. Barcode artwork is decorative. Palette strips and shared signatures belong to the
other templates; Ticket uses its own note and decorations.

**Adding a new template:** add a new `TemplateId` value in `model.ts`, add a `renderers/x.ts` file
following the same signature, register it in `renderer.ts`'s dispatch and in the `TEMPLATES` array
in `App.tsx` (id, ordinal number, badge text, i18n label key), add translations in `i18n.ts` for
all three languages, and make sure `restoreDraft()` still defaults old saved drafts to a known-good
template id (never invalidate a user's saved draft just because a new template shipped).

Shared rules across every template:
- Use each template's supported layout controls: a movable player composition, adjustable Polaroid
  cards, and independently positioned Album Cover text. Keep photo processing limited to cropping.
- Preview and exported PNG must be pixel-identical (same renderer, same draft).
- Playback controls, palette strip, etc. are decorative — nothing in the canvas is interactive.
- Any decorative icon should stay in this project's simple hand-drawn line/Path2D style, not a
  literal copy of another product's icon set (SF Symbols, Material, etc.).

## Photo handling

User uploads a photo (JPG/PNG/WebP/HEIC where the browser can decode it, ≤30 MB). It's cropped to a
square for Music Player, to the selected 1:1 / 3:4 / 16:9 photo area for Polaroid, or to the lower rectangular area for Album Cover. The user
can drag/pan and zoom (1×–4×). Keep the photo aspect ratio intact. The long edge is
downscaled to 2400px before storage to bound memory. Processing is on-device only — nothing is ever
uploaded anywhere.

## Song info

Title, artist, "current time" and "duration" are freeform text the user fills in themselves (this is
not a real music player — it doesn't read metadata from anywhere). When the player progress bar is visible, both time fields must match
`m:ss`/`mm:ss`/`hhh:ss`-style input and current time can't exceed duration (`parseTime`/`validTimes`
in `model.ts`). The progress dot/fill on the time bar is purely a proportional calculation
(`progress()`); it has no relationship to real playback. Transport controls (play/pause, shuffle,
repeat, etc.) are decorative artwork, not buttons.

## Colors

On upload, ~5 colors are extracted from the photo. Solid and custom-gradient player backgrounds,
Polaroid walls and Album Cover backgrounds use the user's chosen colors. The player's photo-derived
dark background darkens extracted colors to support light text, and offers extra darkness adjustment.
The player chooses automatic ink against both gradient endpoints and supports manual overrides for
all text/icons, title, and artist independently. Player ink is stored separately from other templates.
Polaroid paper and caption ink have their own settings; wall colors only recolor the wall and its text.

## Optional extras

- Color Palette: optional on Music Player and Polaroid. The player offers strips or dots. Album
  Cover uses editable text blocks instead of playback ornaments, a palette strip or a signature field.
- Credit line: user-editable text, hidden by default (starts empty, shown once the user enables it
  and/or types something).

## Fonts

Every template lets users choose system sans, serif, mono, or self-hosted Noto Sans
Thai/JP. Load selected fonts before export, including independent title/artist weights.
Other text uses the OS system font stack (San Francisco on Apple devices) with Noto Sans Thai/JP as
fallbacks for non-Latin text, self-hosted (no Google Fonts / third-party font network calls at
runtime — this backs the "nothing leaves the device" privacy claim). Small cross-OS rendering
differences in fallback fonts are accepted, not chased pixel-for-pixel.

## Device / image sizes

Device list starts at iPhone 12 and covers every released model sharing the same physical pixel
resolution since (see the table in `README.md` and `src/devices.ts`), sourced from Apple's published
specs (physical resolution, not logical points). Album Cover additionally supports square output. The app remembers the last device picked as part of
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
Desktop: use the full viewport width, with a preview on the left and a responsive editing panel
on the right. Fit the preview to available height and width; preserve space around focused fields. Mobile: editing tools stack below the
preview. Interface ships in Thai (default), English, and Japanese with a persistent language
switcher; switching language must never translate or alter user-authored wallpaper content (song
title, artist, credit, etc.) — see `i18n.ts` and `useLanguage()`.

## Non-goals

No user accounts, no backend/API, no analytics or telemetry, no cross-device sync, no offline
install (no service worker), no photo filters, no claim of affiliation with
Apple or any music service.
