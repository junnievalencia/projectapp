<template>
  <q-page class="flex flex-center">
    <div class="verification-success-container q-pa-md text-center">
      <q-icon
        name="check_circle"
        size="4rem"
        color="positive"
        class="q-mb-lg"
      />

      <div class="text-h6 q-mb-md">Email Verified Successfully!</div>
      <p class="text-body2 text-grey-8 q-mb-lg">
        Your email has been successfully verified. You can now log in to your
        account.
      </p>

      <div class="row q-col-gutter-md">
        <div class="col-12">
          <q-btn
            unelevated
            color="orange"
            class="q-py-sm full-width"
            label="Log In"
            @click="navigateTo('/auth/login')"
            rounded
          />
        </div>

        <div class="col-12 q-mt-md" v-if="userRole">
          <div class="text-caption q-mb-sm">or go directly to:</div>
          <q-btn
            outline
            color="primary"
            class="q-py-sm full-width"
            :label="
              userRole === 'seller' ? 'Seller Dashboard' : 'Customer Home'
            "
            @click="navigateToRolePage"
            rounded
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import AuthService from "src/services/AuthService";

export default defineComponent({
  name: "VerificationSuccessPage",

  setup() {
    const router = useRouter();
    const userRole = ref(null);

    onMounted(() => {
      // Get stored role from localStorage
      userRole.value = localStorage.getItem("pendingUserRole");
    });

    const navigateTo = (path) => {
      router.push(path);
    };

    const navigateToRolePage = () => {
      if (userRole.value === "seller") {
        router.push("/seller/dashboard");
      } else {
        router.push("/customer/home");
      }
    };

    return {
      userRole,
      navigateTo,
      navigateToRolePage,
    };
  },
});
</script>

<style lang="scss" scoped>
.verification-success-container {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 8px;
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
}
</style>
