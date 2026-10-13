// Calendrier des sessions (LP inter).
// Filtres : mêmes accroches que le module filter. [data-filter-tab] sur chaque onglet (data-filter-tab="all" pour Toutes),
// [data-filter-item] sur chaque ligne, avec un texte caché [data-filter-value] relié au CMS (nom de la formation) :
// un onglet n'affiche que les lignes dont ce texte est le sien (majuscules et espaces en trop ignorés). Aucun onglet
// choisi, ou Toutes : tout s'affiche. Un second clic sur un onglet le libère.
// Autres accroches : [data-calendar] sur la section, [data-calendar-date] dans la ligne, [data-calendar-book] sur ses
// boutons Réserver et Liste d'attente, [data-calendar-more] sur le bouton Voir plus de dates, [data-calendar-bar] sur la barre.
// Onglets et Voir plus peuvent être des liens role="button".
// États en classes natives Webflow : hide (Client-First) sur les lignes et Voir plus masqués, is-active sur l'onglet choisi,
// is-<clé> sur la barre de la ligne quand l'onglet correspondant porte data-calendar-filter="<clé>" (ex. is-mac).
// Ligne complète : visibilité conditionnelle CMS (Complet) dans Webflow, le JS n'a rien à décider.
// Réserver : coche la formation et la session de la ligne dans le formulaire (formClone recopie partout),
// passe à l'étape des coordonnées, puis la modale s'ouvre par [data-modal-open] posé sur le même bouton.

import { norm, tabText, itemValue, matches } from './filter.js'

const VISIBLE = 8 // lignes affichées avant Voir plus de dates

// Coche le radio du groupe dont la valeur ou le libellé correspond au texte, et prévient formClone
const checkRadio = (name, text) => {
  const wanted = norm(text)
  if (!wanted) return false
  const radios = [...document.querySelectorAll(`input[type="radio"][name="${name}"]`)]
  const label = (r) => norm(r.closest('label')?.querySelector('.w-form-label')?.textContent)
  const radio = radios.find((r) => norm(r.value) === wanted || label(r) === wanted)
  if (!radio) return false
  radio.checked = true
  radio.dispatchEvent(new Event('change', { bubbles: true }))
  return true
}

export function init() {
  document.querySelectorAll('[data-calendar]').forEach((calendar) => {
    const rows = [...calendar.querySelectorAll('[data-filter-item]')]
    const tabs = [...calendar.querySelectorAll('[data-filter-tab]')]
    const more = calendar.querySelector('[data-calendar-more]')
    const moreLabel = more ? more.textContent.trim() : ''
    // On masque le bloc qui entoure le bouton s'il ne contient que lui (pas de marge vide sous la liste)
    const moreBox = more && more.parentElement.children.length === 1 ? more.parentElement : more
    let active = tabs.find((tab) => tab.dataset.filterTab === 'all') || null
    let showAll = false

    // Couleur de la barre : classe is-<clé> de l'onglet dont le texte est celui de la ligne
    rows.forEach((row) => {
      const tab = tabs.find((t) => t.dataset.calendarFilter && tabText(t) === itemValue(row))
      if (tab) row.querySelector('[data-calendar-bar]')?.classList.add('is-' + tab.dataset.calendarFilter)
    })

    const render = () => {
      const wanted = active && active.dataset.filterTab !== 'all' ? tabText(active) : ''
      const matching = rows.filter((row) => matches(row, wanted))
      rows.forEach((row) => row.classList.add('hide'))
      matching.forEach((row, i) => row.classList.toggle('hide', !showAll && i >= VISIBLE))
      tabs.forEach((tab) => {
        tab.classList.toggle('is-active', tab === active)
        tab.setAttribute('aria-pressed', String(tab === active))
      })
      if (!more) return
      const hiddenCount = matching.length - VISIBLE
      moreBox.classList.toggle('hide', hiddenCount <= 0)
      more.textContent = showAll ? 'Voir moins de dates' : `${moreLabel} (${hiddenCount})`
      more.setAttribute('aria-expanded', String(showAll))
    }

    tabs.forEach((tab) =>
      tab.addEventListener('click', (e) => {
        e.preventDefault()
        active = active === tab && tab.dataset.filterTab !== 'all' ? null : tab
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

    // Onglets et Voir plus sont des liens role="button" dans Webflow : Espace a le même effet qu'un clic
    calendar.addEventListener('keydown', (e) => {
      if (e.key !== ' ' || !e.target.closest('[data-filter-tab], [data-calendar-more]')) return
      e.preventDefault()
      e.target.click()
    })

    // Écouteur posé sur chaque bouton (pas sur la section) : modal arrête la propagation du clic.
    // Calendar démarre avant modal (main.js), donc le choix est fait avant l'ouverture de la modale.
    calendar.querySelectorAll('[data-calendar-book]').forEach((book) =>
      book.addEventListener('click', () => {
        const row = book.closest('[data-filter-item]')
        if (!row) return
        checkRadio('Formation', row.querySelector('[data-filter-value]')?.textContent)
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
