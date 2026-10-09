# Colour tokens — code vs Figma

The Figma Design System page is the source of truth for colour. Some tokens have
since been added or questioned in code, because the app grew capabilities the
palette was never asked about.

This file records every one of those, so the two can be brought back together
deliberately rather than drifting.

**Status at a glance**

| Token             | Light     | Dark      | State                              |
| ----------------- | --------- | --------- | ---------------------------------- |
| `textPlaceholder` | `#9A8E86` | `#776B64` | **added in code** — not in Figma   |
| `danger`          | `#A8372A` | `#E8705C` | **added in code** — not in Figma   |
| `surface`         | `#F4F1ED` | `#29231F` | **change agreed, value undecided** |
| `surfaceElevated` | `#F4F1ED` | `#342D29` | **light value is a placeholder**   |

Everything not listed here matches the Design System page exactly.

---

## `textPlaceholder` — added

Hint text inside an input. Added for [#43](https://github.com/adelagranados/dune/issues/43): both inputs drew placeholders in
`textSecondary`, the same colour as genuine content, so a tester could not tell
whether a field already had a value. "Coding" as a hint and "Coding" as an
entered value rendered identically.

Chosen by measuring against the input surface rather than by eye:

|                    | placeholder        | real text          | ratio between them |
| ------------------ | ------------------ | ------------------ | ------------------ |
| Light on `#F4F1ED` | `#9A8E86` — 2.83:1 | `#6D625B` — 5.26:1 | 1.9× dimmer        |
| Dark on `#29231F`  | `#776B64` — 3.01:1 | `#B9ADA5` — 7.08:1 | 2.4× dimmer        |

Verified in rendered pixels on a device, not just in the stylesheet.

**For Figma:** add a `Placeholder / Light` and `Placeholder / Dark` swatch.

---

## `danger` — added

Destructive actions. Added for [#58](https://github.com/adelagranados/dune/issues/58): deleting sessions and projects only became
possible after the palette was drawn, so there was no colour for it.

The constraint is that it must not read as the brand. Terracotta is already a
warm red, so a destructive action tinted with it looks like any other Dune
button. Hue is what separates them:

|                              | hue      | contrast on surface |
| ---------------------------- | -------- | ------------------- |
| `primary` light `#C86F52`    | 14.7°    | 3.19:1              |
| **`danger` light `#A8372A`** | **6.2°** | 5.75:1              |
| `primary` dark `#D98568`     | 15.4°    | 5.54:1              |
| **`danger` dark `#E8705C`**  | **8.6°** | 5.10:1              |

Both pass WCAG AA for normal text on the surface they sit on.

Used as **text on `surface`**, not as a filled button — a destructive action
should not be the most inviting thing on screen.

**For Figma:** add `Danger / Light` and `Danger / Dark`. Open question: whether
the destructive action deserves its own colour at all, or whether the wording
should carry it. That decision belongs to the design, not to the code.

---

## `surface` — change agreed, value still open

[#54](https://github.com/adelagranados/dune/issues/54): testers reported that cards barely separate from the background. Measured:

```
light   background #FCFAF7  vs  surface #F4F1ED   1.081:1
dark    background #1E1A18  vs  surface #29231F   1.114:1
```

1.08:1 is effectively no boundary — on a phone at an angle, or in sunlight, the
card edge disappears. Light is the worse of the two, which matches the report,
but neither is carrying real separation.

**Decided:** move the surfaces further apart, rather than adding a border or a
shadow. That keeps the flat visual language the app uses everywhere.

**Still open:** the new value. It changes every screen, since `colors.surface`
is what every card uses, so it should be picked in Figma and mirrored here —
not the other way round.

---

## `surfaceElevated` light — placeholder value

The Design System page defines `Elevated / Dark` (`#342D29`) but has no light
counterpart, so the code currently reuses `surface` for light:

```ts
// No distinct "Elevated/Light" swatch exists in the Figma Design System page
surfaceElevated: '#F4F1ED',
```

Building the Settings screen surfaced what the light value should probably be.
The `Theme Selector` component draws its selected segment one step **lighter**
than its track:

|       | track               | selected segment                       |
| ----- | ------------------- | -------------------------------------- |
| Light | `#F4F1ED` (surface) | `#FCFAF7` — which is `background`      |
| Dark  | `#29231F` (surface) | `#342D29` — which is `surfaceElevated` |

So in light the "elevated" surface is the page background, while in dark it is a
distinct colour. The component reads `colorScheme` and picks, with a comment, so
the inconsistency is visible rather than silently encoded.

**For Figma:** decide whether light gets a real `Elevated / Light` swatch. If it
does, this becomes a normal token and `SegmentedControl` stops branching.

Note this interacts with the `surface` decision above: moving light's `surface`
away from `#FCFAF7` also changes how much room there is for an elevated value
between them.

---

## Not a palette change

`notification_icon_color` in the Android native config is `#C86F52` — the
existing `primary`, not a new colour. It is written as a literal in `app.json`
because config plugins run outside the React tree and cannot read the theme.
If `primary` ever changes, that literal has to change with it.
