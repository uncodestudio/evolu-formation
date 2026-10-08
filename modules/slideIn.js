// Apparition au défilement (R-51).
// Accroches : [data-slide-in] sur un élément ; [data-slide-in-stagger] sur un parent pour faire apparaître
// ses enfants directs en cascade (la valeur règle le décalage en secondes, 0.2 par défaut).
// Le head du site masque ces éléments dès le premier affichage et réaffiche tout si ce module ne démarre pas
// (snippets/head.html).
import { prefersReducedMotion } from './utils.js'

const OFFSET_Y = 32
const DURATION = 1.2
const EASE = 'power2.out'
const STAGGER_DURATION = 0.8
const STAGGER_EASE = 'power3.out'
const DEFAULT_STAGGER = 0.2

const show = (elements) =>
  elements.forEach((el) => {
    el.style.opacity = '1'
    el.style.transform = 'none'
  })

const reveal = (targets, trigger, { duration, ease, stagger = 0 }) => {
  gsap.fromTo(
    targets,
    { y: OFFSET_Y, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration,
      ease,
      stagger,
      scrollTrigger: { trigger, start: 'top 90%', toggleActions: 'play none none none' },
    }
  )
}

export function init() {
  // Signale au secours du head que le module a démarré
  window.__slideInReady = true

  const singles = [...document.querySelectorAll('[data-slide-in]')]
  const groups = [...document.querySelectorAll('[data-slide-in-stagger]')]

  // Sans GSAP, ou mouvement réduit demandé : tout s'affiche tout de suite, jamais de page vide
  if (prefersReducedMotion() || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    show(singles)
    groups.forEach((parent) => show([...parent.children]))
    return
  }

  gsap.registerPlugin(ScrollTrigger)

  singles.forEach((el) => reveal(el, el, { duration: DURATION, ease: EASE }))

  groups.forEach((parent) => {
    const children = [...parent.children]
    if (!children.length) return
    const stagger = parseFloat(parent.dataset.slideInStagger) || DEFAULT_STAGGER
    reveal(children, parent, { duration: STAGGER_DURATION, ease: STAGGER_EASE, stagger })
  })
}
