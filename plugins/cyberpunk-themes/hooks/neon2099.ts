// Neon 2099. A noodle bar at the foot of the megacity, late at night, in hot pink and cyan.
// Towers climb up both edges and stay low in the middle, signs in the made-up script hum down their sides, and
// flying cars stream past in lanes. Pink rain falls on everything, and the wet street throws the signs back up.
// Under the bar's awning Claude sits on a stool at the end of the counter, coding. A cable runs from its back to a
// plug in the street, code scrolls on a hologram as it types, and the cook works behind the counter next to a pot.
// A hover-bike idles at the kerb on the left, and every so often a delivery drone heads out with someone's order.

import { EXTRA_STYLE, flyingCar, glyphSign } from './extras'
import { HEIGHT, PAIR_LEFT, PAIR_RIGHT, WIDTH, figure, grain, hash, rain, rect, sprite, square, svgRoot } from './kit'

/** The pavement the bar stands on, and where the road starts. */
const FLOOR = 812
const KERB = 842
const SEAT = 770
const COUNTER = 742
const PINK = '#ff3ea5'
const CYAN = '#29e3ff'
const AMBER = '#ffb04a'
const CREAM = '#f3ecf8'
const PLUM = '#2e1a44'
const NIGHT = '#100820'
const CORAL = '#d97757'

/** A row of pixel towers standing on `base`, taller toward the edges so the middle, behind the chat, stays low. */
function towers(seed: number, base: number, fill: string, low: number, high: number, lit: number): string {
  let shapes = ''
  let pink = ''
  let cyan = ''
  let amber = ''
  let x = -10
  for (let i = 0; x < WIDTH + 10; i += 1) {
    const w = 40 + Math.floor(hash(seed, i) * 70)
    const edge = Math.min(1, Math.abs(x + w / 2 - 760) / 620)
    const h = Math.round(((low + hash(seed + 1, i) * (high - low)) * (0.2 + 0.8 * edge * edge)) / 4) * 4
    const top = base - h
    shapes += rect(x, top, w, h)
    if (hash(seed + 3, i) < 0.3) shapes += rect(x + Math.floor(w / 2) - 1, top - 30, 3, 30)
    for (let wy = top + 10; wy < base - 16; wy += 14) {
      for (let wx = x + 6; wx < x + w - 8; wx += 10) {
        if (hash(seed * 31 + wx, wy) >= lit) continue
        const pick = hash(wx, wy + seed)
        if (pick < 0.4) pink += rect(wx, wy, 4, 6)
        else if (pick < 0.7) cyan += rect(wx, wy, 4, 6)
        else amber += rect(wx, wy, 4, 6)
      }
    }
    x += w + 2 + Math.floor(hash(seed + 2, i) * 6)
  }
  return `<path d="${shapes}" fill="${fill}"/>` +
    `<path class="win" d="${pink}" fill="${PINK}" fill-opacity="0.6"/>` +
    `<path class="win" style="animation-delay:-5s" d="${cyan}" fill="${CYAN}" fill-opacity="0.5"/>` +
    `<path class="win" style="animation-delay:-10s" d="${amber}" fill="${AMBER}" fill-opacity="0.45"/>`
}

/** Windows on a block, a few lit and more dim, leaving the columns where a sign hangs. */
function lights(left: number, right: number, top: number, bottom: number, seed: number, colour: string, signs: readonly number[] = []): string {
  let lit = ''
  let dim = ''
  for (let y = top; y < bottom; y += 24) {
    for (let x = left; x < right; x += 20) {
      if (signs.some(s => x + 14 > s && x < s + 20)) continue
      const roll = hash(seed + x, y)
      if (roll < 0.14) lit += rect(x, y, 10, 12)
      else if (roll < 0.45) dim += rect(x, y, 10, 12)
    }
  }
  return `<path d="${dim}" fill="#1d1131"/><path class="win" style="animation-delay:-${seed % 7}s" d="${lit}" fill="${colour}" fill-opacity="0.45"/>`
}

