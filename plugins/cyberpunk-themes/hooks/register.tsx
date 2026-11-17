// The actual plugin. It does three things:
//   1. when a session starts, applies whichever theme you picked last (Neon Rooftop if you never picked one),
//   2. handles the /neon command for listing and switching themes,
//   3. draws the chosen theme's scene behind the chat.
// That's all it does: it never reads your work, never touches the network, and only remembers two things:
// the theme you picked, and whether you turned the scene's motion off.

import type { Register, ThemeScene, ThemeSetArgs } from 'claude-code'

import { phosphorAlleySvg } from './alley'
import { badlandsSvg } from './badlands'
import { blackwallSvg } from './blackwall'
import { corpoPlazaSvg } from './corpo'
import { deepNetSvg } from './deepnet'
import { makeColors } from './make-colors.js'
import { neon2099Svg } from './neon2099'
import { PALETTES } from './palettes'
import { ripperdocSvg } from './ripperdoc'
import { neonRooftopSvg } from './scene'

const PLUGIN = 'cyberpunk-themes'
const COMMAND = 'neon'
const STORE_KEY = 'scene'
const MOTION_KEY = 'motion'
/** Added to a scene's name when its motion is off, so the backdrop knows to draw it still. */
const STILL = '-still'

type Look = { id: string; title: string; blurb: string; theme: ThemeSetArgs; problems: string[]; svg: () => string; alt: string }

const rooftopColors = makeColors(PALETTES.rooftop!)
const alleyColors = makeColors(PALETTES.alley!)
const netColors = makeColors(PALETTES.net!)
const clinicColors = makeColors(PALETTES.clinic!)
const badlandsColors = makeColors(PALETTES.badlands!)
const blackwallColors = makeColors(PALETTES.blackwall!)
const noodleColors = makeColors(PALETTES.noodle!)
const corpoColors = makeColors(PALETTES.corpo!)

function look(id: string, title: string, blurb: string, colors: ReturnType<typeof makeColors>, scene: string, tint: string, opacity: number, svg: () => string, alt: string): Look {
  return {
    id,
    title,
    blurb,
    // No overrideColorScheme: each palette gives one mode only, so the app already draws it as light or dark.
    theme: { colors: colors.theme, backdrop: { scene, glass: { blur: 10, tint, opacity } } },
    problems: colors.problems,
    svg,
    alt,
  }
}

const LOOKS: readonly Look[] = [
  look('rooftop', 'Neon Rooftop', 'Purple: a pixel city in soft neon; two mascots watch the moon from a rooftop.', rooftopColors, 'neon-rooftop', '#110d24', 0.46, neonRooftopSvg,
    'A pixel city at night: two small mascots sit on a rooftop watching a big moon'),
  look('alley', 'Phosphor Alley', 'Green: a rainy back street; the mascots share an LED umbrella on a power line.', alleyColors, 'phosphor-alley', '#08180f', 0.48, phosphorAlleySvg,
    'A rainy green alley at night: two small mascots under an umbrella on a power line, a hologram jellyfish above'),
  look('net', 'Deep Net', 'Blue: inside cyberspace; a netrunner breaches a wall of ICE.', netColors, 'deep-net', '#08102a', 0.46, deepNetSvg,
    'Blue cyberspace: a wireframe grid, a hexagon wall with a glowing breach, a netrunner on a floating platform'),
  look('clinic', 'Ripperdoc', 'Green: a back-alley cyberware clinic; a doc fits a chrome arm.', clinicColors, 'ripperdoc', '#081613', 0.48, ripperdocSvg,
    'A green cyberware clinic: a heart monitor, spare chrome parts, jars of eyes, a doc working on a patient under a lamp'),
  look('badlands', 'Badlands', 'Orange: the desert at dusk; nomads by a car under a striped sun.', badlandsColors, 'badlands', '#160c07', 0.46, badlandsSvg,
    'An orange desert at dusk: a striped sun behind mesas, a motel sign, two mascots by a nomad car'),
  look('blackwall', 'Blackwall', 'Black: the edge of the Net; red eyes in the cracks.', blackwallColors, 'blackwall', '#08080a', 0.52, blackwallSvg,
    'A black wall of code with red cracks and eyes, a red mask, a hooded runner and a drone'),
  look('noodle', 'Neon 2099', 'Pink: a noodle bar under the megacity; Claude codes at the counter while the cook works.', noodleColors, 'neon-2099', '#120a1e', 0.48, neon2099Svg,
    'A pink and cyan megacity in the rain: a noodle bar under neon signs, Claude on a stool coding on a hologram, a cook behind the counter'),
  look('corpo', 'Corpo Plaza', 'White, for light mode: a pristine plaza under a red hologram.', corpoColors, 'corpo-plaza', '#f6f5f9', 0.6, corpoPlazaSvg,
    'A white corporate plaza: glass towers, a red hologram emblem, a cherry tree, a corpo in a suit and a security bot'),
]

/** Scenes get built once, the first time a window needs them, and reused after that. */
const built = new Map<string, string>()

function lookOf(word: string): Look | undefined {
  return LOOKS.find(one => one.id === word || one.title.toLowerCase() === word || sceneOf(one) === word)
}

function sceneOf(chosen: Look): string | undefined {
  const backdrop = chosen.theme.backdrop
  return backdrop !== undefined && 'scene' in backdrop ? backdrop.scene : undefined
}

