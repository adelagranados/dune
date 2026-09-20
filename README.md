# Dune

> Time accumulates.

Dune is a personal time-tracking app for projects — the question it answers is
"how long did this actually take me?", not employee productivity or billing.
No streaks, no scores, no guilt.

This is a personal product and a portfolio project, built with production-grade
architecture rather than as a demo.

## Status

Early development. Currently implemented:

- Project scaffolding: Expo (SDK 57) + TypeScript (strict) + Expo Router
- Design tokens (light/dark) extracted from the Figma design system, wired
  through a `ThemeProvider`
- i18n (English/Spanish) via i18next, following device language with an
  English fallback
- Settings persistence (theme/language) in MMKV, exposed through a Zustand
  store

Not built yet: the actual product screens (Home, Create Project, Timer, Stats,
Settings), the local SQLite data layer, and the timer engine itself.

## Stack

- **Expo** (dev client, no Expo Go) + **Expo Router**
- **TypeScript**, strict mode
- **Zustand** for UI state
- **SQLite** (via `expo-sqlite` + Drizzle) for projects/sessions, **MMKV** for
  the active timer and settings — not wired up yet
- **i18next** / **react-i18next** for localization
- **Phosphor Icons** (planned)
- **Vitest** for domain-layer unit tests (planned)

## Getting started

```bash
npm install
npm run android   # or: npm run ios (requires macOS)
```

The project uses a custom Expo dev client (not Expo Go), since it depends on
native modules (MMKV, and eventually WidgetKit/ActivityKit on iOS) that Expo
Go doesn't support. `npm run android` / `npm run ios` build and install that
dev client automatically.

### Windows-specific note

If the Android build fails with `Filename longer than 260 characters` during
a native module's C++ codegen step, make sure
`react-native-gesture-handler` is pinned to the version Expo's SDK
compatibility table recommends (`npx expo install --check`) — a newer major
version restructured its Fabric codegen paths in a way that exceeds Windows'
path length limit.

## Project structure

```
app/                  # Expo Router routes (screens)
src/
  domain/             # Pure business logic (timer engine, stats, project rules)
  data/                # SQLite schema/repositories, MMKV key-value stores
  state/               # Zustand stores (orchestration + side effects)
  notifications/       # Local notification scheduling
  ui/                  # Design system components, theme, icons
  i18n/                # Translations
  lib/                 # Small framework-agnostic helpers
```

## License

MIT
