// Défilement continu (format agence, doc Tech Invaders) : .marquee > .marquee-layout > .logo-item > .logo-item_inner.
// Réglages sur .marquee : data-speed (secondes pour un tour, défaut 15), data-direction="right" (droite vers gauche).
// Le contenu n'est posé qu'une fois dans Webflow : le module le duplique, les copies sont masquées aux lecteurs d'écran.

const DEFAULT_SPEED = 15

export function init() {
  if (typeof gsap === 'undefined') return // GSAP vient de l'intégration Webflow (R-44)

  document.querySelectorAll('.marquee').forEach((marquee) => {
    const content = marquee.firstElementChild
    if (!content) return

    // Duplication pour la boucle infinie
    ;[...content.children].forEach((item) => {
      const clone = item.cloneNode(true)
      clone.setAttribute('aria-hidden', 'true')
      content.appendChild(clone)
    })

    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const isRight = marquee.dataset.direction === 'right'
    const speed = +marquee.dataset.speed || DEFAULT_SPEED

    gsap.set(content, { force3D: true, xPercent: isRight ? -50 : 0 })

    const tl = gsap.to(content, {
      xPercent: isRight ? 0 : -50,
      duration: speed,
      ease: 'none',
      repeat: -1,
      modifiers: { xPercent: gsap.utils.wrap(isRight ? -50 : 0, isRight ? 0 : -50) },
    })

    marquee.addEventListener('mouseenter', () => tl.pause())
    marquee.addEventListener('mouseleave', () => tl.play())
  })
}
