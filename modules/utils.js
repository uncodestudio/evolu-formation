// modules/utils.js : petites fonctions partagées entre les modules.

export function ready(callback) {
  if (document.readyState !== 'loading') callback()
  else document.addEventListener('DOMContentLoaded', callback)
}

export function debounce(func, wait = 300) {
  let timeout
  return function (...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle(func, limit = 300) {
  let inThrottle
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Charge une bibliothèque seulement sur les pages qui en ont besoin (R-45).
// Exemple : await loadScript('https://cdn.jsdelivr.net/npm/@splidejs/splide@4/dist/js/splide.min.js')
const loaded = new Map()
export function loadScript(src) {
  if (!loaded.has(src)) {
    loaded.set(
      src,
      new Promise((resolve, reject) => {
        const s = document.createElement('script')
        s.src = src
        s.onload = resolve
        s.onerror = reject
        document.head.appendChild(s)
      })
    )
  }
  return loaded.get(src)
}

// Lit une variable Webflow, pour ne jamais écrire une couleur ou une durée en dur dans le JS (R-40).
// Exemple : cssVar('--_theme---text--primary')
export function cssVar(name, el = document.documentElement) {
  return getComputedStyle(el).getPropertyValue(name).trim()
}

export const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches
