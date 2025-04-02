const routes = [
  // Splash page (entry point)
  {
    path: "/",
    component: () => import("layouts/SplashLayout.vue"),
    children: [{ path: "", component: () => import("pages/SplashPage.vue") }],
  },

  // Auth routes
  {
    path: "/auth",
    component: () => import("layouts/AuthLayout.vue"),
    children: [
      { path: "login", component: () => import("pages/auth/LoginPage.vue") },
      {
        path: "register",
        component: () => import("pages/auth/RegisterPage.vue"),
      },
      {
        path: "forgot-password",
        component: () => import("pages/auth/ForgotPasswordPage.vue"),
      },
      {
        path: "verify-email",
        component: () => import("pages/auth/VerifyEmailPage.vue"),
      },
      {
        path: "verification-success",
        component: () => import("pages/auth/VerificationSuccessPage.vue"),
      },
      {
        path: "action",
        component: () => import("pages/auth/VerifyEmailHandler.vue"),
      },
    ],
  },

  // Customer routes
  {
    path: "/customer",
    component: () => import("layouts/UserHomepageLayout.vue"),
    meta: { requiresAuth: true, role: "customer" },
    children: [
      { path: "home", component: () => import("pages/customer/HomePage.vue") },
      {
        path: "stores",
        component: () => import("pages/customer/StoresPage.vue"),
      },
      {
        path: "store/:id",
        component: () => import("pages/customer/StorePage.vue"),
      },
      { path: "cart", component: () => import("pages/customer/CartPage.vue") },
      {
        path: "orders",
        component: () => import("pages/customer/OrderPage.vue"),
      },
      {
        path: "favorites",
        component: () => import("pages/customer/FavoritePage.vue"),
      },
      {
        path: "profile",
        component: () => import("pages/customer/ProfilePage.vue"),
      },
    ],
  },

  // Seller routes
  {
    path: "/seller",
    component: () => import("layouts/SellerDashboardLayout.vue"),
    meta: { requiresAuth: true, role: "seller" },
    children: [
      {
        path: "dashboard",
        component: () => import("pages/seller/DashboardPage.vue"),
      },
      {
        path: "pending-orders",
        component: () => import("pages/seller/PendingOrderPage.vue"),
      },
      {
        path: "dispatch-orders",
        component: () => import("pages/seller/DispatchOrderPage.vue"),
      },
      {
        path: "add-menu",
        component: () => import("pages/seller/AddMenuPage.vue"),
      },
      {
        path: "view-items",
        component: () => import("pages/seller/ViewAllItemsPage.vue"),
      },
      {
        path: "profile",
        component: () => import("pages/seller/ProfilePage.vue"),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
