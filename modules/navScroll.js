// Navbar décollée du haut tant que la page n'a pas défilé (maquette : 40px en haut, 16px au défilement).
// Accroche : [data-nav-scroll] sur navbar_component. Le module pose seulement la classe ;
// les valeurs viennent du combo is-top dans Webflow. Sans JS, la navbar reste à 16px.

const THRESHOLD = 24 // px défilés avant de quitter l'état « en haut de page »
const CLASS_TOP = 'is-top'

export function init() {
  document.querySelectorAll('[data-nav-scroll]').forEach((nav) => {
    const update = () => nav.classList.toggle(CLASS_TOP, window.scrollY < THRESHOLD)
    update()
    window.addEventListener('scroll', update, { passive: true })
  })
}
