<template>
  <q-page class="flex flex-center">
    <div class="verification-container q-pa-md text-center">
      <q-icon name="email" size="4rem" color="orange" class="q-mb-lg" />

      <div class="text-h6 q-mb-md">Verify Your Email</div>
      <p class="text-body2 text-grey-8 q-mb-lg">
        We've sent a verification link to your email. Please check your inbox
        and click the link to verify your account.
      </p>

      <div v-if="!emailResent">
        <div class="row justify-center q-mb-md">
          <q-input
            v-model="email"
            label="Your Email Address"
            outlined
            class="col-12"
            :rules="[(val) => !!val || 'Email is required', isValidEmail]"
          >
            <template v-slot:prepend>
              <q-icon name="email" color="grey-7" />
            </template>
          </q-input>
        </div>
        <p class="text-body2 q-mb-md">
          Didn't receive the email? Check your spam folder or
        </p>
        <q-btn
          unelevated
          color="orange"
          class="q-py-sm"
          label="Resend Verification Email"
          @click="resendEmail"
          :loading="loading"
          :disable="!email || !isValidEmail(email)"
          rounded
        />
      </div>
      <div v-else class="text-positive q-pa-md">
        <q-icon name="check_circle" size="1.5rem" class="q-mr-xs" />
        <span class="text-body1">Verification email resent successfully!</span>
      </div>

      <q-separator class="q-my-lg" />

      <q-btn
        flat
        padding="none"
        color="orange"
        label="Back to Login"
        no-caps
        @click="navigateTo('/auth/login')"
        class="q-mt-md"
      />
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import AuthService from "src/services/AuthService";

export default defineComponent({
  name: "VerifyEmailPage",

  setup() {
    const router = useRouter();
    const $q = useQuasar();

    const loading = ref(false);
    const emailResent = ref(false);
    const email = ref("");

    // Get email from localStorage if available
    onMounted(() => {
      const savedEmail = localStorage.getItem("pendingVerificationEmail");
      if (savedEmail) {
        email.value = savedEmail;
      }
    });

    const isValidEmail = (val) => {
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return emailPattern.test(val) || "Invalid email format";
    };

    const resendEmail = async () => {
      // Validate email first
      if (!email.value || !isValidEmail(email.value)) {
        $q.notify({
          color: "negative",
          message: "Please enter a valid email address",
          icon: "error",
        });
        return;
      }

      loading.value = true;
      try {
        // Call the actual API endpoint to resend verification email
        const response = await AuthService.resendVerificationEmail(email.value);

        if (response.data.success) {
          emailResent.value = true;

          $q.notify({
            color: "positive",
            message:
              response.data.message ||
              "Verification email resent successfully!",
            icon: "check_circle",
          });
        } else {
          throw new Error(response.data.message || "Unknown error occurred");
        }
      } catch (error) {
        $q.notify({
          color: "negative",
          message:
            "Failed to resend verification email: " +
            (error.message || "Unknown error"),
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
      emailResent,
      resendEmail,
      navigateTo,
      isValidEmail,
    };
  },
});
</script>

<style lang="scss" scoped>
.verification-container {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 8px;
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
}
</style>
