# cyberpunk-themes

Eight pixel-art cyberpunk themes for the Claude Code desktop app. Each one puts an animated scene behind your chat and recolours the app to match. They show up in the desktop app's Code tab.

Screenshots, the full story and the source for the website and build scripts are in the repository: https://github.com/nocashflow/claude-cyberpunk-themes

## Install

Paste this into the message box of the Claude Code desktop app:

```
/plugin install cyberpunk-themes --marketplace nocashflow/claude-cyberpunk-themes
```

Say `y` to add the marketplace, then pick a scope. **user** makes the themes work in every project.

## Using it

| Type | What happens |
| --- | --- |
| `/neon` | Lists the themes |
| `/neon <theme>` | Switches to it and remembers it for every session |
| `/neon off` | Back to the app's own look |
| `/neon motion off` / `on` | Keeps the theme but stops the scene moving, or starts it again |

The themes are `rooftop`, `alley`, `net`, `clinic`, `badlands`, `blackwall`, `noodle` (dark mode) and `corpo` (light mode).

## What it does, exactly

It's a mod: one TypeScript module, `hooks/register.tsx`, with three hooks.

- **`session.start`** registers `/neon`, reads the theme you saved, and sets it. If you never picked one, it uses Neon Rooftop. If you turned it off, it does nothing. Then it lets the session carry on as normal.
- **`command.run`** (only for `/neon`) answers `/neon`, `/neon <theme>`, `/neon off` and `/neon motion on|off`. It never sees or changes any other command, and never runs one itself.
- **`ui.render`** (only for `Backdrop`) draws the scene for this plugin's own backdrop. Any other plugin's backdrop, and every other part of the app, gets passed straight through untouched.

The calls it makes are `$.command.register`, `$.store.get` / `$.store.set`, `$.theme.set` / `$.theme.clear`, `$.ui.toast` / `$.ui.status` and `$.ui.resolve`. That's the whole list.

## What it sends, and where

Nothing ever leaves your machine. It only passes things to Claude Code itself:

- the theme you picked (colours plus the name of the scene) goes to `$.theme.set`;
- the scene's SVG goes to the app's own `Svg` element so it can draw it;
- the theme name and your motion setting are stored with `$.store`, on your machine;
- the list of themes goes back to you as the reply to `/neon`.

It has no network, file, process, model or tool access, reads nothing about your work, and has no dependencies or install scripts. The scenes are plain SVG built from text in the `hooks/*.ts` files: no scripts, links, external resources or embedded images.

## Files

- `hooks/register.tsx`: the hooks above.
- `hooks/palettes.ts`: each theme's colours.
- `hooks/scene.ts`, `alley.ts`, `deepnet.ts`, `ripperdoc.ts`, `badlands.ts`, `blackwall.ts`, `neon2099.ts`, `corpo.ts`: one scene each, written as pixel-art text maps.
- `hooks/kit.ts`, `hooks/extras.ts`: shared drawing helpers.
- `hooks/make-colors.js` and `make-colors.d.ts`: Claude Code's own colour helper, copied in unchanged from its mod kit (see `NOTICE`). The long strings of hex in it are the app's colour scales written out back to back: colour values, not encoded data.

## Licence

MIT, see `LICENSE`. The two `make-colors` files keep their original terms (see `NOTICE`).
