import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/Pocket/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico'],
      manifest: {
        name: 'Pocket Expense Tracker',
        short_name: 'Pocket',
        description: 'Your personal expense tracker',
        theme_color: '#0B1020',
        background_color: '#0B1020',
        display: 'standalone',
        start_url: '/Pocket/',
        scope: '/Pocket/',
        icons: [
          {
            src: 'icons/pocket-logo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/pocket-logo.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})