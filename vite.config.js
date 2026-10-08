// vite.config.js
import { defineConfig } from 'vite'
// Inspecteur de mesures et maquettes HTML (dossier maquette/), en dev seulement : scripts/inspecteur/LISEZ-MOI.md
import inspecteur from './scripts/inspecteur/vite-plugin.js'

// Port propre au site (R-29) : à remplacer par le prochain port libre du registre (playbook, webflow/js.md),
// et à reporter dans la ligne localhost du pied de page Webflow (snippets/footer.html).
const PORT = 3004

export default defineConfig({
  plugins: [inspecteur()],
  build: {
    outDir: 'dist',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      input: 'main.js',
      output: {
        format: 'es',
        entryFileNames: 'main.js',
        assetFileNames: '[name].[ext]',
        inlineDynamicImports: true, // un seul fichier : dist/main.js
      },
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  server: {
    port: PORT,
    strictPort: true, // refuse de démarrer si le port est pris, au lieu de servir ailleurs
    open: false,
    cors: true,
  },
})
