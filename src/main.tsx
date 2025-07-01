import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { OptionsProvider } from './context/OptionsContext'

createRoot(document.getElementById("root")!).render(
  <OptionsProvider>
    <App />
  </OptionsProvider>
);
