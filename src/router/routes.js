const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/SplashPage.vue') }
    ]
  },
  {
    path: '/login',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/LoginPage.vue') }
    ]
  },
  {
    path: '/register',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/RegisterPage.vue') }
    ]
  },
  {
    path: '/dashboard',
    component: () => import('layouts/DashboardLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { 
        path: '', 
        component: () => import('pages/DashboardPage.vue'),
        name: 'dashboard'
      },
      { 
        path: '/food-items', 
        component: () => import('pages/FoodItemsPage.vue'),
        name: 'food-items'
      },
      { 
        path: '/food-categories', 
        component: () => import('pages/FoodCategoriesPage.vue'),
        name: 'food-categories'
      },
      { 
        path: '/pending-orders', 
        component: () => import('pages/pending-orders/PendingOrdersPage.vue'),
        name: 'pending-orders'
      },
      { 
        path: '/dispatch-orders', 
        component: () => import('pages/dispatch-orders/DispatchOrdersPage.vue'),
        name: 'dispatch-orders'
      },
      { 
        path: '/add-menu', 
        component: () => import('pages/add-menu/AddMenuPage.vue'),
        name: 'add-menu'
      },
      { 
        path: '/view-items', 
        component: () => import('pages/view-items/ViewItemsPage.vue'),
        name: 'view-items'
      },
      { 
        path: '/vendors', 
        component: () => import('pages/IndexPage.vue'),
        name: 'vendors'
      },
      { 
        path: '/vendor-categories', 
        component: () => import('pages/IndexPage.vue'),
        name: 'vendor-categories'
      },
      { 
        path: '/orders', 
        component: () => import('pages/IndexPage.vue'),
        name: 'orders'
      },
      { 
        path: '/users', 
        component: () => import('pages/IndexPage.vue'),
        name: 'users'
      },
      { 
        path: '/settings', 
        component: () => import('pages/IndexPage.vue'),
        name: 'settings'
      },
      { 
        path: '/profile', 
        component: () => import('pages/ProfilePage.vue'),
        name: 'profile'
      }
    ]
  },
  {
    path: '/sample-data',
    component: () => import('layouts/DashboardLayout.vue'),
    children: [
      {
        path: '',
        name: 'SampleData',
        component: () => import('pages/sample-data/SampleDataPage.vue'),
        meta: {
          requiresAuth: true,
          title: 'Sample Data'
        }
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
