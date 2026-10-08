// Onglets (programme des LP).
// Accroches : [data-tabs] sur le conteneur, [data-tab="cle"] sur chaque onglet, [data-tab-panel="cle"] sur chaque panneau.
// Le premier onglet est actif au chargement, ou celui qui porte la classe is-active dans Webflow.
// Sans JS, tous les panneaux restent visibles.

const CLASS_ACTIVE = 'is-active'

export function init() {
  document.querySelectorAll('[data-tabs]').forEach((root, rootIndex) => {
    const tabs = [...root.querySelectorAll('[data-tab]')]
    const panels = [...root.querySelectorAll('[data-tab-panel]')]
    if (!tabs.length || !panels.length) return

    const tabList = tabs[0].parentElement
    tabList.setAttribute('role', 'tablist')

    tabs.forEach((tab) => {
      const key = tab.dataset.tab
      const panel = panels.find((p) => p.dataset.tabPanel === key)
      tab.id = tab.id || `tab-${rootIndex + 1}-${key}`
      tab.setAttribute('role', 'tab')
      if (panel) {
        panel.id = panel.id || `tabpanel-${rootIndex + 1}-${key}`
        panel.setAttribute('role', 'tabpanel')
        panel.setAttribute('aria-labelledby', tab.id)
        tab.setAttribute('aria-controls', panel.id)
      }
    })

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
