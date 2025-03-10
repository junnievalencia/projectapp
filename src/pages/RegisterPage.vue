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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '../services'

export default {
  name: 'RegisterPage',
  setup () {
    // eslint-disable-next-line no-unused-vars
    const router = useRouter()
    const isOTPSent = ref(false)
    return { isOTPSent }
  },
  data: () => {
    return {
      name: '',
      emailOrPhone: '',
      password: '',
      otpInput: '',
      isPwd: true,
      loading: false
    }
  },
  methods: {
    async handleSubmit () {
      this.loading = true
      try {
        if (!this.isOTPSent) {
          // First submission - send OTP
          console.log('Sending OTP to:', this.emailOrPhone)
          try {
            const response = await authService.sendOTP(this.emailOrPhone)
            console.log('OTP response:', response)

            if (response.data && response.data.success) {
              this.isOTPSent = true
              this.$q.notify({
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

            this.$q.notify({
              type: 'negative',
              message: errorMessage,
              timeout: 5000
            })
            throw otpError // Re-throw to prevent further processing
          }
        } else {
          // Skip OTP verification and directly register
          console.log('Registering with OTP:', this.otpInput)
          try {
            const registerResponse = await authService.register({
              name: this.name,
              email: this.emailOrPhone,
              password: this.password,
              otp: this.otpInput
            })
            console.log('Register response:', registerResponse)

            if (registerResponse.data && registerResponse.data.success) {
              this.$q.notify({
                type: 'positive',
                message: 'Registration successful!'
              })
              this.$router.push('/login')
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

            this.$q.notify({
              type: 'negative',
              message: errorMessage,
              timeout: 5000
            })
          }
        }
      } catch (error) {
        console.error('Registration process error:', error)
        this.$q.notify({
          type: 'negative',
          message: error.response?.data?.message || error.message || 'Registration failed',
          timeout: 5000
        })
      } finally {
        this.loading = false
      }
    }
  }
}
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
