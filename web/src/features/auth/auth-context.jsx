import { createContext, startTransition, useContext, useEffect, useState } from 'react'
import { apiClient } from '../../lib/api-client'
import { sessionStore } from '../../lib/storage'

const AuthContext = createContext(null)

function getDefaultRouteForRole(role) {
  return role === 'admin' ? '/admin' : '/activation'
}

export function AuthProvider({ children }) {
  const [state, setState] = useState(() => {
    const session = sessionStore.get()

    if (!session?.token) {
      return {
        status: 'guest',
        token: null,
        user: null,
      }
    }

    return {
      status: 'bootstrapping',
      token: session.token,
      user: session.user || null,
    }
  })

  useEffect(() => {
    const session = sessionStore.get()

    if (!session?.token) {
      return
    }

    let active = true

    async function bootstrap() {
      try {
        const result = await apiClient.me()

        if (!active) {
          return
        }

        sessionStore.set(
          {
            token: session.token,
            user: result.user,
          },
          {
            remember: session.remember,
          },
        )

        setState({
          status: 'authenticated',
          token: session.token,
          user: result.user,
        })
      } catch {
        sessionStore.clear()

        if (!active) {
          return
        }

        setState({
          status: 'guest',
          token: null,
          user: null,
        })
      }
    }

    bootstrap()

    return () => {
      active = false
    }
  }, [])

  async function login(credentials, options = {}) {
    const result = await apiClient.login(credentials)

    sessionStore.set(
      {
        token: result.accessToken,
        user: result.user,
      },
      {
        remember: options.remember !== false,
      },
    )

    startTransition(() => {
      setState({
        status: 'authenticated',
        token: result.accessToken,
        user: result.user,
      })
    })

    return {
      user: result.user,
      nextPath: getDefaultRouteForRole(result.user.role),
    }
  }

  function logout() {
    sessionStore.clear()
    setState({
      status: 'guest',
      token: null,
      user: null,
    })
  }

  const value = {
    ...state,
    isAuthenticated: state.status === 'authenticated',
    isBootstrapping: state.status === 'bootstrapping',
    login,
    logout,
    getDefaultRoute: () => getDefaultRouteForRole(state.user?.role),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
