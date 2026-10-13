// Filtres par texte (sessions du formulaire LP inter ; le calendrier utilise les mêmes accroches via calendar.js).
// Accroches : [data-filter] sur un parent commun aux onglets et aux éléments, [data-filter-tab] sur chaque onglet (div),
// [data-filter-item] sur chaque élément filtré, qui contient un texte caché [data-filter-value] relié au CMS.
// Le script lit le texte de l'onglet choisi (son [data-filter-label] s'il en a un, sinon tout son texte) et n'affiche que
// les éléments dont le texte caché est le même (majuscules et espaces en trop ignorés).
// Aucun onglet choisi, ou onglet data-filter-tab="all" : tout s'affiche. Un second clic sur l'onglet choisi le libère.
// Un élément sans texte caché (Aucune date ne me convient) reste toujours visible ; une session masquée est décochée.
// Option : un champ [data-filter-input] dans le groupe reçoit le texte de l'onglet choisi (envoyé avec le formulaire).
// Les groupes hors calendrier (formulaire du hero et ses copies formClone) restent synchronisés entre eux.
// Un autre module choisit un onglet par l'événement filter:select (detail.value = texte de l'onglet).
// États en classes natives : is-active sur l'onglet choisi, hide (Client-First) sur l'élément masqué.

export const norm = (text) => (text || '').replace(/\s+/g, ' ').trim().toLowerCase()

export const tabText = (tab) => norm((tab.querySelector('[data-filter-label]') || tab).textContent)

export const itemValue = (item) => {
  const value = item.querySelector('[data-filter-value]')
  return value ? norm(value.textContent) : null
}

// L'élément correspond-il au texte voulu ('' = tout) ?
export const matches = (item, wanted) => {
  const value = itemValue(item)
  return !wanted || value === null || value === wanted
}

const groups = [] // groupes synchronisés (formulaire et copies)

export function init() {
  document.querySelectorAll('[data-filter]').forEach((root) => {
    if (root.hasAttribute('data-calendar')) return // le calendrier gère aussi Voir plus de dates
    const tabs = [...root.querySelectorAll('[data-filter-tab]')]
    const items = [...root.querySelectorAll('[data-filter-item]')]
    if (!tabs.length) return
    const inputs = [...root.querySelectorAll('[data-filter-input]')]
    let active = null

    const render = () => {
      const label = active && active.dataset.filterTab !== 'all' ? (active.querySelector('[data-filter-label]') || active).textContent.trim() : ''
      const wanted = norm(label)
      tabs.forEach((tab) => {
        tab.classList.toggle('is-active', tab === active)
        tab.setAttribute('aria-pressed', String(tab === active))
      })
      inputs.forEach((input) => (input.value = label))
      items.forEach((item) => {
        const hide = !matches(item, wanted)
        item.classList.toggle('hide', hide)
        const radio = item.querySelector('input[type="radio"]')
        if (hide && radio && radio.checked) radio.checked = false
      })
    }

    // Choisit l'onglet dont le texte est value (null ou introuvable : aucun onglet)
    const select = (value) => {
      active = value ? tabs.find((tab) => tabText(tab) === norm(value)) || null : null
      render()
    }

    tabs.forEach((tab) => {
      tab.addEventListener('click', (e) => {
        e.preventDefault()
        const value = active === tab ? null : tabText(tab)
        groups.forEach((group) => group(value))
      })
      // Onglet en div role="button" : Entrée et Espace ont le même effet qu'un clic
      tab.addEventListener('keydown', (e) => {
        if (e.key !== ' ' && e.key !== 'Enter') return
        e.preventDefault()
        tab.click()
      })
    })

    groups.push(select)
    render()
  })

  document.addEventListener('filter:select', (e) => groups.forEach((group) => group(e.detail?.value || null)))
}
