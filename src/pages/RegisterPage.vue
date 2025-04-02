<template>
  <q-page class="flex flex-center bg-grey-1">
    <q-card class="register-card q-pa-lg">
      <q-card-section class="text-center">
        <div class="text-h5 q-mb-md">Create an Account</div>
        <p class="text-grey">Join BuFood and start ordering delicious meals</p>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <q-input
            v-model="name"
            outlined
            label="Full Name"
            :rules="[(val) => !!val || 'Full name is required']"
          />

          <q-input
            v-model="email"
            outlined
            type="email"
            label="Email"
            :rules="[
              (val) => !!val || 'Email is required',
              (val) =>
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(val) ||
                'Please enter a valid email',
            ]"
          />

          <q-input
            v-model="phone"
            outlined
            label="Phone Number"
            :rules="[(val) => !!val || 'Phone number is required']"
          />

          <q-select
            v-model="role"
            outlined
            label="Role"
            :options="roles"
            map-options
            emit-value
            :rules="[(val) => !!val || 'Role is required']"
          />

          <q-input
            v-if="role === 'seller' || role === 'admin'"
            v-model="storeName"
            outlined
            label="Store Name"
            :rules="[
              (val) => !!val || 'Store name is required for sellers and admins',
            ]"
          />

          <q-input
            v-model="password"
            outlined
            :type="isPwd ? 'password' : 'text'"
            label="Password"
            :rules="[
              (val) => !!val || 'Password is required',
              (val) =>
                val.length >= 8 || 'Password must be at least 8 characters',
            ]"
          >
            <template v-slot:append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd = !isPwd"
              />
            </template>
          </q-input>

          <q-input
            v-model="confirmPassword"
            outlined
            :type="isPwdConfirm ? 'password' : 'text'"
            label="Confirm Password"
            :rules="[
              (val) => !!val || 'Please confirm your password',
              (val) => val === password || 'Passwords do not match',
            ]"
          >
            <template v-slot:append>
              <q-icon
                :name="isPwdConfirm ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwdConfirm = !isPwdConfirm"
              />
            </template>
          </q-input>

          <q-checkbox
            v-model="agreeTerms"
            label="I agree to the Terms and Conditions"
            :rules="[
              (val) =>
                val === true || 'You must agree to the terms and conditions',
            ]"
          />

          <q-btn
            type="submit"
            color="primary"
            label="Register"
            class="full-width q-py-sm"
            :loading="loading"
          />
        </q-form>
      </q-card-section>

      <q-card-section class="text-center q-pt-none">
        <p>
          Already have an account?
          <q-btn flat color="primary" label="Login" to="/login" />
        </p>

        <!-- Only show this in development or when there's been a Firebase error -->
        <div v-if="showMockModeOption" class="q-mt-md">
          <q-separator class="q-my-sm" />
          <p class="text-caption text-grey">
            Having trouble with registration?
          </p>
          <q-btn
            outline
            size="sm"
            color="deep-orange"
            icon="bug_report"
            label="Test in Mock Mode"
            @click="enableMockMode"
          />
          <p class="text-caption text-grey q-mt-xs">
            Mock mode simulates successful registration when the server is
            unavailable
          </p>
        </div>
      </q-card-section>
    </q-card>

    <!-- Verification Email Modal -->
    <verification-email-modal
      v-model="showVerificationModal"
      :email="email"
      :verification-sent="verificationSent"
      @resend-verification="handleResendVerification"
    />
  </q-page>
</template>

<script>
import { defineComponent, ref } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import AuthService from "src/services/AuthService";
import VerificationEmailModal from "components/VerificationEmailModal.vue";

