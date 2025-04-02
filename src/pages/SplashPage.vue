<template>
  <q-page class="splash-page flex flex-center column">
    <div class="content-container text-center">
      <!-- Logo -->
      <div class="logo-container q-mb-lg">
        <img
          src="~assets/bufood-logo.svg"
          alt="BuFood Logo"
          style="max-width: 200px; height: auto"
        />
      </div>

      <!-- Welcome Text -->
      <h2 class="text-weight-bold q-mb-xl">Welcome to BuFood</h2>

      <!-- Get Started Button -->
      <q-btn
        label="Get Started"
        color="orange"
        class="get-started-btn"
        size="large"
        unelevated
        rounded
        @click="navigateToLogin"
      />
    </div>
  </q-page>
</template>

<script>
import { defineComponent, onMounted } from "vue";
import { useRouter } from "vue-router";
import AuthService from "src/services/AuthService";

export default defineComponent({
  name: "SplashPage",

  setup() {
    const router = useRouter();

    const navigateToLogin = () => {
      router.push("/auth/login");
    };

    const checkAuthAndRedirect = () => {
      // Check if user is already authenticated
      if (AuthService.isAuthenticated()) {
        const userRole = AuthService.getUserRole();
        if (userRole === "seller") {
          router.push("/seller/dashboard");
        } else if (userRole === "customer") {
          router.push("/customer/home");
        } else {
          // If role is not recognized, go to login
          router.push("/auth/login");
        }
      }
    };

    onMounted(() => {
      checkAuthAndRedirect();
    });

    return {
      navigateToLogin,
    };
  },
});
</script>

<style lang="scss" scoped>
.splash-page {
  background-color: white;
  min-height: 100vh;

  .content-container {
    max-width: 300px;
    padding: 20px;
  }

  .logo-container {
    margin-bottom: 40px;
  }

  h2 {
    color: #333;
    font-size: 2rem;
  }

  .get-started-btn {
    min-width: 200px;
    font-weight: bold;
    font-size: 1.1rem;
    padding: 12px 0;
    transition: transform 0.2s ease;

    &:hover {
      transform: translateY(-3px);
    }
  }
}

@media (max-width: 599px) {
  .splash-page {
    .content-container {
      padding: 20px;
    }

    h2 {
      font-size: 1.5rem;
    }
  }
}
</style>
