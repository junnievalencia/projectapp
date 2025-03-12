<template>
  <q-page class="bg-grey-3">
    <div class="absolute-center login-container">
      <img src="../assets/Wavy.png" alt="Wavy"
      class="wavy-image q-mb-xl"
      style="max-width: 160px"/>
      <div class="text-h4 text-center q-mb-xl">SIGN IN</div>
      <q-form @submit.prevent="handleSubmit" class="q-gutter-xs">
        <q-input
          v-model="username"
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
          class="input-field"
          style="border-radius: 100px;"
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

        <div class="text-center">
          <q-btn
            push
            color="orange"
            class="login-btn"
            size="lg"
            label="Sign In"
            type="submit"
            :loading="loading"
            rounded
            style="width: 280px; height: 39px; font-size: 16px; font-weight: 600; border-radius: 20px;"
          />
        </div>

        <div class="text-center q-mt-md">
          Don't have an account?
          <router-link to="/register" class="text-orange">Register here</router-link>
        </div>
      </q-form>
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'
import { useLoginPage } from './LoginPage.js'

export default defineComponent({
  name: 'LoginPage',
  setup () {
    const {
      username,
      password,
      isPwd,
      loading,
      errorMessage,
      redirectPath,
      handleSubmit
    } = useLoginPage()

    return {
      username,
      password,
      isPwd,
      loading,
      errorMessage,
      redirectPath,
      handleSubmit
    }
  },
  methods: {}
})
</script>

<style lang="scss" scoped>
.login-container {
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

.input-field:deep(.q-field__marginal) {
  height: 48px;
  padding-top: 6px;
}

.login-btn {
  height: 39px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 20px;
  box-shadow: 0 4px 6px rgba(255, 140, 0, 0.2);
  transition: transform 0.2s;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(255, 140, 0, 0.3);
  }
}
</style>
