import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { fileURLToPath } from 'node:url'

/**
 * גרסה רגילה (dist/): PWA עם Service Worker, להפעלה משרת סטטי.
 * גרסה בקובץ אחד (dist-single/): קובץ HTML יחיד שנפתח בדאבל-קליק, בלי שרת.
 */
const single = process.env.SINGLE === '1'

export default defineConfig({
  base: './',
  resolve: single
    ? { alias: [{ find: 'virtual:pwa-register', replacement: fileURLToPath(new URL('./src/pwaStub.ts', import.meta.url)) }] }
    : undefined,
  plugins: [
    react(),
    ...(single
      ? [viteSingleFile()]
      : [
          VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['icon.svg'],
            manifest: {
              name: 'הנגרייה שלי - WoodCraft',
              short_name: 'הנגרייה',
              description: 'תכנון ובניית פרויקטי נגרות ביתיים',
              lang: 'he',
              dir: 'rtl',
              start_url: './',
              scope: './',
              display: 'standalone',
              background_color: '#F3E8D6',
              theme_color: '#3A2A1D',
              icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
            },
            workbox: {
              globPatterns: ['**/*.{js,css,html,svg,ico,png,woff2}'],
              navigateFallback: 'index.html',
            },
          }),
        ]),
  ],
  build: single ? { outDir: 'dist-single', assetsInlineLimit: 100000000, cssCodeSplit: false } : undefined,
})
