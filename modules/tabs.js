// Onglets (programme des LP).
// Accroches : [data-tabs] sur le conteneur, [data-tab="cle"] sur chaque onglet, [data-tab-panel="cle"] sur chaque panneau.
// Le premier onglet est actif au chargement, ou celui qui porte la classe is-active dans Webflow.
// Attributs fixes posés dans Webflow : role="tablist" sur le parent des onglets ; role="tab", id et aria-controls sur chaque onglet ;
// role="tabpanel", id et aria-labelledby sur chaque panneau. Le module ne gère que l'état (aria-selected, tabindex, hidden, is-active).
// Sans JS, tous les panneaux restent visibles.

const CLASS_ACTIVE = 'is-active'

export function init() {
  document.querySelectorAll('[data-tabs]').forEach((root) => {
    const tabs = [...root.querySelectorAll('[data-tab]')]
    const panels = [...root.querySelectorAll('[data-tab-panel]')]
    if (!tabs.length || !panels.length) return

    const show = (index, moveFocus) => {
      tabs.forEach((tab, i) => {
        const active = i === index
        tab.classList.toggle(CLASS_ACTIVE, active)
        tab.setAttribute('aria-selected', String(active))
        tab.setAttribute('tabindex', active ? '0' : '-1')
        const panel = panels.find((p) => p.dataset.tabPanel === tab.dataset.tab)
        if (panel) panel.hidden = !active
      })
      if (moveFocus) tabs[index].focus()
    }

    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => show(i, false))
      tab.addEventListener('keydown', (e) => {
        const keys = { ArrowRight: 1, ArrowLeft: -1 }
        if (e.key in keys) {
          e.preventDefault()
          show((i + keys[e.key] + tabs.length) % tabs.length, true)
        } else if (e.key === 'Home' || e.key === 'End') {
          e.preventDefault()
          show(e.key === 'Home' ? 0 : tabs.length - 1, true)
        } else if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          show(i, false)
        }
      })
    })

    const initial = tabs.findIndex((tab) => tab.classList.contains(CLASS_ACTIVE))
    show(initial === -1 ? 0 : initial, false)
  })
}
