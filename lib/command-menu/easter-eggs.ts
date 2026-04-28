/**
 * Easter-egg visual effects triggered from the command menu.
 *
 * These functions touch the DOM directly (`document`, `window`,
 * `requestAnimationFrame`) and must only be called from the browser. They are
 * intentionally framework-free so the animation cost stays minimal.
 */

const GRUVBOX_PALETTE = [
  '#fb4934', // red
  '#b8bb26', // green
  '#fabd2f', // yellow
  '#83a598', // blue
  '#d3869b', // purple
  '#8ec07c', // aqua
  '#fe8019', // orange
] as const

function pickColor(): string {
  return GRUVBOX_PALETTE[Math.floor(Math.random() * GRUVBOX_PALETTE.length)]
}

/**
 * Confetti rain — 300 falling pieces with staggered start for a wave effect.
 */
export function createConfetti(): void {
  const COUNT = 300

  for (let i = 0; i < COUNT; i++) {
    const piece = document.createElement('div')
    const size = Math.random() * 15 + 8
    const startX = Math.random() * window.innerWidth
    const velocityX = (Math.random() - 0.5) * 8
    const velocityY = Math.random() * 4 + 3
    const rotationSpeed = (Math.random() - 0.5) * 10

    piece.style.cssText = `
      position: fixed;
      width: ${size}px;
      height: ${size}px;
      background: ${pickColor()};
      left: ${startX}px;
      top: -20px;
      border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
      pointer-events: none;
      z-index: 9999;
    `
    document.body.appendChild(piece)

    let y = -20
    let x = startX
    let rotation = Math.random() * 360
    let opacity = 1

    const animate = () => {
      y += velocityY
      x += velocityX
      rotation += rotationSpeed
      if (y > window.innerHeight * 0.7) opacity -= 0.02

      piece.style.top = `${y}px`
      piece.style.left = `${x}px`
      piece.style.transform = `rotate(${rotation}deg)`
      piece.style.opacity = String(opacity)

      if (y < window.innerHeight + 50 && opacity > 0) {
        requestAnimationFrame(animate)
      } else {
        piece.remove()
      }
    }

    setTimeout(() => requestAnimationFrame(animate), i * 5)
  }
}

/**
 * Fireworks — 5 staggered bursts of 50 radial particles each.
 */
export function createCelebrate(): void {
  const BURSTS = 5
  const PARTICLES_PER_BURST = 50
  const centerX = window.innerWidth / 2
  const centerY = window.innerHeight / 2

  for (let burst = 0; burst < BURSTS; burst++) {
    setTimeout(() => {
      const originX = centerX + (Math.random() - 0.5) * 600
      const originY = centerY + (Math.random() - 0.5) * 400

      for (let i = 0; i < PARTICLES_PER_BURST; i++) {
        const particle = document.createElement('div')
        const angle = (i / PARTICLES_PER_BURST) * Math.PI * 2
        const velocity = Math.random() * 350 + 150
        const size = Math.random() * 14 + 6
        const color = pickColor()

        particle.style.cssText = `
          position: fixed;
          width: ${size}px;
          height: ${size}px;
          background: ${color};
          left: ${originX}px;
          top: ${originY}px;
          border-radius: 50%;
          pointer-events: none;
          z-index: 9999;
          box-shadow: 0 0 ${size / 2}px ${pickColor()};
        `
        document.body.appendChild(particle)

        const vx = Math.cos(angle) * velocity
        const vy = Math.sin(angle) * velocity
        let px = originX
        let py = originY
        let opacity = 1

        const animate = () => {
          px += vx * 0.016
          py += vy * 0.016 + 3
          opacity -= 0.015
          particle.style.left = `${px}px`
          particle.style.top = `${py}px`
          particle.style.opacity = String(opacity)
          particle.style.transform = `scale(${opacity})`

          if (opacity > 0) {
            requestAnimationFrame(animate)
          } else {
            particle.remove()
          }
        }
        requestAnimationFrame(animate)
      }
    }, burst * 250)
  }
}

const SURPRISE_EFFECTS = [createConfetti, createCelebrate] as const

/** Run a randomly-picked easter-egg effect. */
export function triggerSurprise(): void {
  const effect =
    SURPRISE_EFFECTS[Math.floor(Math.random() * SURPRISE_EFFECTS.length)]
  effect()
}
