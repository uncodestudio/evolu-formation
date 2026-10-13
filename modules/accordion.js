// Accordéon (FAQ, programme, détails).
// Accroches sur chaque élément :
//   [data-accordion]            l'élément ; data-accordion-group="faq" pour n'en ouvrir qu'un à la fois dans le groupe
//   [data-accordion-trigger]    la zone cliquable (question)
//   [data-accordion-content]    le contenu qui s'ouvre (réponse)
//   [data-accordion-icon]       facultatif, l'icône
//   [data-accordion-open]       facultatif, sur l'élément : ouvert au chargement
// Attributs fixes posés dans Webflow : role="button" et tabindex="0" sur la question.
// Pas d'id ni d'aria-controls dans les composants répétés (FAQ, programme) : ils seraient dupliqués à chaque instance.
// Le module pose sur chaque réponse un id unique et l'aria-controls de sa question, et gère l'état
// (aria-expanded, is-open, hauteur). Une réponse qui a déjà un id unique le garde.
// La classe is-open est posée sur l'élément et l'icône ouverts : l'animation de l'icône se règle dans Webflow.
import { prefersReducedMotion } from './utils.js'

const DURATION = 0.4

export function init() {
  if (typeof gsap === 'undefined') return

  const duration = prefersReducedMotion() ? 0 : DURATION

  const items = [...document.querySelectorAll('[data-accordion]')]
    .map((el) => ({
      el,
      group: el.dataset.accordionGroup || null,
      trigger: el.querySelector('[data-accordion-trigger]'),
      content: el.querySelector('[data-accordion-content]'),
      icon: el.querySelector('[data-accordion-icon]'),
    }))
    .filter((item) => item.trigger && item.content)

  const setOpen = (item, open) => {
    item.el.classList.toggle('is-open', open)
    item.icon?.classList.toggle('is-open', open)
    item.trigger.setAttribute('aria-expanded', String(open))
    // Réponse fermée : masquée aux lecteurs d'écran et au clavier une fois l'animation finie
    if (open) gsap.set(item.content, { visibility: 'visible' })
    gsap.to(item.content, {
      height: open ? 'auto' : 0,
      duration,
      ease: 'power2.inOut',
      overwrite: true, // une réouverture pendant la fermeture annule la fermeture (et son masquage)
      onComplete: open ? undefined : () => gsap.set(item.content, { visibility: 'hidden' }),
    })
  }

  const seenIds = new Set()
  items.forEach((item, index) => {
    // Id manquant, ou en double (élément répété en composant, élément dupliqué) : on en pose un unique
    if (!item.content.id || seenIds.has(item.content.id)) {
      const base = item.content.id || 'accordion-content'
      item.content.id = `${base}-${index + 1}`
      item.trigger.setAttribute('aria-controls', item.content.id)
    }
    seenIds.add(item.content.id)
    const startOpen = item.el.hasAttribute('data-accordion-open')
    item.el.classList.toggle('is-open', startOpen)
    item.icon?.classList.toggle('is-open', startOpen)
    item.trigger.setAttribute('aria-expanded', String(startOpen))
    gsap.set(item.content, { height: startOpen ? 'auto' : 0, overflow: 'hidden', visibility: startOpen ? 'visible' : 'hidden' })

    const toggle = () => {
      const open = !item.el.classList.contains('is-open')
      if (open && item.group) {
        items
          .filter((other) => other !== item && other.group === item.group && other.el.classList.contains('is-open'))
          .forEach((other) => setOpen(other, false))
      }
      setOpen(item, open)
    }

    item.trigger.addEventListener('click', toggle)
    item.trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        toggle()
      }
    })
  })
}
