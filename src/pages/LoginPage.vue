<template>
  <q-page class="flex flex-center bg-grey-1">
    <q-card class="login-card">
      <q-card-section class="text-center">
        <div class="text-h5 q-mb-md">Admin Login</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <q-input
            v-model="email"
            label="Email"
            type="email"
            outlined
            :rules="[val => !!val || 'Email is required', isValidEmail]"
          />

          <q-input
            v-model="password"
            label="Password"
            :type="isPwd ? 'password' : 'text'"
            outlined
            :rules="[val => !!val || 'Password is required']"
          >
            <template v-slot:append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd = !isPwd"
              />
            </template>
          </q-input>

          <div class="row justify-between q-mt-md">
            <q-checkbox v-model="rememberMe" label="Remember me" />
            <q-btn
              flat
              color="primary"
              label="Forgot Password?"
              @click="forgotPassword"
            />
          </div>

          <q-separator />

          <div class="row justify-center q-mt-md">
            <q-btn
              unelevated
              color="primary"
              size="lg"
              class="full-width"
              label="Sign In"
              type="submit"
              :loading="loading"
            />
          </div>

          <div class="row justify-center q-mt-md">
            <q-btn
              flat
              color="primary"
              label="Need an account? Register"
              @click="goToRegister"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from 'boot/firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { useQuasar } from 'quasar'

export default defineComponent({
  name: 'LoginPage',

  setup() {
    const $q = useQuasar()
    const router = useRouter()
    const email = ref('')
    const password = ref('')
    const rememberMe = ref(false)
    const isPwd = ref(true)
    const loading = ref(false)

    const isValidEmail = (val) => {
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
      return emailPattern.test(val) || 'Invalid email format'
    }

    const onSubmit = async () => {
      loading.value = true
      try {
        await signInWithEmailAndPassword(auth, email.value, password.value)
        router.push('/dashboard')
      } catch (error) {
        let errorMessage = 'Failed to login'
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
          errorMessage = 'Invalid email or password'
        }
        $q.notify({
          color: 'negative',
          message: errorMessage,
          icon: 'error'
        })
      } finally {
        loading.value = false
      }
    }

    const forgotPassword = () => {
      router.push('/forgot-password')
    }

    const goToRegister = () => {
      router.push('/register')
    }

    return {
      email,
      password,
      rememberMe,
      isPwd,
      loading,
      isValidEmail,
      onSubmit,
      forgotPassword,
      goToRegister
    }
  }
})
</script>

<style scoped>
.login-card {
  width: 100%;
  max-width: 450px;
  padding: 20px;
}
</style> 