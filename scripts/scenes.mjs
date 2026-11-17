// The list of themes the scripts loop over. If you add a theme, add it here too.
import { neonRooftopSvg } from '../plugins/cyberpunk-themes/hooks/scene.ts'
import { phosphorAlleySvg } from '../plugins/cyberpunk-themes/hooks/alley.ts'
import { deepNetSvg } from '../plugins/cyberpunk-themes/hooks/deepnet.ts'
import { ripperdocSvg } from '../plugins/cyberpunk-themes/hooks/ripperdoc.ts'
import { badlandsSvg } from '../plugins/cyberpunk-themes/hooks/badlands.ts'
import { blackwallSvg } from '../plugins/cyberpunk-themes/hooks/blackwall.ts'
import { neon2099Svg } from '../plugins/cyberpunk-themes/hooks/neon2099.ts'
import { corpoPlazaSvg } from '../plugins/cyberpunk-themes/hooks/corpo.ts'

export const SCENES = [
  { id: 'rooftop', title: 'Neon Rooftop', colour: 'Purple', mode: 'dark', build: neonRooftopSvg },
  { id: 'alley', title: 'Phosphor Alley', colour: 'Green', mode: 'dark', build: phosphorAlleySvg },
  { id: 'net', title: 'Deep Net', colour: 'Blue', mode: 'dark', build: deepNetSvg },
  { id: 'clinic', title: 'Ripperdoc', colour: 'Green', mode: 'dark', build: ripperdocSvg },
  { id: 'badlands', title: 'Badlands', colour: 'Orange', mode: 'dark', build: badlandsSvg },
  { id: 'blackwall', title: 'Blackwall', colour: 'Black', mode: 'dark', build: blackwallSvg },
  { id: 'noodle', title: 'Neon 2099', colour: 'Pink', mode: 'dark', build: neon2099Svg },
  { id: 'corpo', title: 'Corpo Plaza', colour: 'White', mode: 'light', build: corpoPlazaSvg },
]
