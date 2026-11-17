// The landing page's one script: the theme picker on the hero window, the copy buttons, and live previews on the
// theme gallery. Without it the page still reads whole: Neon Rooftop shows in the window and every still is in place.

const THEMES = {
  rooftop: { name: 'Neon Rooftop', accent: '#b48cff', glass: 'rgba(17, 13, 36, 0.62)', ink: '#ece8f6', ink2: '#b8b2cf',
    ask: 'Can you fix the flaky login test?', reply: 'Found it: a race on the session cookie. Patched, then re-ran it 50 times. All green.',
    del: "await page.click('#login')", add: "await page.waitForResponse('/api/session')", file: 'login.spec.ts', plus: '#7fe0a8', minus: '#f0718a' },
  alley: { name: 'Phosphor Alley', accent: '#7ff0c4', glass: 'rgba(8, 24, 15, 0.64)', ink: '#e6f5ee', ink2: '#a3c2b5',
    ask: 'Clean up the payment retry logic.', reply: 'Retries now go through one backoff helper. Three call sites share it, tests updated.',
    del: 'for (let i = 0; i < 3; i++) charge()', add: "retry(charge, { attempts: 5, backoff: 'expo' })", file: 'payments/retry.ts', plus: '#a6f08a', minus: '#f07a7a', high: true },
  net: { name: 'Deep Net', accent: '#5cc8ff', glass: 'rgba(8, 16, 42, 0.62)', ink: '#e8f0ff', ink2: '#a3b4d6',
    ask: 'Why is the orders API slow?', reply: 'An N+1 query in /orders. One join brings p95 from 840 ms down to 90 ms.',
    del: 'orders.map(o => db.items(o.id))', add: 'SELECT * FROM orders JOIN items USING (order_id)', file: 'api/orders.sql', plus: '#5fe3b0', minus: '#ff6b81' },
  clinic: { name: 'Ripperdoc', accent: '#4fe0b5', glass: 'rgba(8, 22, 19, 0.64)', ink: '#e4f4ef', ink2: '#9dbdb4',
    ask: 'Add validation to the checkout form.', reply: 'Every field now goes through one schema, and 14 new tests cover the edge cases.',
    del: 'if (!qty) throw new Error()', add: 'const Order = z.object({ qty: z.number().int() })', file: 'checkout/schema.ts', plus: '#8be36b', minus: '#ff6b6b' },
  badlands: { name: 'Badlands', accent: '#ff9f4a', glass: 'rgba(22, 12, 7, 0.62)', ink: '#fbeee2', ink2: '#c9ae95',
    ask: 'Draft the release notes for v2.4.', reply: 'Drafted from 37 merged pull requests, grouped by area, breaking changes first.',
    del: '## v2.4 (draft)', add: '## v2.4: 37 pull requests, breaking changes first', file: 'CHANGELOG.md', plus: '#9ad56b', minus: '#ff5f56' },
  blackwall: { name: 'Blackwall', accent: '#ff4f6d', glass: 'rgba(8, 8, 10, 0.68)', ink: '#f2f2f3', ink2: '#a3a3ab',
    ask: 'Audit the auth middleware.', reply: 'One finding: tokens were never checked for expiry. Fixed, with a regression test.',
    del: 'if (!claims) throw new Unauthorized()', add: 'if (claims.exp < now()) throw new Unauthorized()', file: 'auth/middleware.ts', plus: '#5fd39a', minus: '#f04438' },
  noodle: { name: 'Neon 2099', accent: '#ff3ea5', glass: 'rgba(18, 10, 30, 0.62)', ink: '#f7eefc', ink2: '#a592b3',
    ask: 'Cache the product search results.', reply: 'Searches go through a 60-second cache now. Repeat queries dropped from 310 ms to 4 ms.',
    del: 'const hits = await search(query)', add: 'const hits = await cache.wrap(query, () => search(query), { ttl: 60 })', file: 'search/cache.ts', plus: '#3ee8a0', minus: '#ff5a5a' },
  corpo: { name: 'Corpo Plaza', accent: '#b0182f', glass: 'rgba(246, 245, 249, 0.76)', ink: '#1b1a22', ink2: '#55525f', light: true,
    ask: 'Make the dashboard accessible.', reply: 'Contrast and focus order fixed, and every chart now has a text summary.',
    del: '<Chart />', add: '<Chart aria-describedby="sales-summary" />', file: 'Dashboard.tsx', plus: '#2f7d4a', minus: '#d14343' },
}
const ORDER = Object.keys(THEMES)
const still = matchMedia('(prefers-reduced-motion: reduce)')
const scenePath = (id) => `themes/${id}${still.matches ? '-still' : ''}.svg`

