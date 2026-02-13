import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import theme from './app/theme.js'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { SnackbarProvider } from './context/SnackbarContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline/>
          <SnackbarProvider>
            <App />
          </SnackbarProvider>
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>,
)
