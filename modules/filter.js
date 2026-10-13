// Filtres par texte (sessions du formulaire LP inter ; le calendrier utilise les mêmes accroches via calendar.js).
// Accroches : [data-filter] sur un parent commun aux onglets et aux éléments, [data-filter-tab] sur chaque onglet,
// [data-filter-item] sur chaque élément filtré, qui contient un texte caché [data-filter-value] relié au CMS.
// Le script lit le texte de l'onglet choisi (son [data-filter-label] s'il en a un, sinon son libellé de formulaire
// .w-form-label, sinon tout son texte) et n'affiche que les éléments dont le texte caché est le même
// (majuscules et espaces en trop ignorés). Aucun onglet choisi, ou onglet data-filter-tab="all" : tout s'affiche.
// Un élément sans texte caché (Aucune date ne me convient) reste toujours visible.
// Onglet qui contient un bouton radio : il est choisi quand son radio est coché (copies formClone comprises).
// Sinon, un clic le choisit, un second clic le libère. États en classes natives : is-active sur l'onglet, hide sur l'élément.

export const norm = (text) => (text || '').replace(/\s+/g, ' ').trim().toLowerCase()

export const tabText = (tab) =>
  norm((tab.querySelector('[data-filter-label]') || tab.querySelector('.w-form-label') || tab).textContent)

export const itemValue = (item) => {
  const value = item.querySelector('[data-filter-value]')
  return value ? norm(value.textContent) : null
}

// Éléments qui correspondent au texte voulu ('' = tout)
export const matches = (item, wanted) => {
  const value = itemValue(item)
  return !wanted || value === null || value === wanted
}

export function init() {
  document.querySelectorAll('[data-filter]').forEach((root) => {
    if (root.hasAttribute('data-calendar')) return // le calendrier gère aussi Voir plus de dates
    const tabs = [...root.querySelectorAll('[data-filter-tab]')]
    const items = [...root.querySelectorAll('[data-filter-item]')]
    if (!tabs.length || !items.length) return
    let active = null

    const radioOf = (tab) => tab.querySelector('input[type="radio"]')

    const render = () => {
      // Onglets à radio : l'onglet choisi est celui dont le radio est coché
      if (tabs.some(radioOf)) active = tabs.find((tab) => radioOf(tab)?.checked) || null
      const wanted = active && active.dataset.filterTab !== 'all' ? tabText(active) : ''
      tabs.forEach((tab) => {
        tab.classList.toggle('is-active', tab === active)
        if (!radioOf(tab)) tab.setAttribute('aria-pressed', String(tab === active))
      })
      items.forEach((item) => {
        const hide = !matches(item, wanted)
        item.classList.toggle('hide', hide)
        // Une session masquée ne reste pas cochée
        const radio = item.querySelector('input[type="radio"]')
        if (hide && radio && radio.checked) radio.checked = false
      })
    }

    tabs.forEach((tab) => {
      if (radioOf(tab)) return
      tab.addEventListener('click', (e) => {
        e.preventDefault()
        active = active === tab ? null : tab
        render()
      })
      // Onglet en lien role="button" : Espace a le même effet qu'un clic
      tab.addEventListener('keydown', (e) => {
        if (e.key !== ' ') return
        e.preventDefault()
        tab.click()
      })
    })

    // formClone coche les copies sans événement : on relit après chaque changement sur la page
    document.addEventListener('change', () => setTimeout(render))
    render()
  })
}
