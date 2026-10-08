// Point d'entrée : chaque module ne démarre que si son élément est sur la page (R-44).
import { init as initSlideIn } from './modules/slideIn.js'
import { init as initAccordion } from './modules/accordion.js'
import { init as initFormValidation } from './modules/formValidation.js'
import { init as initNavScroll } from './modules/navScroll.js'
import { init as initFormSteps } from './modules/formSteps.js'

// Modules présents sur toutes les pages (navbar, transitions de page) : les appeler ici, avant le détecteur.

const moduleDetectors = {
  slideIn: { selector: '[data-slide-in], [data-slide-in-stagger]', initFn: initSlideIn },
  accordion: { selector: '[data-accordion]', initFn: initAccordion },
  formValidation: { selector: 'form[data-validate]', initFn: initFormValidation },
  navScroll: { selector: '[data-nav-scroll]', initFn: initNavScroll },
  formSteps: { selector: '[data-form-steps]', initFn: initFormSteps },
}

Object.entries(moduleDetectors).forEach(([name, { selector, initFn }]) => {
  if (!document.querySelector(selector)) return
  try {
    initFn()
  } catch (e) {
    console.error(`[${name}]`, e)
  }
})
