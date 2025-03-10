<script>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { authService } from '../services'

export default {
  name: 'LoginPage',
  setup () {
    const route = useRoute()
    const isOTPSent = ref(false)

    // Get redirect path from query parameters
    const redirectPath = route.query.redirect || '/home'

    return {
      isOTPSent,
      redirectPath
    }
  },
  data: () => {
    return {
      username: '',
      password: '',
      otpInput: '',
      isPwd: true,
      loading: false,
      errorMessage: ''
    }
  },
  methods: {
    async handleSubmit () {
      this.loading = true
      this.errorMessage = ''

      try {
        if (!this.isOTPSent) {
          // First submission - send OTP
          const response = await authService.sendOTP(this.username)
          if (response.data.success) {
            this.isOTPSent = true
            this.$q.notify({
              type: 'positive',
              message: 'OTP sent to your email/phone'
            })

            // REMOVE in production: only for testing
            if (process.env.NODE_ENV === 'development') {
              this.otpInput = response.data.otp // For testing purposes
            }
          }
        } else {
          // Verify OTP and login
          const response = await authService.verifyOTP(this.username, this.otpInput)

          if (response.data.success) {
            // Login after OTP verification
            const loginResponse = await authService.login({
              email: this.username,
              password: this.password
            })

            if (loginResponse.data.token) {
              // Token storage is handled in the authService.login method
              this.$q.notify({
                type: 'positive',
                message: 'Login successful!'
              })

              // Redirect to the intended destination or home
              this.$router.push(this.redirectPath)
            }
          } else {
            this.errorMessage = 'Invalid OTP. Please try again.'
            this.$q.notify({
              type: 'negative',
              message: this.errorMessage
            })
          }
        }
      } catch (error) {
        console.error('Authentication error:', error)
        this.errorMessage = error.response?.data?.message || 'Authentication failed'
        this.$q.notify({
          type: 'negative',
          message: this.errorMessage
        })
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
