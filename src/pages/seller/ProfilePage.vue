<template>
  <q-page padding>
    <div class="row q-mb-lg">
      <div class="col-12">
        <h4 class="q-my-xs">Seller Profile</h4>
        <p class="text-grey-8 q-my-none">Your account information</p>
      </div>
    </div>

    <div class="row justify-center">
      <!-- Profile Information -->
      <div class="col-12 col-md-8 col-lg-6">
        <q-card class="profile-card">
          <q-card-section>
            <div class="text-h6">Profile Information</div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <q-form @submit="updateProfile" class="q-gutter-md">
              <!-- Name -->
              <q-input
                v-model="profile.name"
                label="Full Name"
                outlined
                :rules="[(val) => !!val || 'Name is required']"
              >
                <template v-slot:prepend>
                  <q-icon name="person" />
                </template>
              </q-input>

              <!-- Email -->
              <q-input
                v-model="profile.email"
                label="Email"
                outlined
                type="email"
                readonly
                disable
              >
                <template v-slot:prepend>
                  <q-icon name="email" />
                </template>
              </q-input>

              <!-- Phone -->
              <q-input
                v-model="profile.phone"
                label="Phone Number"
                outlined
                :rules="[(val) => !!val || 'Phone number is required']"
              >
                <template v-slot:prepend>
                  <q-icon name="phone" />
                </template>
              </q-input>

              <!-- Role -->
              <q-input
                v-model="profile.role"
                label="Account Role"
                outlined
                readonly
                disable
              >
                <template v-slot:prepend>
                  <q-icon name="badge" />
                </template>
              </q-input>

              <!-- Store Name -->
              <q-input
                v-model="profile.storeName"
                label="Store Name"
                outlined
                :rules="[(val) => !!val || 'Store name is required']"
              >
                <template v-slot:prepend>
                  <q-icon name="store" />
                </template>
              </q-input>

              <div class="row q-mt-md">
                <q-space />
                <q-btn
                  type="submit"
                  color="primary"
                  label="Save Changes"
                  :loading="updating"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from "vue";
import { useQuasar } from "quasar";
import AuthService from "src/services/AuthService";

export default defineComponent({
  name: "SellerProfilePage",

  setup() {
    const $q = useQuasar();

    // Profile Data
    const profile = ref({
      name: "",
      email: "",
      phone: "",
      role: "",
      storeName: "",
    });

    // Loading State
    const updating = ref(false);

    // Load profile data
    const loadProfile = async () => {
      try {
        // Get user data from AuthService
        const userData = AuthService.getUserData();
        
        if (userData) {
          console.log("Loading user data from AuthService:", userData);
          
          // Update profile with actual user data
          profile.value = {
            name: userData.name || "",
            email: userData.email || "",
            phone: userData.phone || "",
            role: userData.role || "",
            storeName: userData.storeName || "",
          };
        } else {
          console.warn("No user data found in AuthService");
          // Fallback to mock data if no user data is found
          profile.value = {
            name: "Juan Dela Cruz",
            email: "juan@example.com",
            phone: "0912-345-6789",
            role: "seller",
            storeName: "Juan's Filipino Cuisine",
          };
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        $q.notify({
          color: "negative",
          message: "Failed to load profile data",
          icon: "error",
        });
      }
    };

    // Update profile
    const updateProfile = async () => {
      updating.value = true;

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Update user data in AuthService
        const userData = AuthService.getUserData();
        if (userData) {
          const updatedUserData = {
            ...userData,
            name: profile.value.name,
            phone: profile.value.phone,
            storeName: profile.value.storeName,
          };
          
          // Save the updated user data
          AuthService.saveToken(AuthService.getToken(), updatedUserData);
          
          console.log("Updated user data:", updatedUserData);
        }

        $q.notify({
          color: "positive",
          message: "Profile updated successfully",
          icon: "check_circle",
        });
      } catch (error) {
        console.error("Error updating profile:", error);
        $q.notify({
          color: "negative",
          message: "Failed to update profile",
          icon: "error",
        });
      } finally {
        updating.value = false;
      }
    };

    onMounted(() => {
      loadProfile();
    });

    return {
      profile,
      updating,
      updateProfile,
    };
  },
});
</script>

<style lang="scss" scoped>
.profile-card {
  border-radius: 8px;
}
</style>
