import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { FLIP_MS, POPUP_IN_MS, YEAR_FLIP_MS } from './lib/timing'
import './styles.css'

document.documentElement.style.setProperty('--flip-ms', `${FLIP_MS}ms`)
document.documentElement.style.setProperty('--year-flip-ms', `${YEAR_FLIP_MS}ms`)
document.documentElement.style.setProperty('--popup-in-ms', `${POPUP_IN_MS}ms`)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)