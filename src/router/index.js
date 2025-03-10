import { route } from 'quasar/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'
// Import the authentication service
import { authService } from '../services'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  // Add authentication guard
  Router.beforeEach((to, from, next) => {
    // List of routes that don't require authentication
    const publicPages = ['/', '/login', '/register']
    const authRequired = !publicPages.includes(to.path)

    // Check if user is authenticated with a valid token
    const isAuthenticated = authService.isAuthenticated()

    if (authRequired && !isAuthenticated) {
      // If authentication is required but user is not authenticated, redirect to login
      // Save the intended destination for redirect after login
      return next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    }

    // If going to login/register page but already authenticated, redirect to home
    if ((to.path === '/login' || to.path === '/register') && isAuthenticated) {
      return next('/')
    }

    // Continue to the requested page
    next()
  })

  return Router
})
