<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          <q-btn flat no-caps to="/main" class="text-white text-h6">
            BuFood
          </q-btn>
        </q-toolbar-title>

        <div class="q-gutter-sm">
          <q-btn
            flat
            round
            icon="shopping_cart"
            to="/cart"
            class="q-mr-sm"
            v-if="isAuthenticated"
          >
            <q-badge color="red" floating>{{ cartItemCount }}</q-badge>
          </q-btn>

          <template v-if="isAuthenticated">
            <q-btn-dropdown flat no-caps>
              <template v-slot:label>
                <div class="row items-center no-wrap">
                  <q-icon left name="account_circle" />
                  <div class="text-body1 q-ml-sm">
                    {{ userName || "My Account" }}
                  </div>
                </div>
              </template>

              <q-list>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Logged in as</q-item-label>
                    <q-item-label>{{ userEmail }}</q-item-label>
                    <q-item-label caption>Role: {{ userRole }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-separator />

                <q-item clickable v-close-popup to="/profile">
                  <q-item-section avatar>
                    <q-icon name="person" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Profile</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item clickable v-close-popup to="/orders">
                  <q-item-section avatar>
                    <q-icon name="receipt_long" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Orders</q-item-label>
                  </q-item-section>
                </q-item>

                <q-separator />

                <q-item clickable v-close-popup @click="logout">
                  <q-item-section avatar>
                    <q-icon name="logout" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Logout</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </template>

          <template v-else>
            <q-btn
              flat
              no-caps
              label="Login"
              to="/auth/login"
              class="q-mr-sm"
            />
            <q-btn outline no-caps label="Register" to="/auth/register" />
          </template>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header>BuFood Menu</q-item-label>

        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer bordered class="bg-white text-dark">
      <q-toolbar>
        <q-toolbar-title class="text-center text-caption">
          BuFood &copy; {{ new Date().getFullYear() }} - Food Delivery App
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from "vue";
import EssentialLink from "components/EssentialLink.vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import AuthService from "src/services/AuthService";
import CartService from "src/services/CartService";

const linksList = [
  {
    title: "Home",
    icon: "home",
    link: "/main",
  },
  {
    title: "Menu",
    icon: "restaurant_menu",
    link: "/",
  },
  {
    title: "Offers",
    icon: "local_offer",
    link: "/offers",
  },
  {
    title: "Cart",
    icon: "shopping_cart",
    link: "/cart",
  },
  {
    title: "About",
    icon: "info",
    link: "/about",
  },
  {
    title: "Contact",
    icon: "mail",
    link: "/contact",
  },
];

export default defineComponent({
  name: "MainLayout",

  components: {
    EssentialLink,
  },

  setup() {
    const leftDrawerOpen = ref(false);
    const router = useRouter();
    const $q = useQuasar();
    const cartItemCount = ref(0);

    const isAuthenticated = computed(() => {
      return AuthService.isAuthenticated();
    });

    const userData = computed(() => {
      return AuthService.getUserData() || {};
    });

    const userName = computed(() => {
      return userData.value ? userData.value.name : "";
    });

    const userEmail = computed(() => {
      return userData.value ? userData.value.email : "";
    });

    const userRole = computed(() => {
      return userData.value ? userData.value.role : "";
    });

    const fetchCartCount = async () => {
      if (isAuthenticated.value) {
        try {
          const response = await CartService.getUserCart();
          cartItemCount.value = response.data ? response.data.length : 0;
        } catch (error) {
          console.error("Error fetching cart count:", error);
        }
      }
    };

    const logout = () => {
      AuthService.clearToken();
      cartItemCount.value = 0;

      $q.notify({
        color: "positive",
        message: "You have been logged out successfully",
        icon: "check_circle",
      });

      router.push("/");
    };

    const toggleLeftDrawer = () => {
      leftDrawerOpen.value = !leftDrawerOpen.value;
    };

    onMounted(() => {
      fetchCartCount();
    });

    return {
      essentialLinks: linksList,
      leftDrawerOpen,
      toggleLeftDrawer,
      isAuthenticated,
      cartItemCount,
      userData,
      userName,
      userEmail,
      userRole,
      logout,
    };
  },
});
</script>
