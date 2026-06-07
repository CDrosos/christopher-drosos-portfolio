import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import PingPage from './pages/PingPage.tsx'
import './index.css'

const isPingRoute = window.location.pathname.replace(/\/$/, '') === '/ping'
const Root = isPingRoute ? PingPage : App

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
