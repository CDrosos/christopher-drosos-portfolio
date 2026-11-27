import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource/plus-jakarta-sans/latin-400.css'
import '@fontsource/plus-jakarta-sans/latin-500.css'
import '@fontsource/plus-jakarta-sans/latin-600.css'
import '@fontsource/plus-jakarta-sans/latin-700.css'
import '@fontsource/plus-jakarta-sans/latin-800.css'
import '@fontsource/jetbrains-mono/latin-500.css'
import App from './App.tsx'
import PingPage from './pages/PingPage.tsx'
import './index.css'

// Cloudflare (and the previous Vercel rewrite) serve /ping from the InsForge
// keepalive function. This client route is what `vite` shows without that proxy.
const isPingRoute = window.location.pathname.replace(/\/$/, '') === '/ping'
const Root = isPingRoute ? PingPage : App

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