/** The tower on the left and the shorter block beside it: windows, pink ledges, an antenna and three signs. */
function leftBlock(): string {
  const ledges = [180, 300, 420, 540, 660].map(y => rect(-10, y, 250, 3)).join('')
  return `<path d="${rect(-10, 40, 250, FLOOR - 40)}${rect(240, 300, 150, FLOOR - 300)}${rect(310, 240, 3, 60)}" fill="${NIGHT}"/>` +
    lights(12, 160, 70, FLOOR - 40, 700, AMBER) + lights(254, 340, 330, FLOOR - 40, 800, PINK) +
    `<path d="${ledges}" fill="${PINK}" fill-opacity="0.18"/><path d="${rect(238, 40, 2, FLOOR - 40)}" fill="${PINK}" fill-opacity="0.25"/>` +
    `<path class="beacon" d="${square(308, 234, 6)}" fill="${PINK}"/>` +
    glyphSign(176, 110, 18, PINK, 5) + glyphSign(212, 250, 12, CYAN, 9) + glyphSign(352, 330, 8, AMBER, 17)
}

/** The building over the bar, the taller one behind it on the far right, and their signs. */
function barBlock(): string {
  return `<path d="${rect(996, 250, 404, 345)}${rect(1390, 30, 220, 565)}${rect(996, 590, 30, FLOOR - 590)}" fill="${NIGHT}"/>` +
    lights(1036, 1380, 274, 500, 900, PINK) + lights(1404, WIDTH, 60, 580, 1000, AMBER, [1444, 1540]) +
    `<path d="${rect(1036, 410, 120, 3)}${rect(1236, 338, 100, 3)}" fill="${CYAN}" fill-opacity="0.3"/>` +
    glyphSign(1006, 290, 9, CYAN, 33) + glyphSign(1444, 90, 16, PINK, 23) + glyphSign(1540, 150, 12, CYAN, 29)
}

const SIGN_BOWL = `
...........s..s.
............s..s
.cccccccccccccc.
.cccccccccccccc.
..cccccccccccc..
...cccccccccc...
.....cccccc.....
`

/** The bar's own sign over the awning: a pixel bowl and a line of the script, humming. */
function shopSign(x: number, y: number): string {
  let tiles = ''
  for (let i = 0; i < 8; i += 1) tiles += glyphSign(x + 90 + i * 20, y + 20, 1, CYAN, 41 + i)
  return `<ellipse class="glow" cx="${x + 135}" cy="${y + 28}" rx="200" ry="80" fill="url(#pinkglow)"/>` +
    `<g class="hum"><path d="${rect(x, y, 270, 56)}" fill="#0d0a1c" stroke="${PINK}" stroke-width="3"/>${sprite(SIGN_BOWL, x + 14, y + 14, 4, { c: PINK, s: CREAM })}</g>` +
    tiles
}

/** The awning over the bar: a striped canopy with a pink neon edge and its glow falling on the wall below. */
function awning(edge: number): string {
  let stripes = ''
  for (let x = 1036; x < WIDTH; x += 40) stripes += rect(x, 592, 20, edge - 592)
  return `<path d="M1010 ${edge}L1034 592H${WIDTH}V${edge}Z" fill="#1f1033"/><path d="${stripes}" fill="#2a1542"/>` +
    `<rect x="1010" y="${edge}" width="${WIDTH - 1010}" height="44" fill="url(#awnglow)"/>` +
    `<path class="hum" d="${rect(1010, edge - 3, WIDTH - 1010, 3)}" fill="${PINK}"/>`
}

const LANTERN = `
..s..
.lll.
lLLLl
lLLLl
.lll.
..t..
`

