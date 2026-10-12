// Modale accessible (formulaire de devis des LP).
// Accroches : [data-modal="devis"] sur la modale (cachée par défaut dans le Designer, classe is-open à l'ouverture),
// [data-modal-open="devis"] sur tout bouton ou lien qui l'ouvre, [data-modal-close] sur le fond et la croix.
// ARIA fixe posé dans le Designer (R-73) : role="dialog", aria-modal="true", aria-labelledby sur la boîte.
// Le JS gère l'état : classe is-open (is-closing pendant l'animation de fermeture), focus piégé dans la boîte, Échap pour fermer, défilement de la page bloqué,
// retour du focus sur le bouton d'origine. Sans JS, un lien d'ouverture garde son href (ancre vers le formulaire du hero).
// Un bouton d'ouverture peut aussi porter [data-form-preset] : formSteps coche le choix, formClone le recopie dans la modale.

const OPEN_CLASS = 'is-open'
const CLOSING_CLASS = 'is-closing'
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])'

const visible = (el) => el.offsetParent !== null || el === document.activeElement

export function init() {
  document.querySelectorAll('[data-modal]').forEach((modal) => {
    const name = modal.dataset.modal
    const dialog = modal.querySelector('[role="dialog"]') || modal
    let lastFocus = null

    const focusables = () => [...dialog.querySelectorAll(FOCUSABLE)].filter(visible)

    const onKeydown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        close()
        return
      }
      if (e.key !== 'Tab') return
      const items = focusables()
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    const open = (trigger) => {
      lastFocus = trigger || document.activeElement
      modal.classList.add(OPEN_CLASS)
      document.documentElement.style.overflow = 'hidden'
      document.addEventListener('keydown', onKeydown)
      // Focus sur le premier champ du formulaire, sinon sur la boîte elle-même
      const field = dialog.querySelector('input:not([type="hidden"]), select, textarea') || focusables()[0]
      if (field) field.focus({ preventScroll: true })
      else {
        dialog.setAttribute('tabindex', '-1')
        dialog.focus({ preventScroll: true })
      }
    }

    // Fermeture animée : classe is-closing le temps de l'animation CSS (global-styles), puis la modale est masquée
    const close = () => {
      if (!modal.classList.contains(OPEN_CLASS) || modal.classList.contains(CLOSING_CLASS)) return
      document.removeEventListener('keydown', onKeydown)
      modal.classList.add(CLOSING_CLASS)
      const finish = () => {
        modal.classList.remove(OPEN_CLASS, CLOSING_CLASS)
        document.documentElement.style.overflow = ''
        if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true })
      }
      const duration = parseFloat(getComputedStyle(dialog).animationDuration) || 0
      if (duration > 0) setTimeout(finish, duration * 1000)
      else finish()
    }

    document.querySelectorAll(`[data-modal-open="${name}"]`).forEach((trigger) => {
      trigger.setAttribute('aria-haspopup', 'dialog')
      trigger.addEventListener('click', (e) => {
        e.preventDefault()
        // Empêche le défilement de Webflow vers l'ancre (#reserver) et son ajout dans l'adresse
        e.stopPropagation()
        open(trigger)
      })
    })

    modal.querySelectorAll('[data-modal-close]').forEach((btn) => btn.addEventListener('click', close))
  })
}
