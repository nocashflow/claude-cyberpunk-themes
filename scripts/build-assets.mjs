// Builds the visuals in the README straight from the plugin's own scenes, so they never drift out of date:
//   assets/themes/<id>.svg  each theme's live scene, exactly as the app draws it
//   docs/themes/<id>.svg    the same scenes for the landing page (GitHub Pages only serves docs/)
//   assets/launch.svg       the launch film: a title card, every theme with an example chat, then all of them together
//   node --import ./scripts/ts-ext.mjs scripts/build-assets.mjs

import { mkdirSync, writeFileSync } from 'node:fs'
import { PALETTES } from '../plugins/cyberpunk-themes/hooks/palettes.ts'
import { SCENES } from './scenes.mjs'

const out = new URL('../assets/', import.meta.url)
mkdirSync(new URL('themes/', out), { recursive: true })

const escape = text => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// An example exchange per theme: the person's ask, Claude's reply in two short lines, and a line of code.
const EXAMPLES = {
  rooftop: ['Can you fix the flaky login test?', ['Found it: a race on the session cookie.', 'Patched, then re-ran it 50 times. All green.'], "await page.waitForResponse('/api/session')"],
  alley: ['Clean up the payment retry logic.', ['Retries now go through one backoff helper.', 'Three call sites share it; tests updated.'], "retry(charge, { attempts: 5, backoff: 'expo' })"],
  net: ['Why is the orders API slow?', ['An N+1 query in /orders. One join brings', 'p95 from 840 ms down to 90 ms.'], 'SELECT * FROM orders JOIN items USING (order_id)'],
  clinic: ['Add validation to the checkout form.', ['Every field now goes through one schema.', '14 new tests cover the edge cases.'], 'const Order = z.object({ qty: z.number().int() })'],
  badlands: ['Draft the release notes for v2.4.', ['Drafted from 37 merged pull requests,', 'grouped by area, breaking changes first.'], 'git log v2.3..HEAD --merges --oneline'],
  blackwall: ['Audit the auth middleware.', ['One finding: tokens were never checked', 'for expiry. Fixed, with a regression test.'], 'if (claims.exp < now()) throw new Unauthorized()'],
  noodle: ['Cache the product search results.', ['Searches go through a 60-second cache now.', 'Repeat queries dropped from 310 ms to 4 ms.'], 'cache.wrap(query, () => search(query), { ttl: 60 })'],
  corpo: ['Make the dashboard accessible.', ['Contrast and focus order fixed, and every', 'chart now has a text summary.'], '<Chart aria-describedby="sales-summary" />'],
}

const GLASS = {
  rooftop: ['#110d24', 0.62], alley: ['#08180f', 0.64], net: ['#08102a', 0.62], clinic: ['#081613', 0.64],
  badlands: ['#160c07', 0.62], blackwall: ['#08080a', 0.66], noodle: ['#120a1e', 0.62], corpo: ['#f6f5f9', 0.74],
}

for (const scene of SCENES) writeFileSync(new URL(`themes/${scene.id}.svg`, out), scene.build())

// The landing page in docs/ (GitHub Pages serves only that folder) shows the same scenes.
const site = new URL('../docs/themes/', import.meta.url)
mkdirSync(site, { recursive: true })
for (const scene of SCENES) {
  const svg = scene.build()
  writeFileSync(new URL(`${scene.id}.svg`, site), svg)
  // A still of the same scene, every animation at rest, for places that should not move (gallery tiles, reduced motion).
  writeFileSync(new URL(`${scene.id}-still.svg`, site), svg.replace('</style>', '*{animation:none!important}</style>'))
}

// The film: 1600 by 900. A title, then each theme for SEGMENT seconds, then the gallery; it loops.
const W = 1600
const H = 900
const TITLE = 4
const SEGMENT = 5
const FINALE = 6
const TOTAL = TITLE + SCENES.length * SEGMENT + FINALE
const share = seconds => ((seconds / TOTAL) * 100).toFixed(3)
const FADE = 0.7

// One keyframe per window length: fade in, hold, fade out, hidden for the rest of the loop.
const windowKeyframes = (name, seconds) =>
  `@keyframes ${name}{0%{opacity:0}${share(FADE)}%{opacity:1}${share(seconds - FADE)}%{opacity:1}${share(seconds)}%{opacity:0}100%{opacity:0}}`
