import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/story-script/400.css'
import '@fontsource/chewy/400.css'
import './index.css'
import App from './App.tsx'
import { NotesProvider } from './contexts/Notes/NotesProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NotesProvider>
      <App />
    </NotesProvider>
  </StrictMode>,
)
