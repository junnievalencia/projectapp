<template>
  <q-card-section>
    <div class="text-h6 q-mb-md">Reset Password</div>
    <p class="text-body2 text-grey-8 q-mb-md">
      Enter your email address and we'll send you a link to reset your password.
    </p>

    <q-form @submit="onSubmit" class="q-gutter-md">
      <q-input
        filled
        v-model="email"
        label="Email"
        type="email"
        :rules="[(val) => !!val || 'Email is required', isValidEmail]"
      >
        <template v-slot:prepend>
          <q-icon name="email" />
        </template>
      </q-input>

      <q-btn
        unelevated
        color="primary"
        size="lg"
        class="full-width"
        label="Send Reset Link"
        type="submit"
        :loading="loading"
      />
    </q-form>
  </q-card-section>

  <q-card-section class="text-center q-mt-sm">
    <div>
      Remember your password?
      <q-btn
        flat
        color="primary"
        label="Back to Login"
        no-caps
        @click="navigateTo('/auth/login')"
      />
    </div>
  </q-card-section>
</template>

<script>
import { defineComponent, ref } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";

export default defineComponent({
  name: "ForgotPasswordPage",

  setup() {
    const router = useRouter();
    const $q = useQuasar();

    const email = ref("");
    const loading = ref(false);

    const isValidEmail = (val) => {
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return emailPattern.test(val) || "Invalid email format";
    };

    const onSubmit = async () => {
      loading.value = true;
      try {
        // Mock password reset request
        await new Promise((resolve) => setTimeout(resolve, 1000));

        $q.notify({
          color: "positive",
          message: "Reset link sent! Please check your email.",
          icon: "check_circle",
        });

        // Optionally redirect back to login
        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
      } catch (error) {
        $q.notify({
          color: "negative",
          message:
            "Failed to send reset link: " + (error.message || "Unknown error"),
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
      loading,
      isValidEmail,
      onSubmit,
      navigateTo,
    };
  },
});
</script>
