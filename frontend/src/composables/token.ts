export function useTokenStore() {
  const token = localStorage.getItem('token') ?? sessionStorage.getItem('token') ?? null
  const user = localStorage.getItem('user') ?? sessionStorage.getItem('user') ?? null

  function setToStorage(newToken: string, user: string, remember: boolean = false) {
    if (remember) {
      localStorage.setItem('token', newToken)
      localStorage.setItem('user', user)
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('user')
    }
    else {
      sessionStorage.setItem('token', newToken)
      sessionStorage.setItem('user', user)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }

  function getToken() {
    return token
  }

  function isAuthenticated() {
    return !!token
  }

  function getUser() {
    return user ? JSON.parse(user) : null
  }

  function clearStorage() {
    localStorage.removeItem('token')
    sessionStorage.removeItem('token')
    localStorage.removeItem('user')
    sessionStorage.removeItem('user')
  }

  return {
    token,
    setToStorage,
    getToken,
    getUser,
    clearStorage,
    isAuthenticated,
  }
}
