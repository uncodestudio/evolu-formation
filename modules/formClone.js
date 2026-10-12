// Formulaire répété sur la page (hero, section CTA, modale) sans le refaire à la main.
// Accroches : le bloc formulaire source (.w-form) porte [data-form-source] (valeur facultative, par défaut « hero ») ;
// chaque emplacement est une div vide [data-form-clone="cta"], [data-form-clone="modale"]...
// Sans [data-form-source], la source est le premier .w-form qui contient un [data-form-steps].
// Le module copie la source dans chaque emplacement, rend les ids uniques (suffixe = valeur de l'emplacement),
// ajoute un champ caché « Emplacement » pour savoir d'où vient la demande, et synchronise les valeurs :
// ce que le prospect saisit dans un formulaire se retrouve dans les autres, et l'étape en cours (formSteps) aussi.
// Seul le formulaire envoyé part.
// Il doit tourner avant que Webflow branche ses formulaires (DOMContentLoaded) : main.js, chargé en module,
// s'exécute avant cet événement. Sans JS, les emplacements restent vides et le hero garde son formulaire.

const LOCATION_FIELD = 'Emplacement' // nom du champ caché reçu dans l'e-mail Webflow
const ID_REFS = ['for', 'aria-controls', 'aria-labelledby', 'aria-describedby']

const findSource = () =>
  document.querySelector('[data-form-source]') ||
  document.querySelector('[data-form-steps]')?.closest('.w-form')

const addLocationField = (form, location) => {
  if (form.querySelector(`input[name="${LOCATION_FIELD}"]`)) return
  const field = document.createElement('input')
  field.type = 'hidden'
  field.name = LOCATION_FIELD
  field.value = location
  form.appendChild(field)
}

// Suffixe tous les ids de la copie et les attributs qui les citent, pour qu'un label ne coche pas le champ du hero
const uniquifyIds = (root, suffix) => {
  const map = new Map()
  const withId = [...root.querySelectorAll('[id]')]
  if (root.id) withId.unshift(root)
  withId.forEach((el) => {
    const id = `${el.id}-${suffix}`
    map.set(el.id, id)
    el.id = id
  })
  root.querySelectorAll(ID_REFS.map((attr) => `[${attr}]`).join(',')).forEach((el) => {
    ID_REFS.forEach((attr) => {
      if (!el.hasAttribute(attr)) return
      const value = el.getAttribute(attr).split(' ').map((id) => map.get(id) || id).join(' ')
      el.setAttribute(attr, value)
    })
  })
}

const syncValue = (field, forms) => {
  if (!field.name) return
  forms.forEach((form) => {
    if (form.contains(field)) return
    form.querySelectorAll(`[name="${CSS.escape(field.name)}"]`).forEach((other) => {
      // Radio : cocher la même option suffit, le navigateur décoche les autres du groupe
      if (field.type === 'radio') {
        if (field.checked && other.value === field.value) other.checked = true
      } else if (field.type === 'checkbox') other.checked = field.checked
      else other.value = field.value
    })
  })
}

export function init() {
  const slots = [...document.querySelectorAll('[data-form-clone]')]
  const source = findSource()
  if (!source || !slots.length) return

  slots.forEach((slot, i) => {
    const location = slot.dataset.formClone || `copie-${i + 1}`
    const copy = source.cloneNode(true)
    copy.removeAttribute('data-form-source')
    uniquifyIds(copy, location)
    slot.appendChild(copy)
    copy.querySelectorAll('form').forEach((form) => addLocationField(form, location))
  })
  source.querySelectorAll('form').forEach((form) => addLocationField(form, source.dataset.formSource || 'hero'))

  const forms = [source, ...slots].flatMap((el) => [...el.querySelectorAll('form')])
  forms.forEach((form) => {
    const onChange = (e) => {
      if (e.target.matches('input, select, textarea') && e.target.name !== LOCATION_FIELD) syncValue(e.target, forms)
    }
    form.addEventListener('input', onChange)
    form.addEventListener('change', onChange)
    // Étapes (formSteps) : Continuer ou Modifier dans un formulaire fait passer les autres à la même étape
    form.addEventListener('formsteps:change', (e) => {
      forms.forEach((other) => {
        if (other !== form) other.dispatchEvent(new CustomEvent('formsteps:goto', { detail: { index: e.detail.index } }))
      })
    })
  })
}
