// Accordéon (FAQ, programme, détails).
// Accroches sur chaque élément :
//   [data-accordion]            l'élément ; data-accordion-group="faq" pour n'en ouvrir qu'un à la fois dans le groupe
//   [data-accordion-trigger]    la zone cliquable (question)
//   [data-accordion-content]    le contenu qui s'ouvre (réponse)
//   [data-accordion-icon]       facultatif, l'icône
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
    gsap.to(item.content, { height: open ? 'auto' : 0, duration, ease: 'power2.inOut' })
  }

  items.forEach((item, index) => {
    if (!item.content.id) item.content.id = `accordion-content-${index + 1}`
    item.trigger.setAttribute('role', 'button')
    item.trigger.setAttribute('tabindex', '0')
    item.trigger.setAttribute('aria-controls', item.content.id)
    item.trigger.setAttribute('aria-expanded', 'false')
    gsap.set(item.content, { height: 0, overflow: 'hidden' })

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
