// Filtres par texte (sessions du formulaire LP inter ; le calendrier utilise les mêmes accroches via calendar.js).
// Accroches : [data-filter] sur un parent commun aux onglets et aux éléments, [data-filter-tab] sur chaque onglet (div),
// [data-filter-item] sur chaque élément filtré, qui contient un texte caché [data-filter-value] relié au CMS.
// Le script lit le texte de l'onglet choisi (son [data-filter-label] s'il en a un, sinon tout son texte) et n'affiche que
// les éléments dont le texte caché est le même (majuscules et espaces en trop ignorés).
// Aucun onglet choisi, ou onglet data-filter-tab="all" : tout s'affiche. Un second clic sur l'onglet choisi le libère.
// Un élément sans texte caché (Aucune date ne me convient) reste toujours visible ; une session masquée est décochée.
// Option : un champ [data-filter-input] dans le groupe reçoit le texte de l'onglet choisi (envoyé avec le formulaire).
// Option : data-filter-limit="5" sur le groupe n'affiche que les 5 premiers éléments, [data-filter-more] montre le reste
// (le nombre caché s'ajoute au texte du bouton ; data-less-label sur le bouton donne le texte une fois déplié).
// Une session cochée au-delà de la limite déplie la liste.
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

const groups = [] // groupes synchronisés (formulaire et copies) : fonctions select(value)
const renders = [] // affichage de chaque groupe, relu quand une session est cochée ailleurs

export function init() {
  document.querySelectorAll('[data-filter]').forEach((root) => {
    if (root.hasAttribute('data-calendar')) return // le calendrier gère aussi Voir plus de dates
    const tabs = [...root.querySelectorAll('[data-filter-tab]')]
    const items = [...root.querySelectorAll('[data-filter-item]')]
    if (!tabs.length && !items.length) return // sans onglets (une seule sous-formation), la limite et Voir plus restent actifs
    const inputs = [...root.querySelectorAll('[data-filter-input]')]
    // Champ texte masqué dans Webflow (pas de champ caché natif) : on en fait un vrai champ caché, hors de l'arbre d'accessibilité
    inputs.forEach((input) => (input.type = 'hidden'))
    // Limite d'affichage : data-filter-limit="5" sur le groupe, bouton [data-filter-more] pour voir le reste
    const limit = parseInt(root.dataset.filterLimit, 10) || 0
    const more = root.querySelector('[data-filter-more]')
    const moreLabel = more ? more.textContent.trim() : ''
    const lessLabel = more?.dataset.lessLabel || 'Voir moins de dates'
    const moreBox = more && more.parentElement.children.length === 1 ? more.parentElement : more
    let active = null
    let showAll = false

    const render = () => {
      const label = active && active.dataset.filterTab !== 'all' ? (active.querySelector('[data-filter-label]') || active).textContent.trim() : ''
      const wanted = norm(label)
      tabs.forEach((tab) => {
        tab.classList.toggle('is-active', tab === active)
        tab.setAttribute('aria-pressed', String(tab === active))
      })
      inputs.forEach((input) => (input.value = label))
      const matching = []
      items.forEach((item) => {
        const hide = !matches(item, wanted)
        if (!hide) matching.push(item)
        const radio = item.querySelector('input[type="radio"]')
        if (hide && radio && radio.checked) radio.checked = false
        item.classList.toggle('hide', hide)
      })
      if (!limit) return
      // Une session cochée au-delà de la limite (bouton Réserver du calendrier) : on montre toute la liste
      if (matching.slice(limit).some((item) => item.querySelector('input[type="radio"]:checked'))) showAll = true
      matching.forEach((item, i) => item.classList.toggle('hide', !showAll && i >= limit))
      if (!more) return
      const hiddenCount = matching.length - limit
      moreBox.classList.toggle('hide', hiddenCount <= 0)
      more.textContent = showAll ? lessLabel : `${moreLabel} (${hiddenCount})`
      more.setAttribute('aria-expanded', String(showAll))
    }

    // Choisit l'onglet dont le texte est value (null ou introuvable : aucun onglet)
    const select = (value) => {
      active = value ? tabs.find((tab) => tabText(tab) === norm(value)) || null : null
      showAll = false
      render()
    }

    if (more) {
      more.addEventListener('click', (e) => {
        e.preventDefault()
        showAll = !showAll
        render()
      })
      more.addEventListener('keydown', (e) => {
        if (e.key !== ' ') return
        e.preventDefault()
        more.click()
      })
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
    renders.push(render)
    render()
  })

  document.addEventListener('filter:select', (e) => groups.forEach((group) => group(e.detail?.value || null)))
  // Une session cochée ailleurs (formClone recopie sans événement, Réserver) : un seul écouteur pour tous les groupes,
  // limité aux boutons radio (la saisie dans les autres champs ne relance rien)
  document.addEventListener('change', (e) => {
    if (!e.target.matches?.('input[type="radio"]')) return
    setTimeout(() => renders.forEach((render) => render()))
  })
}
