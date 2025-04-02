<template>
  <q-page class="register-page flex flex-center">
    <div class="register-container q-pa-md">
      <!-- Logo -->
      <div class="text-center q-mb-lg">
        <img src="~assets/bufood-logo.svg" style="width: 50px; height: 50px" />
      </div>

      <!-- Register Title -->
      <div class="text-center q-mb-xl">
        <div class="text-h4 text-weight-bold">SIGN UP</div>
      </div>

      <q-form @submit="onSubmit" class="q-gutter-y-md">
        <!-- Full Name -->
        <q-input
          outlined
          v-model="fullName"
          label="Full Name"
          class="input-field"
          :rules="[(val) => !!val || 'Full name is required']"
        >
          <template v-slot:prepend>
            <q-icon name="person" color="grey-7" />
          </template>
        </q-input>

        <!-- Email -->
        <q-input
          outlined
          v-model="email"
          type="email"
          label="Email"
          class="input-field"
          :rules="[(val) => !!val || 'Email is required', isValidEmail]"
        >
          <template v-slot:prepend>
            <q-icon name="email" color="grey-7" />
          </template>
        </q-input>

        <!-- Password -->
        <q-input
          outlined
          v-model="password"
          :type="isPwd ? 'password' : 'text'"
          label="Password"
          class="input-field"
          :rules="[
            (val) => !!val || 'Password is required',
            (val) =>
              val.length >= 8 || 'Password must be at least 8 characters',
          ]"
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

        <!-- Phone Number -->
        <q-input
          outlined
          v-model="phoneNumber"
          label="Phone Number"
          class="input-field"
          :rules="[(val) => !!val || 'Phone number is required']"
        >
          <template v-slot:prepend>
            <q-icon name="phone" color="grey-7" />
          </template>
        </q-input>

        <!-- Role Selection -->
        <q-select
          outlined
          v-model="role"
          :options="roleOptions"
          label="Role"
          class="input-field q-mb-md"
          emit-value
          map-options
          dropdown-icon="arrow_drop_down"
          :rules="[(val) => !!val || 'Please select a role']"
        >
          <template v-slot:prepend>
            <q-icon name="badge" color="grey-7" />
          </template>
        </q-select>

        <!-- Terms Checkbox -->
        <div class="q-mt-sm">
          <q-checkbox
            v-model="agreeTerms"
            label="I agree to the Terms of Service and Privacy Policy"
            dense
            color="orange"
            :rules="[(val) => val === true || 'You must agree to the terms']"
          />
        </div>

        <!-- Submit Button -->
        <q-btn
          unelevated
          color="orange"
          class="full-width q-py-sm q-mt-lg"
          label="Create Account"
          type="submit"
          :loading="loading"
          rounded
        />
      </q-form>

      <div class="text-center q-mt-xl">
        <span class="text-caption text-grey-8">Already have an account?</span>
        <q-btn
          flat
          no-caps
          padding="none"
          color="orange"
          label="Sign In"
          @click="navigateTo('/auth/login')"
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
import AuthService from "src/services/AuthService";

export default defineComponent({
  name: "RegisterPage",

  setup() {
    const router = useRouter();
    const $q = useQuasar();

    const fullName = ref("");
    const email = ref("");
    const password = ref("");
    const phoneNumber = ref("");
    const role = ref(null);
    const isPwd = ref(true);
    const agreeTerms = ref(false);
    const loading = ref(false);

    const roleOptions = [
      { label: "Customer", value: "customer" },
      { label: "Seller", value: "seller" },
    ];

    const isValidEmail = (val) => {
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return emailPattern.test(val) || "Invalid email format";
    };

    const onSubmit = async () => {
      loading.value = true;
      try {
        // Prepare user data
        const userData = {
          email: email.value,
          password: password.value,
          name: fullName.value,
          phone: phoneNumber.value,
          role: role.value,
        };

        // If role is seller, add storeName (can be updated later)
        if (role.value === "seller") {
          userData.storeName = `${fullName.value}'s Store`;
        }

        // Call the actual registration API
        const response = await AuthService.register(userData);

        if (response.data.success) {
          $q.notify({
            color: "positive",
            message:
              response.data.message ||
              "Registration successful! Please verify your email.",
            icon: "check_circle",
          });

          // Save email in localStorage for verification page
          localStorage.setItem("pendingVerificationEmail", email.value);

          // Also save the role for proper redirection after verification
          localStorage.setItem("pendingUserRole", role.value);

          // Redirect to verification page
          router.push("/auth/verify-email");
        } else {
          throw new Error(response.data.message || "Registration failed");
        }
      } catch (error) {
        $q.notify({
          color: "negative",
          message: "Registration failed: " + (error.message || "Unknown error"),
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
      fullName,
      email,
      password,
      phoneNumber,
      role,
      roleOptions,
      isPwd,
      agreeTerms,
      loading,
      isValidEmail,
      onSubmit,
      navigateTo,
    };
  },
});
</script>

<style lang="scss" scoped>
.register-page {
  background-color: #fff;
  min-height: 100vh;
}

.register-container {
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
