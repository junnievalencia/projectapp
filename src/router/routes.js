const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/SplashPage.vue') },
      { path: 'login', component: () => import('pages/LoginPage.vue') },
      { path: 'home', component: () => import('pages/HomePage.vue') },
      { path: 'dashboard', component: () => import('pages/IndexPage.vue') },
      { path: 'profile', component: () => import('pages/ProfilePage.vue') },
      { path: 'cart', component: () => import('pages/CartPage.vue') },
      { path: 'favorites', component: () => import('pages/FavoritesPage.vue') },
      { path: 'item/:id', component: () => import('pages/ItemDetailPage.vue') },
      { path: 'stores', component: () => import('pages/StorePage.vue') },
      { path: 'store/:id', component: () => import('pages/StoreDetailPage.vue') },
      { path: 'checkout', component: () => import('pages/CheckoutPage.vue') },
      { path: 'order-success', component: () => import('pages/OrderSuccessPage.vue') },
      { path: 'track-order/:id', component: () => import('pages/TrackOrderPage.vue') },
      { path: 'history', component: () => import('pages/HistoryPage.vue') }
    ]
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/HomePage.vue')
  },
  {
    path: '/register',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/RegisterPage.vue') }
    ]
  }
]

export default routes
