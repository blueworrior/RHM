import { AuthProvider } from './context/AuthContext'
import AppRoputes from './routes/AppRoutes'

function App() {

  return (
    <AuthProvider>
      <AppRoputes/>
    </AuthProvider>
  )
}

export default App
