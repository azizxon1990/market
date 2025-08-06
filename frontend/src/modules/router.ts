import type { RouteLocationNormalized } from 'vue-router'
import type { UserModule } from '~/types'

export const install: UserModule = ({ router }) => {
  const tokenStore = useTokenStore()

  router.beforeEach(async (to: RouteLocationNormalized, _from: RouteLocationNormalized, next) => {
    if (to.meta.published) {
      if (tokenStore.token && to.path !== '/') {
        next('/')
      }
      else {
        next()
      }
    }
    else {
      if (tokenStore.token) {
        next()
      }
      else if (to.path !== '/login') {
        next('/login')
      }
      else {
        next()
      }
    }
  })
}
