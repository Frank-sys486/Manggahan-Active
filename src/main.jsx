import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import AboutProject from './AboutProject.jsx'
import './App.css'

const isAboutProject = window.location.pathname.replace(/\/$/, '') === '/aboutproject'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isAboutProject ? <AboutProject /> : <App />}
  </StrictMode>,
)
