// Défilement continu (format agence, doc Tech Invaders) : .marquee > .marquee-layout > .logo-item > .logo-item_inner.
// Réglages sur .marquee : data-speed (secondes pour un tour, défaut 15), data-direction="right" (défilement vers la droite).
// Le contenu n'est posé qu'une fois dans Webflow : le module le duplique, les copies sont masquées aux lecteurs d'écran.
// Pause (WCAG 2.2.2) : au survol, au focus, d'un appui au doigt (un second appui relance), et hors de l'écran.
// Facultatif : un bouton [data-marquee-toggle] met en pause ou relance les marquees de sa section ; aria-pressed suit l'état.

const DEFAULT_SPEED = 15

export function init() {
  if (typeof gsap === 'undefined') return // GSAP vient de l'intégration Webflow (R-44)
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return // pas d'animation, donc pas de copies

  const players = []

  document.querySelectorAll('.marquee').forEach((marquee) => {
    const content = marquee.firstElementChild
    if (!content) return

    // Duplication pour la boucle infinie
    ;[...content.children].forEach((item) => {
      const clone = item.cloneNode(true)
      clone.setAttribute('aria-hidden', 'true')
      content.appendChild(clone)
    })

    const isRight = marquee.dataset.direction === 'right'
    const speed = +marquee.dataset.speed || DEFAULT_SPEED

    gsap.set(content, { force3D: true, xPercent: isRight ? -50 : 0 })

    const tl = gsap.to(content, {
      xPercent: isRight ? 0 : -50,
      duration: speed,
      ease: 'none',
      repeat: -1,
      paused: true,
      modifiers: { xPercent: gsap.utils.wrap(isRight ? -50 : 0, isRight ? 0 : -50) },
    })

    // Le défilement ne tourne que si aucune raison de pause n'est active
    const reasons = new Set(['offscreen'])
    const set = (reason, on) => {
      on ? reasons.add(reason) : reasons.delete(reason)
      reasons.size ? tl.pause() : tl.play()
    }

    marquee.addEventListener('mouseenter', () => set('hover', true))
    marquee.addEventListener('mouseleave', () => set('hover', false))
    marquee.addEventListener('focusin', () => set('focus', true))
    marquee.addEventListener('focusout', () => set('focus', false))
    marquee.addEventListener('pointerup', (e) => {
      if (e.pointerType === 'touch') set('user', !reasons.has('user'))
    })
    new IntersectionObserver(([entry]) => set('offscreen', !entry.isIntersecting)).observe(marquee)

    players.push({ marquee, set })
  })

  document.querySelectorAll('[data-marquee-toggle]').forEach((button) => {
    const scope = button.closest('section') || document
    const targets = players.filter(({ marquee }) => scope.contains(marquee))
    if (!targets.length) return
    button.setAttribute('aria-pressed', 'false')
    button.addEventListener('click', (e) => {
      e.preventDefault()
      const paused = button.getAttribute('aria-pressed') !== 'true'
      button.setAttribute('aria-pressed', String(paused))
      targets.forEach(({ set }) => set('user', paused))
    })
  })
}
