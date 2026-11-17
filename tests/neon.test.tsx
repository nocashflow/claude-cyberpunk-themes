// Checks the plugin does what the README says, run against Claude Code's own engine with `npm test`.
// Nothing sits beneath the plugin here: each `on(...)` below plays the part of the app.
//
// The test runner has no desktop window, so it refuses a backdrop the way the terminal does.
// That makes these tests the "no window" path: the command, the saved choice, the list, `off`, and
// the drawing itself. That a theme actually shows up is checked by hand in the desktop app (see CONTRIBUTING.md).

import { expect, mock, test } from 'claude-code/testing'

const PLUGIN = 'cyberpunk-themes'
const THEMES: [string, string, string][] = [
  ['rooftop', 'Neon Rooftop', 'neon-rooftop'],
  ['alley', 'Phosphor Alley', 'phosphor-alley'],
  ['net', 'Deep Net', 'deep-net'],
  ['clinic', 'Ripperdoc', 'ripperdoc'],
  ['badlands', 'Badlands', 'badlands'],
  ['blackwall', 'Blackwall', 'blackwall'],
  ['noodle', 'Neon 2099', 'neon-2099'],
  ['corpo', 'Corpo Plaza', 'corpo-plaza'],
]

type On = Parameters<Parameters<typeof test>[1]>[1]
type Engine = Parameters<Parameters<typeof test>[1]>[0]

/** Stands in for the app, and keeps a note of what the plugin asked for. */
function app(on: On) {
  const seen = { commands: [] as string[], cleared: 0, statuses: [] as unknown[] }
  on('command.register', (_, e) => { seen.commands.push(e.name); return { value: { command: e.name } } })
  on('theme.set', () => ({ value: { isDrawn: true, requestId: 'theme-1' } }))
  on('theme.clear', () => { seen.cleared++; return { value: { isDrawn: false, reason: 'cleared' } } })
  on('ui.status', (_, e) => { seen.statuses.push(e); return { value: undefined } })
  on('ui.toast', () => ({ value: undefined }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  return seen
}

const start = ($: Engine) => $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
const neon = async ($: Engine, args = '') => (await $.command.run({ command: 'neon', args })).text ?? ''
const switched = (title: string) => new RegExp(`^${title} (on\\.|picked\\. |saved, but )`)

test('every session registers /neon and starts cleanly, even where no theme can be drawn', async ($, on) => {
  mock.store(on)
  const seen = app(on)
  await start($)
  await start($)
  expect(seen.commands).toEqual(['neon', 'neon'])
})

test('/neon <theme> works for every theme, by short name or by full title, in any case', async ($, on) => {
  const store: Record<string, unknown> = {}
  mock.store(on, store)
  app(on)
  for (const [id, title] of THEMES) {
    expect(switched(title).test(await neon($, id))).toBe(true)
    expect(switched(title).test(await neon($, `  ${title.toUpperCase()} `))).toBe(true)
  }
})

test('/neon on its own lists all eight plus off and motion, and a typo lists them too', async ($, on) => {
  mock.store(on)
  app(on)
  const list = await neon($)
  expect(list.startsWith('Themes:')).toBe(true)
  for (const [id, title] of THEMES) expect(list.includes(`/neon ${id}`) && list.includes(title)).toBe(true)
  expect(list.split('\n').filter(line => line.startsWith('  /neon ')).length).toBe(10)
  expect(list.includes('/neon motion off')).toBe(true)
  expect((await neon($, 'alleyy')).startsWith('No theme named "alleyy". Themes:')).toBe(true)
})

test('/neon off clears the theme', async ($, on) => {
  mock.store(on, { scene: 'net' })
  const seen = app(on)
  expect(await neon($, 'off')).toBe('Theme off. /neon <name> turns one back on.')
  expect(seen.cleared).toBe(1)
})

const backdrop = (plugin: string, scene: string) => ({
  plugin,
  component: 'Backdrop',
  surface: 'desktop',
  props: { plugin, scene, glass: { blur: 10, opacity: 0.46 } },
} as const)

test('the backdrop draws each theme as a described SVG with no scripts or links', async ($, on) => {
  app(on)
  for (const [, , scene] of THEMES) {
    const ui = await $.ui.mount(backdrop(PLUGIN, scene))
    const svg = await ui.find({ type: 'Svg' })
    const source = String(svg?.props.source)
    expect(source.startsWith('<svg')).toBe(true)
    expect(source.length < 131072).toBe(true)
    expect(/<script|\son[a-z]+=|href="http/i.test(source)).toBe(false)
    expect(String(svg?.props.alt).length > 20).toBe(true)
    await ui.unmount()
  }
})

test("an unknown scene, and another plugin's backdrop, are left alone", async ($, on) => {
  app(on)
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>someone else's</Text>
  })
  for (const target of [backdrop('another-theme', 'neon-rooftop'), backdrop(PLUGIN, 'not-a-scene')]) {
    const ui = await $.ui.mount(target)
    expect(await ui.find({ type: 'Svg' })).toBeUndefined()
    expect((await ui.find({ type: 'Text' }))?.text).toBe("someone else's")
    await ui.unmount()
  }
})

test('/neon motion off and on say what they did, and /neon motion reports which it is', async ($, on) => {
  mock.store(on, { scene: 'alley' })
  app(on)
  expect(await neon($, 'motion')).toBe('Motion is on. /neon motion off keeps the theme but stops the scene moving, which is easier on a laptop battery.')
  expect(await neon($, 'motion off')).toBe('Motion off: the scene stays still. /neon motion on brings it back.')
  expect(await neon($, 'MOTION')).toBe('Motion is off: scenes stay still. /neon motion on brings it back.')
  expect(switched('Ripperdoc').test(await neon($, 'clinic'))).toBe(true)
  expect(await neon($, 'motion on')).toBe('Motion on.')
  expect((await neon($, 'motion')).startsWith('Motion is on.')).toBe(true)
})

test('/neon motion with the theme off is saved for later', async ($, on) => {
  mock.store(on, { scene: 'off' })
  app(on)
  expect(await neon($, 'motion off')).toBe("Motion off: the scene stays still. /neon motion on brings it back. It'll apply when you turn a theme on.")
})

test('a still scene is the same drawing with every animation stopped', async ($, on) => {
  app(on)
  for (const [, , scene] of THEMES) {
    const moving = await $.ui.mount(backdrop(PLUGIN, scene))
    const still = await $.ui.mount(backdrop(PLUGIN, `${scene}-still`))
    const a = String((await moving.find({ type: 'Svg' }))?.props.source)
    const b = String((await still.find({ type: 'Svg' }))?.props.source)
    expect(b).toBe(a.replace('<style>', '<style>*{animation:none!important}'))
    expect(String((await still.find({ type: 'Svg' }))?.props.alt).length > 20).toBe(true)
    await moving.unmount()
    await still.unmount()
  }
})

test('every moving scene runs on pixel frames: no smooth easing left', async ($, on) => {
  app(on)
  for (const [, , scene] of THEMES) {
    const ui = await $.ui.mount(backdrop(PLUGIN, scene))
    const source = String((await ui.find({ type: 'Svg' }))?.props.source)
    expect(/animation:[\w-]+ [\d.]+s( -?[\d.]+s)? (linear|ease|ease-in|ease-out|ease-in-out)[ ;}"]/.test(source)).toBe(false)
    expect(/steps\(\d+\)/.test(source)).toBe(true)
    await ui.unmount()
  }
})