// ---- the hero window
const stage = document.querySelector('[data-stage]')
if (stage) {
  const view = stage.querySelector('.win__view')
  const layers = [...stage.querySelectorAll('[data-scene]')]
  // the crossfade's second layer, made here so the page never ships an empty image
  const back = document.createElement('img')
  back.className = 'win__scene'
  back.alt = ''
  back.dataset.scene = ''
  view.insertBefore(back, view.querySelector('[data-glass]'))
  layers.push(back)
  const buttons = [...stage.querySelectorAll('[data-pick]')]
  const auto = stage.querySelector('[data-auto]')
  const field = (name) => stage.querySelector(`[data-${name}]`)
  let current = 'rooftop'
  let timer = 0
  let paused = still.matches
  let onScreen = false

  if (still.matches) {
    layers[0].src = scenePath(current)
    auto.hidden = true
  }

  function show(id) {
    if (id === current) return
    const t = THEMES[id]
    current = id
    const [on, off] = layers[0].classList.contains('is-on') ? layers : [layers[1], layers[0]]
    off.onload = () => { off.classList.add('is-on'); on.classList.remove('is-on') }
    off.src = scenePath(id)
    stage.style.setProperty('--accent', t.accent)
    stage.style.setProperty('--glass', t.glass)
    stage.style.setProperty('--glass-ink', t.ink)
    stage.style.setProperty('--glass-ink-2', t.ink2)
    stage.toggleAttribute('data-light', Boolean(t.light))
    // the alley's pair sits high on the power line, so on a phone its glass moves below them
    stage.toggleAttribute('data-high', Boolean(t.high))
    field('stage-name').textContent = t.name
    field('ask').textContent = t.ask
    field('reply').textContent = t.reply
    field('del').textContent = `- ${t.del}`
    field('add').textContent = `+ ${t.add}`
    field('file').textContent = t.file
    field('stage-cmd').textContent = `/neon ${id}`
    stage.style.setProperty('--add', t.plus)
    stage.style.setProperty('--del', t.minus)
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.pick === id)))
  }

  function schedule() {
    clearTimeout(timer)
    if (paused || !onScreen || document.hidden) return
    timer = setTimeout(() => { show(ORDER[(ORDER.indexOf(current) + 1) % ORDER.length]); schedule() }, 6000)
  }

  // A pick is a decision: it stops the tour, so the theme the visitor chose stays put.
  buttons.forEach((b) => b.addEventListener('click', () => {
    show(b.dataset.pick)
    paused = true
    auto.setAttribute('data-paused', '')
    auto.setAttribute('aria-label', 'Play the theme tour')
    schedule()
  }))
  auto.addEventListener('click', () => {
    paused = !paused
    auto.toggleAttribute('data-paused', paused)
    auto.setAttribute('aria-label', paused ? 'Play the theme tour' : 'Pause the theme tour')
    schedule()
  })
  new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; schedule() }, { threshold: 0.35 }).observe(stage)
  document.addEventListener('visibilitychange', schedule)
}

// ---- the reel: one theme per press of the arrows; the arrows rest at either end
const reel = document.querySelector('[data-reel]')
if (reel) {
  const prev = document.querySelector('[data-reel-prev]')
  const next = document.querySelector('[data-reel-next]')
  const step = () => reel.querySelector('.world').getBoundingClientRect().width + 24
  const ends = () => {
    prev.disabled = reel.scrollLeft < 8
    next.disabled = reel.scrollLeft + reel.clientWidth > reel.scrollWidth - 8
  }
  prev.addEventListener('click', () => reel.scrollBy({ left: -step(), behavior: still.matches ? 'auto' : 'smooth' }))
  next.addEventListener('click', () => reel.scrollBy({ left: step(), behavior: still.matches ? 'auto' : 'smooth' }))
  reel.addEventListener('scroll', ends, { passive: true })
  ends()
}

// ---- copy buttons: the install line in one click
document.querySelectorAll('[data-copy]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const text = btn.closest('[data-copy-box]').querySelector('code').textContent
    try {
      await navigator.clipboard.writeText(text)
      btn.textContent = 'Copied'
      btn.classList.add('is-done')
    } catch {
      const range = document.createRange()
      range.selectNodeContents(btn.closest('[data-copy-box]').querySelector('code'))
      getSelection().removeAllRanges()
      getSelection().addRange(range)
      btn.textContent = 'Selected'
    }
    setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('is-done') }, 2000)
  })
})

// ---- the gallery: each still comes alive while the pointer or focus is on it
if (!still.matches && matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('.world img[data-live]').forEach((img) => {
    const rest = img.getAttribute('src')
    const card = img.closest('.world')
    const wake = () => { img.src = img.dataset.live }
    const sleep = () => { img.src = rest }
    card.addEventListener('pointerenter', wake)
    card.addEventListener('pointerleave', sleep)
  })
}