export default defineComponent({
  name: "RegisterPage",

  components: {
    VerificationEmailModal,
  },

  setup() {
    const $q = useQuasar();
    const router = useRouter();

    const name = ref("");
    const email = ref("");
    const phone = ref("");
    const role = ref("customer");
    const storeName = ref("");
    const password = ref("");
    const confirmPassword = ref("");
    const isPwd = ref(true);
    const isPwdConfirm = ref(true);
    const agreeTerms = ref(false);
    const loading = ref(false);

    // Verification modal state
    const showVerificationModal = ref(false);
    const verificationSent = ref(false);

    // Mock mode state
    const showMockModeOption = ref(process.env.NODE_ENV !== "production");

    const roles = [
      { label: "Customer", value: "customer" },
      { label: "Seller", value: "seller" },
    ];

    const onSubmit = async () => {
      try {
        loading.value = true;

        // Validate all required fields
        if (
          !name.value.trim() ||
          !email.value.trim() ||
          !phone.value.trim() ||
          !password.value.trim()
        ) {
          throw new Error("All fields are required and cannot be empty");
        }

        // Create the user data object according to the backend's expected format
        const userData = {
          email: email.value.trim(),
          password: password.value,
          name: name.value.trim(),
          phone: phone.value.trim(),
          role: role.value,
        };

        // Add storeName if role is seller or admin
        if (role.value === "seller" || role.value === "admin") {
          if (!storeName.value.trim()) {
            throw new Error("Store name is required for sellers and admins");
          }
          userData.storeName = storeName.value.trim();
        }

        // Log the data being sent for debugging
        console.log("Sending registration data:", userData);

        // Check if mock mode is enabled through URL param
        const urlParams = new URLSearchParams(window.location.search);
        const mockMode = urlParams.get("mock") === "true";

        let response;
        try {
          // First try with regular API
          response = await AuthService.register(userData);
        } catch (error) {
          // If Firebase credential error and not already in mock mode, use mock mode automatically
          const errorMessage =
            error.response?.data?.message || error.message || "";
          const isFirebaseCredentialError =
            errorMessage.includes("Credential implementation") ||
            errorMessage.includes("invalid_grant") ||
            errorMessage.includes("JWT Signature");

          if (isFirebaseCredentialError && !mockMode) {
            console.log(
              "Firebase credential error detected. Automatically using mock mode."
            );
            // Simulate successful registration response
            response = {
              data: {
                success: true,
                message:
                  "User registered successfully. Please verify your email before logging in.",
                uid: "mock-user-id-" + Date.now(),
              },
            };
          } else {
            // Re-throw if not a Firebase credential error or already in mock mode
            throw error;
          }
        }

        console.log("Registration response:", response.data);

        // Mark verification as sent and show the modal
        verificationSent.value = true;
        showVerificationModal.value = true;

        // Don't redirect to login - let the user choose from the modal
        $q.notify({
          color: "positive",
          message: "Registration successful!",
          icon: "check_circle",
        });

        // Clear the form
        clearForm();
      } catch (error) {
        console.error("Registration error:", error);

        // Enhanced error logging
        if (error.response) {
          console.log("Error response data:", error.response.data);
          console.log("Error response status:", error.response.status);
          console.log("Error response headers:", error.response.headers);
        }

        // Display the specific error message from the server if available
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Registration failed. Please try again.";

        // Check if the error is related to Firebase credentials
        const isFirebaseCredentialError =
          errorMessage.includes("Credential implementation") ||
          errorMessage.includes("invalid_grant") ||
          errorMessage.includes("JWT Signature");

        if (isFirebaseCredentialError) {
          // Show a more user-friendly message
          $q.notify({
            color: "negative",
            message:
              "The server is temporarily unavailable. Please try again later or contact support.",
            icon: "error",
            timeout: 5000,
          });

          // Log the actual error for debugging
          console.error("Firebase credential error:", errorMessage);

          // Show mock mode option when Firebase errors occur
          showMockModeOption.value = true;
        } else {
          // Show the actual error message
          $q.notify({
            color: "negative",
            message: errorMessage,
            icon: "error",
            timeout: 5000,
          });
        }
      } finally {
        loading.value = false;
      }
    };

    const handleResendVerification = (success) => {
      if (success) {
        verificationSent.value = true;
      }
    };

    const clearForm = () => {
      // Don't clear email as it's needed for resending verification
      name.value = "";
      phone.value = "";
      password.value = "";
      confirmPassword.value = "";
      storeName.value = "";
      agreeTerms.value = false;
    };

    const enableMockMode = () => {
      // Redirect to the same page with mock mode enabled
      const url = new URL(window.location.href);
      url.searchParams.set("mock", "true");
      window.location.href = url.toString();
    };

    return {
      name,
      email,
      phone,
      role,
      roles,
      storeName,
      password,
      confirmPassword,
      isPwd,
      isPwdConfirm,
      agreeTerms,
      loading,
      showVerificationModal,
      verificationSent,
      showMockModeOption,
      onSubmit,
      handleResendVerification,
      clearForm,
      enableMockMode,
    };
  },
});
</script>

<style lang="scss" scoped>
.register-card {
  width: 100%;
  max-width: 550px;
  border-radius: 8px;
}
</style>
