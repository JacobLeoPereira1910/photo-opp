const SESSION_KEY = 'photo-opp.session'

function getBrowserStorage(type) {
  if (typeof window === 'undefined') {
    return null
  }

  return type === 'local' ? window.localStorage : window.sessionStorage
}

function readSessionFromStorage(storage, remember) {
  if (!storage) {
    return null
  }

  const value = storage.getItem(SESSION_KEY)

  if (!value) {
    return null
  }

  try {
    return {
      ...JSON.parse(value),
      remember
    }
  } catch {
    storage.removeItem(SESSION_KEY)
    return null
  }
}

export const sessionStore = {
  get() {
    return (
      readSessionFromStorage(getBrowserStorage('local'), true) ||
      readSessionFromStorage(getBrowserStorage('session'), false)
    )
  },

  set(session, { remember = true } = {}) {
    const target = getBrowserStorage(remember ? 'local' : 'session')
    const other = getBrowserStorage(remember ? 'session' : 'local')

    other?.removeItem(SESSION_KEY)
    target?.setItem(SESSION_KEY, JSON.stringify(session))
  },

  clear() {
    getBrowserStorage('local')?.removeItem(SESSION_KEY)
    getBrowserStorage('session')?.removeItem(SESSION_KEY)
  },
}
