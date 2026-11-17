# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Neon 2099 (`/neon noodle`), a pink and cyan dark theme: a noodle bar at the foot of the megacity in the rain, with Claude coding on a hologram at the counter and the cook behind it.

## [1.1.0] - 2026-11-15

### Added

- `/neon motion off` keeps the theme but stops the scene moving, and `/neon motion on` brings it back. Handy on battery. `/neon motion` says which one is on. The setting is remembered like your theme.

### Changed

- Scenes animate in pixel-art frames (8 a second for movement, 4 for fades) instead of smooth 60fps animation. It suits the art, and it's much lighter on the CPU: in my tests, Chrome's total use dropped from about 1.2 cores to 0.6 on average, across all seven scenes. Thanks to the Reddit comment that flagged it.
- The README and site FAQ explain both, and `npm test` checks every scene is on pixel frames and that the still version matches the moving one.

## [1.0.1] - 2026-11-15

### Fixed

- Sessions where a theme can't be drawn (the terminal, for one) now start cleanly. Before, they showed a "session.start hook skipped" line and `/neon` went missing.
- Stopped sending `overrideColorScheme`, which the desktop app ignores and some Claude Code builds refuse. Each palette already says whether it's light or dark, so nothing looks different.

### Changed

- The plugin now lives in its own folder, `plugins/cyberpunk-themes/`. Installs only get the plugin, not the website, the README film or the build scripts. The install command is the same.
- Every theme call is made directly in its hook, so the plugin directory can check exactly what it does.
- The plugin's README says what each hook does and what it sends where (nothing leaves your machine).
- Added `npm test`, which runs the plugin against Claude Code's own engine.

## 1.0.0 - 2026-11-14

### Added

- Seven themes, each an animated pixel scene plus a matching app palette:
  Neon Rooftop (purple), Phosphor Alley (green), Deep Net (blue), Ripperdoc (green), Badlands (orange),
  Blackwall (black, dark mode) and Corpo Plaza (white, light mode).
- `/neon` command to list themes, switch between them, or turn the theme off. The choice is remembered across sessions.
- Characters placed in the space between the conversation and an open side panel.
- `scripts/audit.mjs`: contrast, reduced-motion, flash-rate, SVG-safety and code-capability checks, run in CI.
- `scripts/build-assets.mjs`: renders the README's launch film and theme previews from the plugin's own scenes.
- A landing page on GitHub Pages (`docs/`): a live theme picker, the gallery, install steps and an FAQ, with search and social metadata.

[1.1.0]: https://github.com/nocashflow/claude-cyberpunk-themes/releases/tag/v1.1.0
[1.0.1]: https://github.com/nocashflow/claude-cyberpunk-themes/releases/tag/v1.0.1
