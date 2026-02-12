import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AppProvider } from './Context.jsx'
import { NotificationProvider } from './components/Notification.jsx'
import { HelmetProvider } from 'react-helmet-async'
import './i18n'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <NotificationProvider>
          <AppProvider>
            <App />
          </AppProvider>
        </NotificationProvider>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
)