const drift = `@keyframes drift{0%{transform:scale(1)}${share(SEGMENT)}%{transform:scale(1.05)}100%{transform:scale(1.05)}}`
const rise = `@keyframes rise{0%{transform:translateY(14px)}${share(1.2)}%{transform:translateY(0)}100%{transform:translateY(0)}}`

const font = "-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Inter,system-ui,sans-serif"
const mono = "ui-monospace,SFMono-Regular,Menlo,Consolas,monospace"

const toDataUri = svg => `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
const images = SCENES.map(s => `<image id="img-${s.id}" width="1600" height="1000" href="${toDataUri(s.build())}"/>`).join('')

function chat(scene) {
  const palette = PALETTES[scene.id]
  const a = palette[palette.only].gray.anchors
  const [tint, opacity] = GLASS[scene.id]
  const [ask, reply, code] = EXAMPLES[scene.id]
  const text = a['text-primary']
  const muted = a['text-muted']
  const accent = palette.roles.accent
  const x = 470
  const y = 150
  const w = 660
  return `<g class="rise" style="animation-delay:${TITLE + SCENES.indexOf(scene) * SEGMENT}s">` +
    `<rect x="${x}" y="${y}" width="${w}" height="520" rx="22" fill="${tint}" fill-opacity="${opacity}" stroke="${text}" stroke-opacity="0.12"/>` +
    `<rect x="${x + w - 380}" y="${y + 34}" width="350" height="44" rx="14" fill="${accent}" fill-opacity="0.18"/>` +
    `<text x="${x + w - 50}" y="${y + 62}" text-anchor="end" font-family="${font}" font-size="17" fill="${text}">${escape(ask)}</text>` +
    `<circle cx="${x + 46}" cy="${y + 128}" r="9" fill="${accent}"/>` +
    reply.map((line, i) => `<text x="${x + 68}" y="${y + 134 + i * 30}" font-family="${font}" font-size="18" fill="${text}">${escape(line)}</text>`).join('') +
    `<rect x="${x + 40}" y="${y + 210}" width="${w - 80}" height="64" rx="12" fill="#000" fill-opacity="${palette.only === 'light' ? 0.06 : 0.35}"/>` +
    `<text x="${x + 62}" y="${y + 248}" font-family="${mono}" font-size="15" fill="${accent}">${escape(code)}</text>` +
    `<text x="${x + 40}" y="${y + 320}" font-family="${font}" font-size="15" fill="${muted}">Edited 2 files, ran 1 command</text>` +
    `<rect x="${x + 40}" y="${y + 430}" width="${w - 80}" height="54" rx="16" fill="${text}" fill-opacity="0.06" stroke="${text}" stroke-opacity="0.18"/>` +
    `<text x="${x + 62}" y="${y + 463}" font-family="${font}" font-size="16" fill="${muted}">Reply to Claude…</text></g>`
}

function segment(scene, index) {
  const start = TITLE + index * SEGMENT
  const palette = PALETTES[scene.id]
  const labelInk = scene.mode === 'light' ? '#1b1a22' : '#ffffff'
  return `<g class="seg" style="animation-delay:${start}s">` +
    `<g class="drift" style="animation-delay:${start}s;transform-origin:800px 450px"><use href="#img-${scene.id}" transform="translate(0 -50)"/></g>` +
    `<rect width="${W}" height="${H}" fill="url(#shade-${scene.mode})"/>` +
    chat(scene) +
    `<text x="72" y="${H - 110}" font-family="${font}" font-size="52" font-weight="600" letter-spacing="-1" fill="${labelInk}">${escape(scene.title)}</text>` +
    `<text x="74" y="${H - 66}" font-family="${mono}" font-size="20" fill="${palette.roles.accent}">/neon ${scene.id}</text>` +
    `<text x="${W - 72}" y="${H - 66}" text-anchor="end" font-family="${font}" font-size="18" fill="${labelInk}" fill-opacity="0.75">${scene.colour} · ${scene.mode} mode</text></g>`
}

function finale() {
  const cols = 4
  const tw = 300
  const th = 188
  const gap = 24
  const left = (W - (cols * tw + (cols - 1) * gap)) / 2
  const tiles = SCENES.map((scene, i) => {
    const row = Math.floor(i / cols)
    const inRow = row === 0 ? cols : SCENES.length - cols
    const rowLeft = (W - (inRow * tw + (inRow - 1) * gap)) / 2
    const x = (row === 0 ? left : rowLeft) + (i % cols) * (tw + gap)
    const y = 300 + row * (th + gap + 30)
    return `<g><clipPath id="tile-${scene.id}"><rect x="${x}" y="${y}" width="${tw}" height="${th}" rx="14"/></clipPath>` +
      `<g clip-path="url(#tile-${scene.id})"><use href="#img-${scene.id}" transform="translate(${x} ${y}) scale(${th / 1000})"/></g>` +
      `<rect x="${x}" y="${y}" width="${tw}" height="${th}" rx="14" fill="none" stroke="#ffffff" stroke-opacity="0.14"/>` +
      `<text x="${x + 4}" y="${y + th + 24}" font-family="${font}" font-size="16" fill="#ffffff" fill-opacity="0.85">${escape(scene.title)}</text></g>`
  }).join('')
  return `<g class="finale" style="animation-delay:${TITLE + SCENES.length * SEGMENT}s"><rect width="${W}" height="${H}" fill="#050507"/>` +
    `<text x="${W / 2}" y="170" text-anchor="middle" font-family="${font}" font-size="64" font-weight="600" letter-spacing="-1.5" fill="#ffffff">Eight cities. One command.</text>` +
    `<text x="${W / 2}" y="226" text-anchor="middle" font-family="${mono}" font-size="22" fill="#9db4ff">/neon &lt;theme&gt;</text>${tiles}</g>`
}

const title = `<g class="title"><rect width="${W}" height="${H}" fill="#050507"/>` +
  `<text x="${W / 2}" y="${H / 2 - 20}" text-anchor="middle" font-family="${font}" font-size="88" font-weight="600" letter-spacing="-2.5" fill="#ffffff">Cyberpunk Themes</text>` +
  `<text class="sub" x="${W / 2}" y="${H / 2 + 50}" text-anchor="middle" font-family="${font}" font-size="28" fill="#ffffff" fill-opacity="0.7">for Claude Code. Eight pixel worlds behind your chat.</text></g>`

const style = `
.seg,.title{opacity:0}
.title{animation:win-title ${TOTAL}s ease-in-out infinite}
.seg{animation:win-seg ${TOTAL}s ease-in-out infinite backwards}
.finale{opacity:1;animation:win-finale ${TOTAL}s ease-in-out infinite backwards}
.drift{animation:drift ${TOTAL}s ease-out infinite backwards}
.rise{animation:rise ${TOTAL}s ease-out infinite backwards}
${windowKeyframes('win-title', TITLE)}${windowKeyframes('win-seg', SEGMENT)}${windowKeyframes('win-finale', FINALE)}${drift}${rise}
@media (prefers-reduced-motion: reduce){*{animation:none!important}.title,.seg{opacity:0!important}.finale{opacity:1!important}}`

const film = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t d">` +
  `<title id="t">Cyberpunk Themes for Claude Code</title>` +
  `<desc id="d">A short looping film: a title card, then each of the eight themes (${SCENES.map(s => s.title).join(', ')}) behind an example conversation, then all eight side by side.</desc>` +
  `<style>${style}</style><defs>${images}` +
  `<linearGradient id="shade-dark" x1="0" y1="0" x2="0" y2="1"><stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.75"/></linearGradient>` +
  `<linearGradient id="shade-light" x1="0" y1="0" x2="0" y2="1"><stop offset="0.55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity="0.7"/></linearGradient></defs>` +
  `<rect width="${W}" height="${H}" fill="#050507"/>${finale()}${SCENES.map(segment).join('')}${title}</svg>`

writeFileSync(new URL('launch.svg', out), film)
console.log(`launch.svg ${(film.length / 1024).toFixed(0)} KB, ${TOTAL}s loop; ${SCENES.length} theme scenes written`)
