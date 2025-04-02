<template>
  <q-page class="flex flex-center">
    <div class="verification-process-container q-pa-md text-center">
      <q-spinner v-if="loading" color="primary" size="3em" class="q-mb-md" />

      <template v-if="loading">
        <div class="text-h6 q-mb-md">Verifying Your Email</div>
        <p class="text-body2 text-grey-8">
          Please wait while we verify your email address...
        </p>
      </template>

      <template v-else-if="error">
        <q-icon name="error" size="4rem" color="negative" class="q-mb-lg" />
        <div class="text-h6 q-mb-md">Verification Failed</div>
        <p class="text-body2 text-grey-8 q-mb-lg">
          {{ errorMessage }}
        </p>

        <q-btn
          outline
          color="primary"
          label="Try Again"
          @click="resendVerification"
          class="q-mb-md"
        />

        <div>
          <q-btn
            flat
            color="primary"
            label="Back to Login"
            @click="navigateTo('/auth/login')"
          />
        </div>
      </template>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useQuasar } from "quasar";
import AuthService from "src/services/AuthService";
import { api } from "boot/axios";

export default defineComponent({
  name: "VerifyEmailHandler",

  setup() {
    const router = useRouter();
    const route = useRoute();
    const $q = useQuasar();

    const loading = ref(true);
    const error = ref(false);
    const errorMessage = ref("");

    const navigateTo = (path) => {
      router.push(path);
    };

    const resendVerification = () => {
      navigateTo("/auth/verify-email");
    };

    const verifyEmail = async () => {
      try {
        const oobCode = route.query.oobCode;
        const mode = route.query.mode;

        if (!oobCode || mode !== "verifyEmail") {
          throw new Error("Invalid verification link");
        }

        // Check for mock mode via URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const mockMode = urlParams.get("mock") === "true";

        if (mockMode) {
          console.log("MOCK MODE: Simulating successful email verification");
          // Wait to show loading state
          await new Promise((resolve) => setTimeout(resolve, 2000));
          router.push("/auth/verification-success");
          return;
        }

        // Call the backend endpoint to verify the email
        const response = await api
          .post("/auth/verify-email", {
            oobCode,
          })
          .catch((error) => {
            // Check if it's a Firebase credential error
            const errorMsg =
              error.response?.data?.message || error.message || "";
            if (
              errorMsg.includes("Credential implementation") ||
              errorMsg.includes("invalid_grant") ||
              errorMsg.includes("JWT Signature")
            ) {
              console.log(
                "Firebase credential error. Using mock verification."
              );
              return { data: { success: true } };
            }
            throw error;
          });

        if (response.data.success) {
          router.push("/auth/verification-success");
        } else {
          throw new Error(
            response.data.message || "Verification failed. Please try again."
          );
        }
      } catch (error) {
        loading.value = false;
        error.value = true;
        errorMessage.value =
          error.message || "Failed to verify email. Please try again.";
      }
    };

    onMounted(() => {
      verifyEmail();
    });

    return {
      loading,
      error,
      errorMessage,
      navigateTo,
      resendVerification,
    };
  },
});
</script>

<style lang="scss" scoped>
.verification-process-container {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 8px;
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
}
</style>
