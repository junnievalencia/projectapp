<template>
  <q-page class="flex flex-center bg-grey-1">
    <q-card class="register-card">
      <q-card-section class="text-center">
        <div class="text-h5 q-mb-md">Register Admin Account</div>
      </q-card-section>

      <q-card-section>
        <q-stepper
          v-model="step"
          vertical
          color="primary"
          animated
        >
          <!-- Step 1: Basic Info -->
          <q-step
            :name="1"
            title="Basic Information"
            icon="person"
            :done="step > 1"
          >
            <q-form @submit="goToVerification" class="q-gutter-md">
              <q-input
                v-model="username"
                label="Username"
                outlined
                :rules="[val => !!val || 'Username is required']"
              />

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
                :rules="[
                  val => !!val || 'Password is required',
                  val => val.length >= 6 || 'Password must be at least 6 characters'
                ]"
              >
                <template v-slot:append>
                  <q-icon
                    :name="isPwd ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="isPwd = !isPwd"
                  />
                </template>
              </q-input>

              <q-input
                v-model="confirmPassword"
                label="Confirm Password"
                :type="isPwd ? 'password' : 'text'"
                outlined
                :rules="[
                  val => !!val || 'Please confirm your password',
                  val => val === password || 'Passwords do not match'
                ]"
              />

              <div class="row justify-center q-mt-md">
                <q-btn
                  unelevated
                  color="primary"
                  label="Continue"
                  type="submit"
                  :loading="loading"
                />
              </div>
            </q-form>
          </q-step>

          <!-- Step 2: OTP Verification -->
          <q-step
            :name="2"
            title="Verify Email"
            icon="verified_user"
            :done="step > 2"
          >
            <p>We've sent a verification code to your email. Please enter it below:</p>
            
            <q-form @submit="verifyOTP" class="q-gutter-md">
              <div class="row justify-center">
                <q-input
                  v-model="otp"
                  label="Verification Code"
                  outlined
                  class="col-12"
                  :rules="[val => !!val || 'Verification code is required']"
                />
              </div>

              <div class="row justify-between q-mt-md">
                <q-btn
                  outline
                  color="grey"
                  label="Back"
                  @click="step = 1"
                />
                <q-btn
                  unelevated
                  color="primary"
                  label="Verify"
                  type="submit"
                  :loading="verifying"
                />
              </div>

              <div class="row justify-center q-mt-md">
                <q-btn
                  flat
                  color="primary"
                  label="Resend Code"
                  @click="resendOTP"
                  :disable="countdown > 0"
                />
                <div v-if="countdown > 0" class="q-ml-sm self-center">
                  Resend in {{ countdown }} seconds
                </div>
              </div>
            </q-form>
          </q-step>

          <!-- Step 3: Complete -->
          <q-step
            :name="3"
            title="Complete"
            icon="done"
          >
            <div class="text-center">
              <q-icon name="check_circle" color="positive" size="5rem" />
              <h5>Registration Successful!</h5>
              <p>Your admin account has been created successfully.</p>
              
              <q-btn
                unelevated
                color="primary"
                label="Go to Login"
                @click="goToLogin"
                class="q-mt-md"
              />
            </div>
          </q-step>
        </q-stepper>
      </q-card-section>

      <q-card-section v-if="step === 1">
        <div class="row justify-center q-mt-md">
          <q-btn
            flat
            color="primary"
            label="Already have an account? Login"
            @click="goToLogin"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { auth, db } from 'boot/firebase'
import { createUserWithEmailAndPassword, sendEmailVerification, fetchSignInMethodsForEmail } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'

export default defineComponent({
  name: 'RegisterPage',

  setup() {
    const $q = useQuasar()
    const router = useRouter()
    const step = ref(1)
    const username = ref('')
    const email = ref('')
    const password = ref('')
    const confirmPassword = ref('')
    const otp = ref('')
    const isPwd = ref(true)
    const loading = ref(false)
    const verifying = ref(false)
    const countdown = ref(0)
    const verificationCode = ref('')

    const isValidEmail = (val) => {
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
      return emailPattern.test(val) || 'Invalid email format'
    }

    const goToVerification = async () => {
      loading.value = true
      try {
        // Check if email exists first
        const methods = await fetchSignInMethodsForEmail(auth, email.value)
        
        if (methods.length > 0) {
          // Email already exists
          $q.notify({
            color: 'negative',
            message: 'This email is already registered',
            icon: 'error'
          })
          return
        }
        
        // Generate 6-digit OTP
        verificationCode.value = Math.floor(100000 + Math.random() * 900000).toString()
        
        // For a real app, you would send this via email through Firebase or a backend service
        // Here we're simulating it with a notification
        $q.notify({
          color: 'info',
          message: `Your verification code is: ${verificationCode.value}`,
          timeout: 10000
        })
        
        // Move to next step
        step.value = 2
        startCountdown()
      } catch (error) {
        $q.notify({
          color: 'negative',
          message: error.message,
          icon: 'error'
        })
      } finally {
        loading.value = false
      }
    }

    const startCountdown = () => {
      countdown.value = 60
      const timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          clearInterval(timer)
        }
      }, 1000)
    }

    const resendOTP = () => {
      // Regenerate OTP
      verificationCode.value = Math.floor(100000 + Math.random() * 900000).toString()
      
      // Notify with new code
      $q.notify({
        color: 'info',
        message: `Your new verification code is: ${verificationCode.value}`,
        timeout: 10000
      })
      
      startCountdown()
    }

    const verifyOTP = async () => {
      verifying.value = true
      try {
        if (otp.value === verificationCode.value) {
          // Create user account
          const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value)
          
          // Save user data to Firestore
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            username: username.value,
            email: email.value,
            role: 'admin',
            createdAt: new Date()
          })
          
          // Move to success step
          step.value = 3
        } else {
          $q.notify({
            color: 'negative',
            message: 'Invalid verification code',
            icon: 'error'
          })
        }
      } catch (error) {
        let errorMessage = error.message
        if (error.code === 'auth/email-already-in-use') {
          errorMessage = 'This email is already registered'
        }
        $q.notify({
          color: 'negative',
          message: errorMessage,
          icon: 'error'
        })
      } finally {
        verifying.value = false
      }
    }

    const goToLogin = () => {
      router.push('/login')
    }

    return {
      step,
      username,
      email,
      password,
      confirmPassword,
      otp,
      isPwd,
      loading,
      verifying,
      countdown,
      isValidEmail,
      goToVerification,
      verifyOTP,
      resendOTP,
      goToLogin
    }
  }
})
</script>

<style scoped>
.register-card {
  width: 100%;
  max-width: 500px;
  padding: 20px;
}
</style> 