/** A paper lantern on a short string, swaying a little. */
function lantern(x: number, y: number, colour: string, delay: number): string {
  return `<circle class="glow" cx="${x + 10}" cy="${y + 14}" r="26" fill="url(#${colour === PINK ? 'pinkglow' : 'amberglow'})"/>` +
    `<g class="sway" style="animation-delay:-${delay}s">${sprite(LANTERN, x, y, 4, { s: PLUM, l: colour, L: '#ffe1f0', t: colour })}</g>`
}

/** A menu on the back wall: rows of the script in amber tiles. */
function menu(x: number, y: number, columns: number, rows: number): string {
  let tiles = ''
  for (let r = 0; r < rows; r += 1) for (let c = 0; c < columns; c += 1) tiles += glyphSign(x + c * 20, y + r * 20, 1, AMBER, x + r * 6 + c)
  return tiles
}

/** The drinks cooler in the corner: cyan glass, three shelves of bottles, flickering now and then. */
function cooler(x: number, y: number): string {
  const w = 96
  let bottles = ''
  let pinkBottles = ''
  for (const shelf of [40, 80, 120]) {
    for (let k = 0; k < 7; k += 1) {
      const b = rect(x + 12 + k * 11, y + shelf - 14, 6, 14)
      if (hash(shelf, k) < 0.5) bottles += b
      else pinkBottles += b
    }
  }
  return `<path d="${rect(x, y, w, FLOOR - y)}" fill="${PLUM}"/>` +
    `<g class="flick"><path d="${rect(x + 6, y + 6, w - 12, 124)}" fill="${CYAN}" fill-opacity="0.16"/>` +
    `<path d="${rect(x + 6, y + 40, w - 12, 2)}${rect(x + 6, y + 80, w - 12, 2)}${rect(x + 6, y + 120, w - 12, 2)}" fill="${CYAN}" fill-opacity="0.5"/>` +
    `<path d="${bottles}" fill="${CYAN}" fill-opacity="0.7"/><path d="${pinkBottles}" fill="${PINK}" fill-opacity="0.7"/></g>` +
    `<path d="${rect(x, FLOOR - 18, w, 18)}" fill="#1d1030"/>`
}

const POT = `
.....hhhh.....
.llllllllllll.
oppppppppppppo
.pppppppppppp.
.pppppppppppp.
..pppppppppp..
`

const BOWL = `
nnnnnnnnnn
.cccccccc.
..cccccc..
`

/** A wisp of steam: three squares rising and fading. */
function steam(x: number, y: number, delay: number): string {
  return `<path class="steam" style="animation-delay:-${delay}s" d="${square(x, y, 4)}${square(x + 3, y - 8, 3)}${square(x - 1, y - 16, 3)}" fill="${CREAM}" fill-opacity="0.6"/>`
}

/** The counter: a slab with a pink neon lip, a slatted front with a few tiles of the script, and a pot and a bowl on top. */
function counter(left: number, right: number): string {
  let slats = ''
  for (let x = left + 12; x < right - 8; x += 24) slats += rect(x, COUNTER + 14, 2, FLOOR - COUNTER - 18)
  return `<path d="${rect(left, COUNTER + 10, right - left, FLOOR - COUNTER - 10)}" fill="#170c28"/><path d="${slats}" fill="#21123a"/>` +
    `<path d="${rect(left - 6, COUNTER, right - left + 12, 8)}" fill="${PLUM}"/>` +
    `<path class="hum" d="${rect(left - 6, COUNTER + 8, right - left + 12, 2)}" fill="${PINK}"/>` +
    glyphSign(right - 70, 774, 1, AMBER, 51) + glyphSign(right - 50, 774, 1, AMBER, 52) + glyphSign(right - 30, 774, 1, AMBER, 53) +
    sprite(POT, 1378, COUNTER - 24, 4, { h: '#8a77a3', l: '#6b5a85', o: '#4a3a62', p: '#5a4a72' }) +
    steam(1392, 708, 0) + steam(1408, 712, 1.1) + steam(1422, 706, 2.2) +
    sprite(BOWL, 1296, COUNTER - 12, 4, { n: '#ffd9a0', c: PINK }) +
    steam(1308, 722, 0.6) + steam(1322, 724, 1.8)
}

