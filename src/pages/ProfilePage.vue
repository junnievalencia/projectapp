<template>
  <q-page class="profile-page q-pa-md">
    <div class="header-section bg-orange text-white q-pa-md q-mb-md shadow-10">
      <div class="text-h5">STORE PROFILE</div>
    </div>

    <q-card class="profile-card q-mb-xl">
      <q-card-section>
        <div class="row justify-between items-center q-mb-md">
          <div class="text-h6">Store Information</div>
          <q-btn 
            :color="isEditing ? 'green' : 'primary'" 
            :icon="isEditing ? 'save' : 'edit'" 
            round
            @click="isEditing ? saveProfile() : startEditing()"
            :loading="saving"
          />
        </div>

        <q-separator class="q-mb-md" />

        <!-- Store Information Form -->
        <q-form ref="profileForm" @submit.prevent="saveProfile">
          <div class="row q-col-gutter-md">
            <!-- Store Name -->
            <div class="col-12">
              <q-input
                v-model="profile.storeName"
                label="Store Name"
                :readonly="!isEditing"
                outlined
                :dense="!isEditing"
                :rules="[val => !!val || 'Store name is required']"
              />
            </div>

            <!-- Admin Name -->
            <div class="col-12 col-md-6">
              <q-input
                v-model="profile.name"
                label="Admin Name"
                :readonly="!isEditing"
                outlined
                :dense="!isEditing"
                :rules="[val => !!val || 'Admin name is required']"
              />
            </div>

            <!-- Email -->
            <div class="col-12 col-md-6">
              <q-input
                v-model="profile.email"
                label="Email"
                type="email"
                :readonly="!isEditing"
                outlined
                :dense="!isEditing"
                :rules="[val => !!val || 'Email is required', isValidEmail]"
              />
            </div>

            <!-- Phone Number -->
            <div class="col-12">
              <q-input
                v-model="profile.phoneNumber"
                label="Philippine Phone Number"
                mask="(+63) ###-###-####"
                unmasked-value
                :readonly="!isEditing"
                outlined
                :dense="!isEditing"
                :rules="[val => !!val || 'Phone number is required']"
                hint="Format: +63 XXX-XXX-XXXX"
              />
            </div>
          </div>

          <div class="text-h6 q-mt-lg q-mb-md">Payment Methods</div>
          <q-separator class="q-mb-md" />

          <div class="row q-col-gutter-md">
            <!-- GCash Number -->
            <div class="col-12 col-md-4">
              <q-input
                v-model="profile.paymentMethods.gcash"
                label="GCash Number"
                mask="(+63) ###-###-####"
                unmasked-value
                :readonly="!isEditing"
                outlined
                :dense="!isEditing"
                hint="Format: +63 XXX-XXX-XXXX"
              />
            </div>

            <!-- Maya Number -->
            <div class="col-12 col-md-4">
              <q-input
                v-model="profile.paymentMethods.maya"
                label="Maya Number"
                mask="(+63) ###-###-####"
                unmasked-value
                :readonly="!isEditing"
                outlined
                :dense="!isEditing"
                hint="Format: +63 XXX-XXX-XXXX"
              />
            </div>

            <!-- Cash Option -->
            <div class="col-12 col-md-4 flex items-center">
              <q-checkbox
                v-model="profile.paymentMethods.cashEnabled"
                label="Accept Cash Payments"
                :disable="!isEditing"
              />
            </div>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { auth, db } from 'boot/firebase'
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

export default defineComponent({
  name: 'ProfilePage',

  setup() {
    const $q = useQuasar()
    const profileForm = ref(null)
    const isEditing = ref(false)
    const saving = ref(false)
    const userId = ref(null)

    // Profile form data
    const profile = ref({
      storeName: '',
      name: '',
      email: '',
      phoneNumber: '',
      paymentMethods: {
        gcash: '',
        maya: '',
        cashEnabled: true
      }
    })

    const isValidEmail = (val) => {
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
      return emailPattern.test(val) || 'Invalid email format'
    }

    const fetchProfile = async () => {
      try {
        if (!userId.value) return

        const docRef = doc(db, 'storeProfiles', userId.value)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          // Merge existing data with default structure
          profile.value = {
            ...profile.value,
            ...docSnap.data()
          }
        } else {
          // Create default profile if it doesn't exist
          await setDoc(docRef, {
            ...profile.value,
            email: auth.currentUser.email || '',
            createdAt: new Date()
          })
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        $q.notify({
          color: 'negative',
          message: 'Failed to load profile data',
          icon: 'error'
        })
      }
    }

    const startEditing = () => {
      isEditing.value = true
    }

    const saveProfile = async () => {
      // Validate form
      if (profileForm.value && !profileForm.value.validate()) {
        return
      }

      saving.value = true
      try {
        if (!userId.value) {
          throw new Error('User not authenticated')
        }

        const docRef = doc(db, 'storeProfiles', userId.value)
        await updateDoc(docRef, {
          ...profile.value,
          updatedAt: new Date()
        })

        // Also update in localStorage for other components to use
        localStorage.setItem('adminUser', JSON.stringify({
          name: profile.value.name,
          email: profile.value.email,
          storeName: profile.value.storeName
        }))

        isEditing.value = false
        $q.notify({
          color: 'positive',
          message: 'Profile saved successfully',
          icon: 'check_circle'
        })
      } catch (error) {
        console.error('Error saving profile:', error)
        $q.notify({
          color: 'negative',
          message: 'Failed to save profile: ' + error.message,
          icon: 'error'
        })
      } finally {
        saving.value = false
      }
    }

    // Listen for auth state changes
    onMounted(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          userId.value = user.uid
          // Set email from auth
          profile.value.email = user.email || ''
          fetchProfile()
        }
      })

      // Clean up the listener when the component is unmounted
      return () => unsubscribe()
    })

    return {
      profile,
      isEditing,
      saving,
      profileForm,
      isValidEmail,
      startEditing,
      saveProfile
    }
  }
})
</script>

<style lang="scss" scoped>
.profile-page {
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header-section {
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.profile-card {
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}
</style> 