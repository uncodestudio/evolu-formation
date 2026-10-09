// Formulaire de devis en plusieurs étapes (hero des LP).
// Accroches : [data-form-steps] sur le <form>, [data-form-step] sur chaque étape (dans l'ordre),
// [data-form-next] et [data-form-prev] pour naviguer, [data-form-recap] rempli avec le récapitulatif.
// Sans JS, toutes les étapes restent visibles et le formulaire reste envoyable (Webflow natif).
// Ailleurs sur la page, un lien [data-form-preset="id-du-radio"] coche ce choix dans le formulaire quand on clique dessus
// (bloc devis du bas de page vers le formulaire du hero).
// Un champ caché [data-form-page] reçoit le titre et l'adresse de la page : le formulaire s'appelle « Form LP »
// sur toutes les LP, c'est ce champ qui dit dans l'e-mail reçu de quelle page vient la demande.

const RECAP_FIELDS = ['Formation', 'Nom', 'Entreprise'] // champs repris dans le récapitulatif, dans cet ordre
const RECAP_SEPARATOR = ' · '
const DEFAULT_CHOICE = 'Formation' // groupe radio pré-coché sur sa première option (comme la maquette)

const firstInvalid = (step) =>
  [...step.querySelectorAll('input, select, textarea')].find((field) => !field.checkValidity())

const fieldValue = (form, name) => {
  const fields = [...form.querySelectorAll(`[name="${name}"]`)]
  const field = fields.find((f) => f.type !== 'radio' || f.checked)
  return field ? field.value.trim() : ''
}

export function init() {
  document.querySelectorAll('[data-form-steps]').forEach((form) => {
    const steps = [...form.querySelectorAll('[data-form-step]')]
    if (steps.length < 2) return
    const scope = form.closest('.w-form') || form
    let current = 0

    form.querySelectorAll('[data-form-page]').forEach((field) => {
      field.value = `${document.title} (${location.pathname})`
    })

    const preset = form.querySelector(`input[type="radio"][name="${DEFAULT_CHOICE}"]`)
    if (preset && !form.querySelector(`input[type="radio"][name="${DEFAULT_CHOICE}"]:checked`)) preset.checked = true

    const updateRecap = () => {
      const text = RECAP_FIELDS.map((name) => fieldValue(form, name)).filter(Boolean).join(RECAP_SEPARATOR)
      if (text) scope.querySelectorAll('[data-form-recap]').forEach((el) => (el.textContent = text))
    }

    const show = (index, moveFocus) => {
      steps.forEach((step, i) => (step.hidden = i !== index))
      current = index
      if (!moveFocus) return
      const title = steps[index].querySelector('h2, h3, h4')
      if (title) {
        title.setAttribute('tabindex', '-1')
        title.focus({ preventScroll: true })
      }
    }

    const next = () => {
      const invalid = firstInvalid(steps[current])
      if (invalid) {
        invalid.reportValidity()
        return
      }
      updateRecap()
      show(Math.min(current + 1, steps.length - 1), true)
    }

    form.addEventListener('click', (e) => {
      if (e.target.closest('[data-form-next]')) {
        e.preventDefault()
        next()
      } else if (e.target.closest('[data-form-prev]')) {
        e.preventDefault()
        show(Math.max(current - 1, 0), true)
      }
    })

    // Entrée dans une étape intermédiaire : on passe à l'étape suivante. Il faut le faire au clavier,
    // car le navigateur valide tout le formulaire avant l'envoi et bloquerait sur les champs masqués.
    form.addEventListener('keydown', (e) => {
      // Espace sur les liens-boutons Continuer et Modifier : même effet qu'un clic, comme un vrai bouton
      if (e.key === ' ' && e.target.closest('[data-form-next], [data-form-prev]')) {
        e.preventDefault()
        e.target.click()
        return
      }
      if (e.key !== 'Enter' || current === steps.length - 1) return
      if (e.target.matches('textarea, button, a')) return
      e.preventDefault()
      next()
    })

    // Filet de sécurité si un envoi est déclenché depuis une étape intermédiaire
    form.addEventListener(
      'submit',
      (e) => {
        if (current === steps.length - 1) {
          updateRecap()
          return
        }
        e.preventDefault()
        e.stopImmediatePropagation()
        next()
      },
      true
    )

    show(0, false)
  })

  document.querySelectorAll('[data-form-preset]').forEach((link) => {
    link.addEventListener('click', () => {
      const radio = document.getElementById(link.dataset.formPreset)
      if (radio) radio.checked = true
    })
  })
}
