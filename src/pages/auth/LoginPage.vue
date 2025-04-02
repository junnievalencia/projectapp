<template>
  <q-page class="login-page flex flex-center">
    <div class="login-container q-pa-md">
      <!-- Logo -->
      <div class="text-center q-mb-lg">
        <img src="~assets/bufood-logo.svg" style="width: 50px; height: 50px" />
      </div>

      <!-- Login Title -->
      <div class="text-center q-mb-xl">
        <div class="text-h4 text-weight-bold">LOG IN</div>
      </div>

      <q-form @submit="onSubmit" class="q-gutter-y-md">
        <!-- Email/Phone Field -->
        <q-input
          outlined
          v-model="email"
          type="text"
          label="Email or Phone Number"
          class="input-field"
          :rules="[(val) => !!val || 'Email is required']"
        >
          <template v-slot:prepend>
            <q-icon name="email" color="grey-7" />
          </template>
        </q-input>

        <!-- Password Field -->
        <q-input
          outlined
          v-model="password"
          :type="isPwd ? 'password' : 'text'"
          label="Password"
          class="input-field"
          :rules="[(val) => !!val || 'Password is required']"
        >
          <template v-slot:prepend>
            <q-icon name="lock" color="grey-7" />
          </template>
          <template v-slot:append>
            <q-icon
              :name="isPwd ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="isPwd = !isPwd"
            />
          </template>
        </q-input>

        <div class="row items-center justify-between q-mt-sm">
          <q-checkbox
            v-model="rememberMe"
            label="Remember me"
            dense
            color="orange"
          />
          <q-btn
            flat
            no-caps
            padding="none"
            color="orange"
            label="Forgot Password?"
            @click="navigateTo('/auth/forgot-password')"
            class="text-caption"
          />
        </div>

        <q-btn
          unelevated
          color="orange"
          class="full-width q-py-sm q-mt-lg"
          label="Log In"
          type="submit"
          :loading="loading"
          rounded
        />
      </q-form>

      <div class="text-center q-mt-xl">
        <span class="text-caption text-grey-8">Don't Have Account?</span>
        <q-btn
          flat
          no-caps
          padding="none"
          color="orange"
          label="Sign Up"
          @click="navigateTo('/auth/register')"
          class="text-caption q-ml-xs"
        />
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import AuthService from "../../services/AuthService";

export default defineComponent({
  name: "LoginPage",

  setup() {
    const router = useRouter();
    const $q = useQuasar();

    const email = ref("");
    const password = ref("");
    const isPwd = ref(true);
    const rememberMe = ref(false);
    const loading = ref(false);

    const onSubmit = async () => {
      loading.value = true;
      try {
        // Prepare login credentials
        const credentials = {
          email: email.value,
          password: password.value,
        };

        console.log("Attempting login with:", credentials.email);

        // Call the actual login API
        const response = await AuthService.login(credentials);
        console.log("Login response:", response.data);

        if (response.data.success) {
          // Save token and user data
          AuthService.saveToken(response.data.idToken, response.data.user);

          // Log the user role for debugging
          const userRole = response.data.user.role;
          console.log("User authenticated with role:", userRole);

          $q.notify({
            color: "positive",
            message: response.data.message || "Login successful!",
            icon: "check_circle",
          });

          // Add a small delay before navigation to ensure data is saved
          setTimeout(() => {
            // Navigate based on user role with a more direct approach
            if (userRole === "seller") {
              console.log("Navigating to seller dashboard...");
              window.location.href = "/#/seller/dashboard";
            } else if (userRole === "customer") {
              console.log("Navigating to customer home...");
              window.location.href = "/#/customer/home";
            } else {
              // If role is not recognized, stay on login page
              console.error("Unknown user role:", userRole);
              throw new Error("Unknown user role: " + userRole);
            }
          }, 500);
        } else {
          throw new Error(response.data.message || "Login failed");
        }
      } catch (error) {
        console.error("Login error:", error);
        $q.notify({
          color: "negative",
          message:
            "Login failed: " +
            (error.response?.data?.message || error.message || "Unknown error"),
          icon: "error",
        });
      } finally {
        loading.value = false;
      }
    };

    const navigateTo = (path) => {
      router.push(path);
    };

    return {
      email,
      password,
      isPwd,
      rememberMe,
      loading,
      onSubmit,
      navigateTo,
    };
  },
});
</script>

<style lang="scss" scoped>
.login-page {
  background-color: #fff;
  min-height: 100vh;
}

.login-container {
  width: 100%;
  max-width: 360px;
  padding: 0 20px;
}

.input-field {
  .q-field__control {
    height: 56px;
    border-radius: 8px;
  }
}
</style>
