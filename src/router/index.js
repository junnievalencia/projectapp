import { route } from "quasar/wrappers";
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from "vue-router";
import routes from "./routes";
import AuthService from "src/services/AuthService";

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
    : process.env.VUE_ROUTER_MODE === "history"
    ? createWebHistory
    : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  // Navigation guards for authentication and role-based routing
  Router.beforeEach(async (to, from, next) => {
    // Check if route requires authentication
    if (to.matched.some((record) => record.meta.requiresAuth)) {
      // Check if user is authenticated
      if (!AuthService.isAuthenticated()) {
        // Redirect to login if not authenticated
        next({ path: "/auth/login" });
        return;
      }

      // Validate token to ensure it's not expired
      const isTokenValid = await AuthService.validateToken();
      if (!isTokenValid) {
        // If token is invalid, clear token and redirect to login
        AuthService.clearToken();
        next({ path: "/auth/login" });
        return;
      }

      // Check if route requires a specific role
      const userRole = AuthService.getUserRole();

      if (
        to.matched.some(
          (record) => record.meta.role && record.meta.role !== userRole
        )
      ) {
        // If user doesn't have the required role, redirect to appropriate dashboard
        if (userRole === "seller") {
          next({ path: "/seller/dashboard" });
        } else if (userRole === "customer") {
          next({ path: "/customer/home" });
        } else {
          // If role is not recognized, go to login
          AuthService.clearToken(); // Clear invalid user data
          next({ path: "/auth/login" });
        }
      } else {
        // User is authenticated and has the correct role
        next();
      }
    } else {
      // Route doesn't require authentication

      // If user is already authenticated and tries to access auth pages, redirect to dashboard
      if (
        to.path.startsWith("/auth") &&
        to.path !== "/auth/logout" &&
        AuthService.isAuthenticated()
      ) {
        const userRole = AuthService.getUserRole();
        if (userRole === "seller") {
          next({ path: "/seller/dashboard" });
        } else if (userRole === "customer") {
          next({ path: "/customer/home" });
        } else {
          next();
        }
      } else {
        next();
      }
    }
  });

  return Router;
});