/** The theme to set: the same look, with the still version of its scene when motion is off. */
function themeOf(chosen: Look, still: boolean): ThemeSetArgs {
  const backdrop = chosen.theme.backdrop
  if (!still || backdrop === undefined || !('scene' in backdrop)) return chosen.theme
  const moving = backdrop as ThemeScene
  return { ...chosen.theme, backdrop: { ...moving, scene: moving.scene + STILL } }
}

/** Freezes a scene on its first frame: the same rule reduced motion uses, applied all the time. */
function stillOf(svg: string): string {
  return svg.replace('<style>', '<style>*{animation:none!important}')
}

/** A palette line the desktop app can't paint, if there is one, to show as a notice. */
function unpaintedOf(chosen: Look): string | undefined {
  return chosen.problems.find(line => line.startsWith("Desktop won't paint"))
}

/** What /neon says when this window, or this Claude Code build, won't take a theme at all (the terminal, for one). */
const NO_THEMES_HERE = "This window can't show themes, but your pick is saved for the desktop app's Code tab."

// The theme gets set right inside each hook, on the hook's own `$`, rather than in a shared helper.
// That way the plugin directory's checker can see exactly what's being called.
// Some places refuse a theme outright instead of answering isDrawn: false (the terminal does, for one).
// So each call is wrapped: a window that can't draw the theme just carries on without it.

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: COMMAND, description: 'Switch the cyberpunk theme: /neon to list them, /neon <name>, /neon off, /neon motion off' })
    const kept = await $.store.get(STORE_KEY)
    const still = (await $.store.get(MOTION_KEY)) === 'off'
    const chosen = kept === 'off' ? undefined : (lookOf(String(kept ?? '')) ?? LOOKS[0])

    if (chosen !== undefined) {
      const unpainted = unpaintedOf(chosen)
      if (unpainted !== undefined) $.ui.toast(unpainted)
      try {
        const set = await $.theme.set(themeOf(chosen, still))
        if (!set.isDrawn) $.ui.status(set.reason)
      } catch {
        // Nothing to draw in this window. The session carries on as normal, and /neon still works.
      }
    }

    return next(e)
  })

  on('command.run', { command: COMMAND }, async ($, e) => {
    const word = (e.args ?? '').trim().toLowerCase()

    if (word === 'off') {
      await $.store.set(STORE_KEY, 'off')
      try {
        await $.theme.clear()
      } catch {
        // A window that never drew the theme has nothing to clear.
      }
      return { text: "Theme off. /neon <name> turns one back on." }
    }

    // /neon motion on|off keeps the theme and turns the scene's animation on or off. Easier on a laptop battery.
    const motion = /^motion(?:\s+(on|off))?$/.exec(word)

    if (motion !== null) {
      if (motion[1] === undefined) {
        const off = (await $.store.get(MOTION_KEY)) === 'off'
        return { text: off ? 'Motion is off: scenes stay still. /neon motion on brings it back.' : 'Motion is on. /neon motion off keeps the theme but stops the scene moving, which is easier on a laptop battery.' }
      }

      const still = motion[1] === 'off'
      await $.store.set(MOTION_KEY, still ? 'off' : 'on')
      const said = still ? 'Motion off: the scene stays still. /neon motion on brings it back.' : 'Motion on.'
      const kept = await $.store.get(STORE_KEY)
      const current = kept === 'off' ? undefined : (lookOf(String(kept ?? '')) ?? LOOKS[0])

      if (current === undefined) {
        return { text: `${said} It'll apply when you turn a theme on.` }
      }

      try {
        await $.theme.set(themeOf(current, still))
      } catch {
        // This window can't show themes. The setting is saved for one that can.
      }
      return { text: said }
    }

    const chosen = lookOf(word)

    if (chosen === undefined) {
      const list = LOOKS.map(one => `  /neon ${one.id.padEnd(11)} ${one.title}: ${one.blurb}`).join('\n')
      const extra = "  /neon off          back to the app's own look\n  /neon motion off   keep the theme, stop the scene moving (on brings it back)"
      return { text: `${word === '' ? 'Themes:' : `No theme named "${word}". Themes:`}\n${list}\n${extra}` }
    }

    await $.store.set(STORE_KEY, chosen.id)
    const still = (await $.store.get(MOTION_KEY)) === 'off'
    const unpainted = unpaintedOf(chosen)
    if (unpainted !== undefined) $.ui.toast(unpainted)
    try {
      const set = await $.theme.set(themeOf(chosen, still))
      return { text: set.isDrawn ? `${chosen.title} on.` : `${chosen.title} saved, but this window can't show it: ${set.reason}` }
    } catch {
      return { text: `${chosen.title} picked. ${NO_THEMES_HERE}` }
    }
  }).catch(($, e, next) => (next.called ? next(e) : { text: "The theme couldn't be switched. Try /reload-plugins, then /neon again." }))

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if (e.props.plugin !== PLUGIN || (e.surface !== 'desktop' && e.surface !== 'mobile')) {
      return next(e)
    }

    const scene = typeof e.props.scene === 'string' ? e.props.scene : ''
    const still = scene.endsWith(STILL)
    const chosen = lookOf(still ? scene.slice(0, -STILL.length) : scene)

    if (chosen === undefined) {
      return next(e)
    }

    const { Svg } = $.ui.resolve(e)
    const key = chosen.id + (still ? STILL : '')
    let svg = built.get(key)

    if (svg === undefined) {
      svg = still ? stillOf(chosen.svg()) : chosen.svg()
      built.set(key, svg)
    }

    return <Svg isInteractive source={svg} alt={chosen.alt} />
  })
}
