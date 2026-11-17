// All the theme colours in one place. If you want to recolour a theme, this is the file.
// Each palette is four surfaces (page, cards, panels, menus), three text shades and five accents, which
// makeColors turns into the full set of colours the app needs.
// I kept readability first: main text is 7:1 or better on every surface, muted text 4.5:1 or better.
// The audit script checks all of this, so you'll know if a change makes something hard to read.

type Roles = { accent: string; danger: string; success: string; warning: string; pro: string }
type Anchors = { 'surface-0': string; 'text-primary': string } & Partial<Record<'surface-1' | 'surface-2' | 'surface-3' | 'text-secondary' | 'text-muted', string>>

export type Palette = {
  label: string
  only: 'dark' | 'light'
  roles: Roles
  codeTheme?: { dark?: string; light?: string }
  dark?: { gray: { anchors: Anchors } }
  light?: { gray: { anchors: Anchors } }
}

function dark(label: string, roles: Roles, s: [string, string, string, string, string, string, string], code?: string): Palette {
  const [s0, s1, s2, s3, primary, secondary, muted] = s
  return {
    label,
    only: 'dark',
    roles,
    ...(code !== undefined && { codeTheme: { dark: code } }),
    dark: { gray: { anchors: { 'surface-0': s0, 'surface-1': s1, 'surface-2': s2, 'surface-3': s3, 'text-primary': primary, 'text-secondary': secondary, 'text-muted': muted } } },
  }
}

export const PALETTES: Record<string, Palette> = {
  rooftop: dark('Neon Rooftop', { accent: '#74d4e6', danger: '#f0718a', success: '#7fe0a8', warning: '#f0bd72', pro: '#e489cf' }, ['#0f0c20', '#151129', '#1b1633', '#211b3c', '#ece8f6', '#c9c2e2', '#a59dc4']),
  alley: dark('Phosphor Alley', { accent: '#7ff0c4', danger: '#f07a7a', success: '#a6f08a', warning: '#f0a860', pro: '#7fd8f0' }, ['#07140f', '#0c1c17', '#11231d', '#162a23', '#e6f5ee', '#bfd8cd', '#a3c2b5'], 'everforest-dark'),
  net: dark('Deep Net', { accent: '#5cc8ff', danger: '#ff6b81', success: '#5fe3b0', warning: '#ffc266', pro: '#9d8cff' }, ['#070d1f', '#0c1428', '#111a31', '#16203a', '#e8f0ff', '#c2d0ec', '#a3b4d6']),
  clinic: dark('Ripperdoc', { accent: '#4fe0b5', danger: '#ff6b6b', success: '#8be36b', warning: '#f2b84b', pro: '#6fc3ff' }, ['#071311', '#0c1b18', '#11231f', '#162a26', '#e4f4ef', '#bcd8d0', '#9dbdb4'], 'github-dark'),
  badlands: dark('Badlands', { accent: '#ff9f4a', danger: '#ff5f56', success: '#9ad56b', warning: '#ffd166', pro: '#e07bd0' }, ['#140b06', '#1c110a', '#24160d', '#2c1b10', '#fbeee2', '#e3cdb8', '#c9ae95']),
  blackwall: dark('Blackwall', { accent: '#ff4f6d', danger: '#f04438', success: '#5fd39a', warning: '#f5b84a', pro: '#b9a3ff' }, ['#09090b', '#111113', '#18181b', '#1f1f23', '#f2f2f3', '#c7c7cc', '#a3a3ab']),
  noodle: dark('Neon 2099', { accent: '#ff3ea5', danger: '#ff5a5a', success: '#3ee8a0', warning: '#ffcf4a', pro: '#29e3ff' }, ['#0d0815', '#150f20', '#191225', '#251c36', '#f7eefc', '#d1bedc', '#a592b3']),
  corpo: {
    label: 'Corpo Plaza',
    only: 'light',
    roles: { accent: '#b0182f', danger: '#d14343', success: '#2f7d4a', warning: '#a86412', pro: '#5b4a9b' },
    light: { gray: { anchors: { 'surface-0': '#e9e7ec', 'surface-1': '#f1eff3', 'surface-2': '#f8f7fa', 'text-primary': '#1b1a22', 'text-secondary': '#3f3d4a', 'text-muted': '#55525f' } } },
  },
}
