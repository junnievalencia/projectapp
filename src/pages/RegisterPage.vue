<template>
  <q-page class="bg-grey-3">
    <div class="absolute-center register-container">
      <img src="../assets/Wavy.png" alt="Wavy"
      class="wavy-image q-mb-xl"
      style="max-width: 160px"/>
      <div class="text-h4 text-center q-mb-xl">SIGN UP</div>
      <q-form @submit.prevent="handleSubmit" class="q-gutter-xs">
        <q-input
          v-model="name"
          label="Name"
          outlined
          rounded
          class="input-field q-mt-xl"
          :rules="[val => !!val || 'Name is required']"
        >
          <template v-slot:prepend>
            <q-icon name="person" />
          </template>
        </q-input>

        <q-input
          v-model="emailOrPhone"
          label="Email or Phone Number"
          outlined
          rounded
          class="input-field"
          :rules="[val => !!val || 'Email or Phone Number is required']"
        >
          <template v-slot:prepend>
            <q-icon name="mail" />
          </template>
        </q-input>

        <q-input
          v-model="password"
          :type="isPwd ? 'password' : 'text'"
          label="Password"
          outlined
          rounded
          class="input-field"
          :rules="[val => !!val || 'Password is required']"
        >
          <template v-slot:prepend>
            <q-icon name="lock" />
          </template>
          <template v-slot:append>
            <q-icon
              :name="isPwd ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="isPwd = !isPwd"
            />
          </template>
        </q-input>

        <template v-if="isOTPSent">
          <q-input
            v-model="otpInput"
            label="Enter OTP"
            outlined
            rounded
            class="input-field"
            :rules="[val => !!val || 'OTP is required']"
          >
            <template v-slot:prepend>
              <q-icon name="pin" />
            </template>
          </q-input>
        </template>

        <div class="text-center">
          <q-btn
            push
            color="orange"
            class="register-btn q-mt-xl"
            size="lg"
            :label="isOTPSent ? 'Verify OTP' : 'Sign Up'"
            type="submit"
            :loading="loading"
            rounded
            style="width: 280px; height: 39px; font-size: 16px; font-weight: 600; border-radius: 20px;"
          />
        </div>

        <div class="text-center q-mt-md">
          Already Have an Account?
          <router-link to="/login" class="text-orange">Login</router-link>
        </div>
      </q-form>
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'
import { useRegisterPage } from './RegisterPage.js'

export default defineComponent({
  name: 'RegisterPage',
  setup () {
    const {
      isOTPSent,
      name,
      emailOrPhone,
      password,
      otpInput,
      isPwd,
      loading,
      handleSubmit
    } = useRegisterPage()

    return {
      isOTPSent,
      name,
      emailOrPhone,
      password,
      otpInput,
      isPwd,
      loading,
      handleSubmit
    }
  }
})
</script>

<style lang="scss" scoped>
.register-container {
  width: 100%;
  max-width: 400px;
  padding: 20px;
}

.wavy-image {
  width: 100%;
  max-width: 300px;
  height: auto;
  margin: 0 auto;
  display: block;
}

.input-field:deep(.q-field__control) {
  border-radius: 15px;
  height: 56px;
  background-color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}

.register-btn {
  box-shadow: 0 4px 6px rgba(255, 140, 0, 0.2);
  transition: transform 0.2s;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(255, 140, 0, 0.3);
  }
}
</style>
