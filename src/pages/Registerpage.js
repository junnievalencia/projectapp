import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { authService } from '../services'

export function useRegisterPage () {
  const router = useRouter()
  const $q = useQuasar()
  const isOTPSent = ref(false)
  const name = ref('')
  const emailOrPhone = ref('')
  const password = ref('')
  const otpInput = ref('')
  const isPwd = ref(true)
  const loading = ref(false)

  async function handleSubmit () {
    loading.value = true
    try {
      if (!isOTPSent.value) {
        // First submission - send OTP
        console.log('Sending OTP to:', emailOrPhone.value)
        try {
          const response = await authService.sendOTP(emailOrPhone.value)
          console.log('OTP response:', response)

          if (response.data && response.data.success) {
            isOTPSent.value = true
            $q.notify({
              type: 'positive',
              message: 'OTP sent to your email/phone'
            })
          } else {
            // Handle case where response doesn't have expected structure
            throw new Error('Invalid response format from server')
          }
        } catch (otpError) {
          console.error('OTP sending error:', otpError)
          // More detailed error handling for OTP sending
          let errorMessage = 'Failed to send OTP'

          if (otpError.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Error response:', otpError.response.data)
            errorMessage = otpError.response.data?.message ||
                          `Server error: ${otpError.response.status}`
          } else if (otpError.request) {
            // The request was made but no response was received
            console.error('No response received:', otpError.request)
            errorMessage = 'No response from server. Please check your internet connection.'
          } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Request error:', otpError.message)
            errorMessage = otpError.message
          }

          $q.notify({
            type: 'negative',
            message: errorMessage,
            timeout: 5000
          })
          throw otpError // Re-throw to prevent further processing
        }
      } else {
        // Skip OTP verification and directly register
        console.log('Registering with OTP:', otpInput.value)
        try {
          const registerResponse = await authService.register({
            name: name.value,
            email: emailOrPhone.value,
            password: password.value,
            otp: otpInput.value
          })
          console.log('Register response:', registerResponse)

          if (registerResponse.data && registerResponse.data.success) {
            $q.notify({
              type: 'positive',
              message: 'Registration successful!'
            })
            router.push('/login')
          } else {
            throw new Error(registerResponse.data?.message || 'Registration failed')
          }
        } catch (registerError) {
          console.error('Registration error:', registerError)
          let errorMessage = 'Registration failed'

          if (registerError.response) {
            console.error('Error response:', registerError.response.data)
            errorMessage = registerError.response.data?.message ||
                          `Server error: ${registerError.response.status}`
          }

          $q.notify({
            type: 'negative',
            message: errorMessage,
            timeout: 5000
          })
        }
      }
    } catch (error) {
      console.error('Registration process error:', error)
      $q.notify({
        type: 'negative',
        message: error.response?.data?.message || error.message || 'Registration failed',
        timeout: 5000
      })
    } finally {
      loading.value = false
    }
  }

  return {
    isOTPSent,
    name,
    emailOrPhone,
    password,
    otpInput,
    isPwd,
    handleSubmit,
    loading
  }
}
