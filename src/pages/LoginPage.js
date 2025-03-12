import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { authService } from '../services'

export function useLoginPage () {
  const route = useRoute()
  const router = useRouter()
  const $q = useQuasar()

  // Get redirect path from query parameters
  const redirectPath = route.query.redirect || '/home'

  // Form data
  const username = ref('')
  const password = ref('')
  const isPwd = ref(true)
  const loading = ref(false)
  const errorMessage = ref('')

  async function handleSubmit () {
    loading.value = true
    errorMessage.value = ''

    try {
      // Direct login without OTP
      const loginResponse = await authService.login({
        email: username.value,
        password: password.value
      })

      if (loginResponse.data.token) {
        // Token storage is handled in the authService.login method
        // Show success notification
        $q.notify({
          type: 'positive',
          message: 'Login successful!'
        })

        // Redirect to the intended destination or home
        router.push(redirectPath)
        return true
      } else {
        throw new Error('Login failed')
      }
    } catch (error) {
      console.error('Authentication error:', error)
      errorMessage.value = error.response?.data?.message || 'Authentication failed'

      // Show error notification
      $q.notify({
        type: 'negative',
        message: errorMessage.value
      })

      return false
    } finally {
      loading.value = false
    }
  }

  return {
    username,
    password,
    isPwd,
    loading,
    errorMessage,
    redirectPath,
    handleSubmit
  }
}
