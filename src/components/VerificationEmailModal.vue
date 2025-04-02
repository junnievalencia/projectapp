<template>
  <q-dialog
    v-model="isOpen"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card class="verification-modal">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Email Verification Required</div>
        <q-space />
        <q-btn
          icon="close"
          flat
          round
          dense
          v-close-popup
          @click="closeModal"
        />
      </q-card-section>

      <q-card-section class="q-pt-md q-pb-md text-center">
        <q-icon name="mail" size="80px" color="primary" class="q-mb-md" />

        <div v-if="verificationSent">
          <p class="text-body1">A verification email has been sent to:</p>
          <p class="text-h6 text-primary q-mb-md">{{ email }}</p>
          <p class="text-body2 q-mb-md">
            Please check your inbox and click the verification link to activate
            your account. If you don't see the email, please check your spam
            folder.
          </p>
        </div>

        <div v-else>
          <p class="text-body1 q-mb-md">
            We need to verify your email address to activate your account.
          </p>
        </div>

        <div class="resend-section q-mt-md" v-if="showResendOption">
          <p class="text-body2">Didn't receive the email?</p>
          <q-btn
            outline
            color="primary"
            label="Resend Verification Email"
            class="q-mt-sm"
            :loading="resending"
            @click="resendVerification"
          />
          <p v-if="resendCooldown > 0" class="text-caption q-mt-xs">
            You can request another email in {{ resendCooldown }} seconds
          </p>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="bg-grey-1">
        <q-btn flat label="Go to Login" color="primary" @click="goToLogin" />
        <q-btn label="Close" color="primary" @click="closeModal" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import AuthService from "src/services/AuthService";

export default defineComponent({
  name: "VerificationEmailModal",

  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    email: {
      type: String,
      required: true,
    },
    verificationSent: {
      type: Boolean,
      default: false,
    },
  },

  emits: ["update:modelValue", "resend-verification"],

  setup(props, { emit }) {
    const $q = useQuasar();
    const router = useRouter();
    const isOpen = computed({
      get: () => props.modelValue,
      set: (value) => emit("update:modelValue", value),
    });

    const resending = ref(false);
    const showResendOption = ref(true);
    const resendCooldown = ref(0);
    let cooldownInterval = null;

    const startCooldown = () => {
      resendCooldown.value = 60; // 1 minute cooldown
      showResendOption.value = false;

      cooldownInterval = setInterval(() => {
        resendCooldown.value--;

        if (resendCooldown.value <= 0) {
          clearInterval(cooldownInterval);
          showResendOption.value = true;
        }
      }, 1000);
    };

    const resendVerification = async () => {
      try {
        resending.value = true;

        // Call the API to resend verification email
        const response = await AuthService.resendVerificationEmail(props.email);

        // Check if the request was successful
        if (response.data && response.data.success) {
          $q.notify({
            color: "positive",
            message:
              response.data.message ||
              "Verification email resent successfully!",
            icon: "email",
          });

          // Start cooldown timer
          startCooldown();

          // Emit event so parent can handle additional logic if needed
          emit("resend-verification", true);
        } else {
          throw new Error(
            response.data?.message || "Failed to resend verification email"
          );
        }
      } catch (error) {
        console.error("Failed to resend verification email:", error);

        $q.notify({
          color: "negative",
          message:
            error.response?.data?.message ||
            error.message ||
            "Failed to resend verification email",
          icon: "error",
        });

        emit("resend-verification", false);
      } finally {
        resending.value = false;
      }
    };

    const goToLogin = () => {
      isOpen.value = false;
      router.push("/login");
    };

    const closeModal = () => {
      isOpen.value = false;
    };

    // Clean up interval when component is unmounted
    watch(
      () => props.modelValue,
      (newVal) => {
        if (!newVal && cooldownInterval) {
          clearInterval(cooldownInterval);
        }
      }
    );

    return {
      isOpen,
      resending,
      showResendOption,
      resendCooldown,
      resendVerification,
      goToLogin,
      closeModal,
    };
  },
});
</script>

<style lang="scss" scoped>
.verification-modal {
  width: 100%;
  max-width: 450px;
  border-radius: 8px;

  .resend-section {
    padding: 16px;
    border: 1px dashed rgba(0, 0, 0, 0.12);
    border-radius: 8px;
    background-color: rgba(0, 0, 0, 0.02);
  }
}
</style>