/** A bar stool: a seat with a pink rim on one post. */
function stool(x: number): string {
  return `<path d="${rect(x, SEAT, 64, 6)}" fill="#3a2256"/><path d="${rect(x, SEAT, 64, 2)}" fill="${PINK}" fill-opacity="0.6"/>` +
    `<path d="${rect(x + 28, SEAT + 6, 8, FLOOR - SEAT - 10)}${rect(x + 14, FLOOR - 4, 36, 4)}" fill="${PLUM}"/>`
}

/** Claude's keyboard on the counter and the hologram it codes on: code scrolling in a cyan frame, a cursor blinking. */
function holoDesk(x: number, y: number, w: number, h: number): string {
  let keys = ''
  for (let k = 0; k < 7; k += 1) keys += square(1214 + k * 6, COUNTER - 6, 3)
  let lines = ''
  for (let copy = 0; copy < 3; copy += 1) {
    for (let k = 0; k < 8; k += 1) {
      const indent = Math.floor(hash(k, 77) * 3) * 4
      lines += rect(x + 5 + indent, y + 5 + copy * 48 + k * 6, 10 + Math.floor(hash(k, 78) * (w - 20 - indent)), 2)
    }
  }
  let scan = ''
  for (let k = 0; k < h; k += 3) scan += rect(x, y + k, w, 1)
  return `<path d="${rect(1210, COUNTER - 8, 52, 8)}" fill="${PLUM}"/><path d="${keys}" fill="${CYAN}" fill-opacity="0.8"/>` +
    `<polygon points="1214,${COUNTER - 8} 1258,${COUNTER - 8} ${x + w},${y + h} ${x},${y + h}" fill="${CYAN}" fill-opacity="0.08"/>` +
    `<g class="bob"><path d="${rect(x, y, w, h)}" fill="${CYAN}" fill-opacity="0.1"/><path d="${scan}" fill="${CYAN}" fill-opacity="0.08"/>` +
    `<g clip-path="url(#holoclip)"><g class="scroll"><path d="${lines}" fill="${PINK}" fill-opacity="0.85"/></g></g>` +
    `<path d="${rect(x, y, w, 2)}${rect(x, y + h - 2, w, 2)}${rect(x, y, 2, h)}${rect(x + w - 2, y, 2, h)}" fill="${CYAN}" fill-opacity="0.85"/>` +
    `<path class="beacon" d="${square(x + w - 8, y + h - 7, 4)}" fill="${CYAN}"/></g>`
}

/** The cable from the jack in Claude's back down to a plug on the pavement, with pink pulses running along it. */
function cable(fromX: number, fromY: number): string {
  const d = `M${fromX} ${fromY}C${fromX - 20} ${fromY + 2} ${fromX - 32} ${fromY + 36} ${fromX - 40} ${FLOOR - 12}`
  return `<path d="${d}" stroke="${PLUM}" stroke-width="4" fill="none"/><path class="flow" d="${d}" stroke="${PINK}" stroke-width="2" stroke-dasharray="2 6" fill="none"/>` +
    `<path d="${rect(fromX - 48, FLOOR - 12, 16, 12)}" fill="#3a2650"/><path class="beacon" d="${square(fromX - 44, FLOOR - 8, 4)}" fill="${PINK}"/>`
}

/**
 * Claude's jack and arms, which ride along with its body: the jack in its back, the far arm resting, and the near
 * arm on the keys, typing.
 */
