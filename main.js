// Point d'entrée : chaque module ne démarre que si son élément est sur la page (R-44).
import { init as initSlideIn } from './modules/slideIn.js'
import { init as initAccordion } from './modules/accordion.js'
import { init as initFormValidation } from './modules/formValidation.js'
import { init as initNavScroll } from './modules/navScroll.js'
import { init as initFormSteps } from './modules/formSteps.js'
import { init as initMarquee } from './modules/marquee.js'
import { init as initTabs } from './modules/tabs.js'
import { init as initCycle } from './modules/cycle.js'
import { init as initFormClone } from './modules/formClone.js'

// Modules présents sur toutes les pages (navbar, transitions de page) : les appeler ici, avant le détecteur.

const moduleDetectors = {
  // En premier : les copies du formulaire doivent exister avant formValidation et formSteps
  formClone: { selector: '[data-form-clone]', initFn: initFormClone },
  slideIn: { selector: '[data-slide-in], [data-slide-in-stagger]', initFn: initSlideIn },
  accordion: { selector: '[data-accordion]', initFn: initAccordion },
  formValidation: { selector: 'form[data-validate]', initFn: initFormValidation },
  navScroll: { selector: '[data-nav-scroll]', initFn: initNavScroll },
  formSteps: { selector: '[data-form-steps]', initFn: initFormSteps },
  marquee: { selector: '.marquee', initFn: initMarquee },
  tabs: { selector: '[data-tabs]', initFn: initTabs },
  cycle: { selector: '[data-cycle]', initFn: initCycle },
}

Object.entries(moduleDetectors).forEach(([name, { selector, initFn }]) => {
  if (!document.querySelector(selector)) return
  try {
    initFn()
  } catch (e) {
    console.error(`[${name}]`, e)
  }
})
