# Colour tokens — code vs Figma

The Figma Design System page is the source of truth for colour, and the code
mirrors it. This file records anything the code decides on its own, and the
measurements behind it.

**Synced with the contrast pass of October 2026** (Figma frame
`164:14 — Contrast update`). Everything below matches Figma unless marked.

| Token             | Light     | Dark      | Source                |
| ----------------- | --------- | --------- | --------------------- |
| `background`      | `#FCFAF7` | `#1E1A18` | Figma                 |
| `surface`         | `#E7DCD1` | `#3B322C` | Figma — contrast pass |
| `surfaceElevated` | `#FCFAF7` | `#4A3D36` | Figma — contrast pass |
| `textPrimary`     | `#29231F` | `#FAF4EC` | Figma                 |
| `textSecondary`   | `#665A52` | `#B9ADA5` | Figma — contrast pass |
| `textPlaceholder` | `#8D8077` | `#897C73` | **code**              |
| `divider`         | `#C9B9AC` | `#5B4D45` | Figma — contrast pass |
| `primary`         | `#C86F52` | `#D98568` | Figma                 |
| `primaryText`     | `#954A34` | `#D98568` | Figma — contrast pass |
| `onPrimary`       | `#1E1A18` | `#1E1A18` | Figma — contrast pass |
| `danger`          | `#A8372A` | `#EE8271` | **code**              |

## What the contrast pass fixed

|                                     | before | after                      |
| ----------------------------------- | ------ | -------------------------- |
| `surface` vs `background`, light    | 1.08:1 | **1.30:1**                 |
| `surface` vs `background`, dark     | 1.11:1 | **1.38:1**                 |
| `divider` vs `background`, light    | 1.22:1 | **1.83:1**                 |
| `divider` vs `background`, dark     | 1.59:1 | **2.13:1**                 |
| primary as text on light background | 3.44:1 | **6.10:1** (`primaryText`) |
| `onPrimary` on `primary`, light     | 3.28:1 | **4.81:1**                 |

**`surfaceElevated` in light is now `#FCFAF7` — the same value as `background`.**
That is deliberate and matches what the Theme Selector already implied: in light
the elevated surface is the page colour, while `surface` sits below it. Now that
`surface` has moved away from `#FCFAF7` there is real room between the two, and
`SegmentedControl` no longer needs to branch on `colorScheme` for it.

## Still not satisfied

`surface` vs `background` is 1.30:1 (light) and 1.38:1 (dark). WCAG 1.4.11 asks
**3:1** for the boundary of a UI component. These values are a clear improvement
and were chosen to keep the flat, warm look, but they do not meet that bar — the
card edge is still carried by tone rather than by contrast. Noted in the Figma
handoff too. Worth validating on a phone in direct sunlight before calling it
settled.

## Decided in code, not in Figma

### `primaryText` usage

Figma defines the token; which elements take it was decided here. It is applied
to primary used **as text** — back links, "+ New project", the mini bar's
pause control, the sheet confirmations, and the active tab (whose tint colours
icon and label together, and the label is 11pt).

Fills keep `primary`: buttons, selected chips and pills, the progress bar, and
the canonical hourglass.

### `textPlaceholder`

Not in Figma. Added because both inputs drew hints in `textSecondary` — the same
colour as real content — so an empty field looked like a filled one.

Recalibrated during this pass: it is measured against the _input surface_, so
darkening `surface` moved it too. It fell to 2.36:1 and was lifted back to
**2.84:1** light and **3.09:1** dark, against real text at 4.94:1 and 5.71:1.
The gap is the point, not the absolute number.

### `danger`

Not in Figma. Destructive actions arrived after the palette was drawn.

Terracotta is already a warm red, so a delete tinted with it reads as an ordinary
Dune button. Hue separates them: `danger` sits at 6–9° against the primary's
14–15°.

The dark value was lifted from `#E8705C` to `#EE8271` in this pass: lightening
`surface` had dropped it to 4.11:1, under AA. It is now **4.81:1**, with light at
**4.79:1**.

Used as text on a surface, never as a filled button — a destructive action
should not be the most inviting thing on screen.

## Hardcoded in code

`PROJECT_COLORS` in `app/project/new.tsx` lists the swatches a project can be
tagged with:

```ts
['#C86F52', '#8175C7', '#A8C7B1', '#E5A47F', '#6D625B'];
```

The first four are the Figma accent swatches (Terracotta, Dusk, Sage, Sunset).
**The fifth is the pre-contrast-pass `textSecondary`**, which no longer exists in
the palette — it was borrowed as a neutral. It needs a real swatch of its own, or
to be dropped.

`notification_icon_color` in `app.json` is `#C86F52` — `primary`, written as a
literal because config plugins run outside the React tree and cannot read the
theme. If `primary` changes, that literal has to change with it.