function claudeGear(left: number, top: number, cell: number): string {
  const x = left + 2 * cell
  const y = top + cell
  return `<g class="breathe"><path d="${rect(x - 4, y + 6, 6, 12)}" fill="#3a2650"/><path class="beacon" d="${square(x - 3, y + 10, 3)}" fill="${PINK}"/>` +
    `<path d="${rect(left + 1, top + 4 * cell, 2 * cell - 1, cell - 1)}" fill="${CORAL}"/></g>` +
    `<g class="tap"><path d="${rect(left + 12 * cell, top + 3 * cell, 2 * cell - 1, cell - 1)}" fill="${CORAL}"/></g>`
}

const BIKE = `
..........ww......
.........wwww.....
..kkkkkkkkkkkkk...
.kkPPPPPPPkkkkkkk.
kkkkkkkkkkkkkkkkkL
.cccccccccccccccc.
`

/** The hover-bike at the kerb, bobbing over its own cyan underglow. */
function bike(x: number, bottom: number): string {
  return `<ellipse class="glow" cx="${x + 54}" cy="${FLOOR - 4}" rx="80" ry="8" fill="url(#cyanglow)"/>` +
    `<g class="bob">${sprite(BIKE, x, bottom - 36, 6, { w: '#4fb7d8', k: '#2a1840', P: PINK, L: AMBER, c: CYAN })}</g>`
}

const DRONE = `
rrr...rrr
...kkk...
.kkkkkkk.
.kkeeekk.
...kkk...
...bbb...
..bbbbb..
..bpppb..
`

/** The delivery drone, flying an order out from the bar now and then. */
function drone(): string {
  return `<g class="deliver">${sprite(DRONE, 0, 0, 4, { r: '#8a77a3', k: '#3a2256', e: CYAN, b: CREAM, p: PINK })}</g>`
}

/** The street: pavement under the bar, the kerb, and the wet road throwing the signs back up in long streaks. */
function street(): string {
  let seams = ''
  for (let x = 30; x < WIDTH; x += 70) seams += rect(x, FLOOR, 2, KERB - FLOOR)
  let dashes = ''
  for (let x = 20; x < WIDTH; x += 120) dashes += rect(x, 924, 56, 3)
  const streak = (x: number, w: number, length: number, id: string, delay: number) =>
    `<rect class="shimmer" style="animation-delay:-${delay}s" x="${x}" y="${KERB + 6}" width="${w}" height="${length}" fill="url(#${id})"/>`
  const ripples = (seed: number, colour: string, delay: number) => {
    let d = ''
    for (let i = 0; i < 18; i += 1) {
      d += rect(Math.floor(hash(seed, i) * WIDTH), KERB + 14 + Math.floor(hash(seed + 1, i) * (HEIGHT - KERB - 20)), 30 + Math.floor(hash(seed + 2, i) * 90), 2)
    }
    return `<path class="ripple" style="animation-delay:-${delay}s" d="${d}" fill="${colour}" fill-opacity="0.12"/>`
  }
  return `<path d="${rect(0, FLOOR, WIDTH, KERB - FLOOR)}" fill="#150c25"/><path d="${seams}" fill="#1d1131"/>` +
    `<path d="${rect(1010, FLOOR, WIDTH - 1010, 2)}" fill="${PINK}" fill-opacity="0.2"/>` +
    `<rect y="${KERB}" width="${WIDTH}" height="${HEIGHT - KERB}" fill="url(#road)"/><path d="${rect(0, KERB - 4, WIDTH, 4)}" fill="#2c1b44"/>` +
    `<path d="${dashes}" fill="#2c1b44" fill-opacity="0.7"/>` +
    streak(176, 16, 150, 'reflP', 0) + streak(212, 16, 120, 'reflC', 1.2) + streak(352, 16, 90, 'reflA', 2.1) + streak(1006, 16, 110, 'reflC', 0.6) +
    streak(1040, 270, 70, 'reflP', 1.8) + streak(1010, WIDTH - 1010, 26, 'reflP', 3.4) + streak(1444, 16, 150, 'reflP', 2.6) +
    streak(1540, 16, 130, 'reflC', 3.1) + streak(1470, 96, 60, 'reflC', 0.9) + streak(40, 140, 40, 'reflC', 1.5) +
    ripples(310, PINK, 0) + ripples(320, CYAN, 3)
}

