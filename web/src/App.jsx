import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './features/auth/auth-context.jsx'
import { router } from './app/router.jsx'
import { apiClient } from './lib/api-client.js'
import { applyEventTheme } from './lib/event-theme.js'

function App() {
  useEffect(() => {
    let active = true

    applyEventTheme()

    apiClient
      .getActivationConfig()
      .then((result) => {
        if (active && result?.event) {
          applyEventTheme(result.event)
        }
      })
      .catch(() => {})

    return () => {
      active = false
    }
  }, [])

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

export default App
