// Calendrier des sessions (LP inter).
// Accroches : [data-calendar] sur la section, [data-calendar-filter="all|init|mac"] sur les boutons de filtre,
// [data-calendar-session] sur chaque ligne (composant Session, liste CMS à terme) avec data-calendar-type="init|mac",
// [data-calendar-date] et [data-calendar-formation] dans la ligne, [data-calendar-book] sur son bouton Réserver,
// [data-calendar-more] sur le bouton Voir plus de dates. Filtres et Voir plus peuvent être des liens role="button".
// Ligne complète : le composant affiche le bloc [data-calendar-full] (interrupteur Complet), le JS n'a rien à décider.
// Réserver : coche la formation et la session de la ligne dans le formulaire (formClone recopie partout),
// passe à l'étape des coordonnées, puis la modale s'ouvre par [data-modal-open] posé sur le même bouton.

const VISIBLE = 8 // lignes affichées avant Voir plus de dates

const norm = (text) => (text || '').replace(/\s+/g, ' ').trim().toLowerCase()

// Coche le radio du groupe dont la valeur correspond au texte, et prévient formClone
const checkRadio = (name, text) => {
  const wanted = norm(text)
  if (!wanted) return false
  const radios = [...document.querySelectorAll(`input[type="radio"][name="${name}"]`)]
  const radio = radios.find((r) => norm(r.value) === wanted) || radios.find((r) => norm(r.value).includes(wanted))
  if (!radio) return false
  radio.checked = true
  radio.dispatchEvent(new Event('change', { bubbles: true }))
  return true
}

export function init() {
  document.querySelectorAll('[data-calendar]').forEach((calendar) => {
    const rows = [...calendar.querySelectorAll('[data-calendar-session]')]
    const filters = [...calendar.querySelectorAll('[data-calendar-filter]')]
    const more = calendar.querySelector('[data-calendar-more]')
    const moreLabel = more ? more.textContent.trim() : ''
    let filter = 'all'
    let showAll = false

    const render = () => {
      const matching = rows.filter((row) => filter === 'all' || row.dataset.calendarType === filter)
      rows.forEach((row) => (row.hidden = true))
      matching.forEach((row, i) => (row.hidden = !showAll && i >= VISIBLE))
      filters.forEach((btn) => btn.setAttribute('aria-pressed', String(btn.dataset.calendarFilter === filter)))
      if (!more) return
      const hiddenCount = matching.length - VISIBLE
      more.hidden = hiddenCount <= 0
      more.textContent = showAll ? 'Voir moins de dates' : `${moreLabel} (${hiddenCount})`
      more.setAttribute('aria-expanded', String(showAll))
    }

    filters.forEach((btn) =>
      btn.addEventListener('click', (e) => {
        e.preventDefault()
        filter = btn.dataset.calendarFilter
        showAll = false
        render()
      })
    )

    if (more) {
      more.addEventListener('click', (e) => {
        e.preventDefault()
        showAll = !showAll
        render()
      })
    }

    // Filtres et Voir plus sont des liens role="button" dans Webflow : Espace a le même effet qu'un clic
    calendar.addEventListener('keydown', (e) => {
      if (e.key !== ' ' || !e.target.closest('[data-calendar-filter], [data-calendar-more]')) return
      e.preventDefault()
      e.target.click()
    })

    // Écouteur posé sur chaque bouton (pas sur la section) : modal arrête la propagation du clic.
    // Calendar démarre avant modal (main.js), donc le choix est fait avant l'ouverture de la modale.
    calendar.querySelectorAll('[data-calendar-book]').forEach((book) =>
      book.addEventListener('click', () => {
        const row = book.closest('[data-calendar-session]')
        if (!row) return
        checkRadio('Formation', row.querySelector('[data-calendar-formation]')?.textContent)
        const sessionChecked = checkRadio('Session', row.querySelector('[data-calendar-date]')?.textContent)
        // Formation et session choisies : on va directement aux coordonnées (étape 2)
        if (sessionChecked) {
          document.querySelectorAll('[data-form-steps]').forEach((form) =>
            form.dispatchEvent(new CustomEvent('formsteps:goto', { detail: { index: 1 } }))
          )
        }
      })
    )

    render()
  })
}
