// Mise en avant tournante : une classe passe d'un élément au suivant à intervalle régulier (numéros du déroulé des LP).
// Accroches : [data-cycle] sur le conteneur, [data-cycle-target] sur chaque élément, dans l'ordre.
// Réglages sur [data-cycle] : data-cycle-interval (secondes, défaut 2), data-cycle-class (défaut is-active).
// Démarre sur le premier élément quand le bloc entre à l'écran, s'arrête quand il en sort.
// Mouvement réduit : rien ne tourne, l'état posé dans Webflow reste.
import { prefersReducedMotion } from './utils.js'

const DEFAULT_INTERVAL = 2
const DEFAULT_CLASS = 'is-active'

export function init() {
  if (prefersReducedMotion()) return

  document.querySelectorAll('[data-cycle]').forEach((root) => {
    const targets = [...root.querySelectorAll('[data-cycle-target]')]
    if (targets.length < 2) return

    const interval = (+root.dataset.cycleInterval || DEFAULT_INTERVAL) * 1000
    const className = root.dataset.cycleClass || DEFAULT_CLASS
    let index = 0
    let timer = null

    const show = (i) => {
      index = i
      targets.forEach((el, j) => el.classList.toggle(className, j === i))
    }

    const start = () => {
      if (timer) return
      show(0)
      timer = setInterval(() => show((index + 1) % targets.length), interval)
    }

    const stop = () => {
      clearInterval(timer)
      timer = null
    }

    new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()), { threshold: 0.3 }).observe(root)
  })
}
