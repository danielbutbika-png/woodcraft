import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import { requestPersistentStorage } from './db/db'
import '@fontsource/heebo/hebrew-400.css'
import '@fontsource/heebo/hebrew-700.css'
import '@fontsource/heebo/latin-400.css'
import '@fontsource/heebo/latin-700.css'
import './styles.css'

registerSW({ immediate: true })
void requestPersistentStorage()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