// Claude itself: the body ten cells wide and seven tall, eyes turned to the hologram, legs dangling off the stool.
// Its arms are drawn apart, in claudeGear(), so the near one can type.
const CLAUDE = `
..BBBBBBBBBB..
..BBBBBEBBEB..
..BBBBBEBBEB..
..BBBBBBBBBB..
..BBBBBBBBBB..
..BBBBBBBBBB..
..BBBBBBBBBB..
`
const CLAUDE_LEGS = [
  `
...B.B..B.B...
...B.B..B.B...
`,
  `
...B.B..B.B...
...B.B...B.B..
`,
]
const CLAUDE_PAINT = { B: CORAL, E: '#1a0f1f' }

const COOK = `
...wwwwww...
..wwwwwwww..
..wwwwwwww..
...hhhhhh...
..BBBBBBBB..
..BEBBBBEB..
..BEBBBBEB..
..BBBBBBBB..
WWWrrrrrrWWW
WW.WWrrWW.WW
WW.WWddWW.WW
...WWWWWW...
...WWddWW...
`
const COOK_PAINT = { w: CREAM, h: '#c9b8da', B: CORAL, E: '#0b0a16', W: '#e2d8ee', r: PINK, d: '#8a77a3' }

export function neon2099Svg(): string {
  const edge = 626
  const holo = { x: 1206, y: 662, w: 60, h: 50 }
  const claudeCell = 10
  const claudeTop = SEAT - 7 * claudeCell

  const style = `
.win{animation:win 15s ease-in-out infinite}
.sway{transform-box:fill-box;transform-origin:50% 0;animation:sway 6s ease-in-out infinite}
.steam{opacity:0;animation:steam 3.2s ease-out infinite}
.bob{animation:bob 5s ease-in-out infinite}
.scroll{animation:scroll 6s linear infinite}
.flow{animation:flow 2.4s linear infinite}
.tap{animation:tap .6s ease-in-out infinite alternate}
.flick{animation:hum 17s steps(1) infinite;animation-delay:-6s}
.shimmer{animation:shimmer 4s ease-in-out infinite}
.ripple{animation:ripple 7s ease-in-out infinite alternate}
.deliver{opacity:0;animation:deliver 36s linear infinite}
@keyframes win{0%,100%{opacity:.55}50%{opacity:1}}
@keyframes sway{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(5deg)}}
@keyframes steam{0%{opacity:0;transform:translateY(6px)}30%{opacity:.7}100%{opacity:0;transform:translateY(-26px)}}
@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
@keyframes scroll{from{transform:translateY(0)}to{transform:translateY(-48px)}}
@keyframes tap{from{transform:translateY(0)}to{transform:translateY(-4px)}}
@keyframes flow{from{stroke-dashoffset:0}to{stroke-dashoffset:-24}}
@keyframes shimmer{0%,100%{opacity:.55;transform:translateX(-2px)}50%{opacity:1;transform:translateX(2px)}}
@keyframes ripple{from{transform:translateX(-14px)}to{transform:translateX(14px)}}
@keyframes deliver{0%{opacity:0;transform:translate(1300px,560px)}3%{opacity:1}45%{opacity:1;transform:translate(-80px,330px)}46%,100%{opacity:0;transform:translate(-80px,330px)}}`

  const defs = `
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a0614"/><stop offset="0.5" stop-color="#170a29"/><stop offset="0.75" stop-color="#2a0f3c"/><stop offset="1" stop-color="#1a0a26"/></linearGradient>
<radialGradient id="smog" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${PINK}" stop-opacity="0.16"/><stop offset="1" stop-color="${PINK}" stop-opacity="0"/></radialGradient>
<radialGradient id="pinkglow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${PINK}" stop-opacity="0.22"/><stop offset="1" stop-color="${PINK}" stop-opacity="0"/></radialGradient>
<radialGradient id="amberglow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${AMBER}" stop-opacity="0.22"/><stop offset="1" stop-color="${AMBER}" stop-opacity="0"/></radialGradient>
<radialGradient id="cyanglow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${CYAN}" stop-opacity="0.4"/><stop offset="1" stop-color="${CYAN}" stop-opacity="0"/></radialGradient>
<linearGradient id="warm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a1440"/><stop offset="1" stop-color="#22102f"/></linearGradient>
<linearGradient id="awnglow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${PINK}" stop-opacity="0.22"/><stop offset="1" stop-color="${PINK}" stop-opacity="0"/></linearGradient>
<linearGradient id="road" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0e0819"/><stop offset="1" stop-color="#07040d"/></linearGradient>
<linearGradient id="reflP" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${PINK}" stop-opacity="0.3"/><stop offset="1" stop-color="${PINK}" stop-opacity="0"/></linearGradient>
<linearGradient id="reflC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${CYAN}" stop-opacity="0.26"/><stop offset="1" stop-color="${CYAN}" stop-opacity="0"/></linearGradient>
<linearGradient id="reflA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${AMBER}" stop-opacity="0.24"/><stop offset="1" stop-color="${AMBER}" stop-opacity="0"/></linearGradient>
<clipPath id="holoclip"><rect x="${holo.x}" y="${holo.y}" width="${holo.w}" height="${holo.h}"/></clipPath>
${grain('#ffd6f0', 0.03, 0.1)}`

  const body = `
<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#sky)"/>
${towers(3, 720, '#1a0e2c', 140, 560, 0.07)}
<ellipse cx="800" cy="720" rx="920" ry="230" fill="url(#smog)"/>
${flyingCar(212, false, 36, 14, CYAN, PINK)}${flyingCar(298, true, 31, 3, '#ffffff', '#ff5a5a')}
${towers(7, FLOOR, '#130a22', 60, 380, 0.05)}
${leftBlock()}
${barBlock()}
${shopSign(1040, 520)}
${flyingCar(150, true, 26, 9, '#ffffff', PINK)}${flyingCar(252, false, 40, 22, AMBER, PINK)}${flyingCar(366, true, 29, 17, CYAN, PINK)}
${drone()}
<rect x="1026" y="${edge}" width="${WIDTH - 1026}" height="${FLOOR - edge}" fill="url(#warm)"/>
${menu(1034, 668, 2, 3)}${menu(1384, 666, 3, 2)}
${cooler(1470, 666)}
${awning(edge)}
${[1040, 1100, 1160, 1400, 1460, 1520, 1580].map((x, i) => lantern(x, edge + 2, i % 2 === 0 ? PINK : AMBER, ((i * 13) % 40) / 10)).join('')}
${figure(COOK, [], PAIR_RIGHT + 60, 760, COOK_PAINT, { delay: 1.6 })}
${street()}
${counter(1196, 1450)}
${stool(PAIR_LEFT + 38)}${stool(1290)}${stool(1372)}
${holoDesk(holo.x, holo.y, holo.w, holo.h)}
${cable(PAIR_LEFT + 2 * claudeCell, claudeTop + 2 * claudeCell)}
${figure(CLAUDE, CLAUDE_LEGS, PAIR_LEFT, SEAT, CLAUDE_PAINT, { cell: claudeCell })}
${claudeGear(PAIR_LEFT, claudeTop, claudeCell)}
${bike(70, 798)}
${rain(2099, 80, 16, '#ff6fbe', 0.22, 7)}${rain(2100, 40, 10, CYAN, 0.12, 9)}
<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#grain)"/>`

  return svgRoot(style + EXTRA_STYLE, defs, body)
}
