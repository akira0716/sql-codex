import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './AuthContext'
import { LanguageProvider } from './i18n'
import { UnsavedChangesProvider } from './UnsavedChangesContext'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <AuthProvider>
        <UnsavedChangesProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </UnsavedChangesProvider>
      </AuthProvider>
    </LanguageProvider>
  </StrictMode>,
)

