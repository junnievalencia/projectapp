<template>
  <q-page padding>
    <div class="row q-mb-md items-center">
      <div class="col">
        <h4 class="q-my-xs">My Profile</h4>
        <p class="text-grey-8 q-my-none">Manage your account information</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="column items-center q-pa-lg">
      <q-spinner color="primary" size="3em" />
      <p class="text-grey q-mt-md">Loading your profile...</p>
    </div>

    <div v-else class="row q-col-gutter-md">
      <!-- Personal Info Section -->
      <div class="col-12 col-md-6">
        <q-card class="profile-card">
          <q-card-section>
            <div class="text-h6">Personal Information</div>
            <q-separator class="q-my-md" />

            <q-form @submit.prevent="updateProfile" class="q-gutter-md">
              <div class="row q-col-gutter-md">
                <div class="col-12">
                  <q-input
                    v-model="profileData.fullName"
                    label="Full Name"
                    outlined
                    :rules="[(val) => !!val || 'Name is required']"
                  />
                </div>

                <div class="col-12">
                  <q-input
                    v-model="profileData.email"
                    label="Email"
                    type="email"
                    outlined
                    readonly
                  />
                </div>

                <div class="col-12">
                  <q-input
                    v-model="profileData.phone"
                    label="Phone Number"
                    outlined
                    :rules="[(val) => !!val || 'Phone number is required']"
                  />
                </div>

                <div class="col-12">
                  <q-btn
                    color="primary"
                    label="Update Profile"
                    type="submit"
                    :loading="updatingProfile"
                  />
                </div>
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>

      <!-- Saved Addresses Section -->
      <div class="col-12 col-md-6">
        <q-card class="profile-card">
          <q-card-section>
            <div class="text-h6">Saved Addresses</div>
            <q-separator class="q-my-md" />

            <q-list bordered separator>
              <q-item
                v-for="(address, index) in profileData.addresses"
                :key="index"
              >
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{
                    address.label
                  }}</q-item-label>
                  <q-item-label caption>{{ address.fullAddress }}</q-item-label>
                  <q-item-label caption>
                    <span v-if="address.isDefault" class="text-positive"
                      >Default Address</span
                    >
                  </q-item-label>
                </q-item-section>

                <q-item-section side>
                  <div class="row q-gutter-sm">
                    <q-btn
                      flat
                      round
                      color="primary"
                      icon="edit"
                      size="sm"
                      @click="editAddress(index)"
                    />
                    <q-btn
                      flat
                      round
                      color="negative"
                      icon="delete"
                      size="sm"
                      @click="confirmDeleteAddress(index)"
                      :disable="address.isDefault"
                    />
                    <q-btn
                      v-if="!address.isDefault"
                      flat
                      round
                      color="primary"
                      icon="check_circle"
                      size="sm"
                      @click="setDefaultAddress(index)"
                    />
                  </div>
                </q-item-section>
              </q-item>

              <q-item
                v-if="profileData.addresses.length === 0"
                class="text-center"
              >
                <q-item-section>
                  <q-item-label class="text-grey"
                    >No addresses saved</q-item-label
                  >
                </q-item-section>
              </q-item>
            </q-list>

            <div class="q-mt-md">
              <q-btn
                outline
                color="primary"
                icon="add"
                label="Add New Address"
                @click="addNewAddress"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Payment Methods Section -->
      <div class="col-12 col-md-6">
        <q-card class="profile-card">
          <q-card-section>
            <div class="text-h6">Payment Methods</div>
            <q-separator class="q-my-md" />

            <q-list bordered separator>
              <q-item
                v-for="(payment, index) in profileData.paymentMethods"
                :key="index"
              >
                <q-item-section avatar>
                  <q-icon
                    :name="getPaymentIcon(payment.type)"
                    color="primary"
                    size="md"
                  />
                </q-item-section>

                <q-item-section>
                  <q-item-label class="text-weight-medium">{{
                    payment.name
                  }}</q-item-label>
                  <q-item-label caption>{{
                    getPaymentDescription(payment)
                  }}</q-item-label>
                  <q-item-label caption>
                    <span v-if="payment.isDefault" class="text-positive"
                      >Default Payment</span
                    >
                  </q-item-label>
                </q-item-section>

                <q-item-section side>
                  <div class="row q-gutter-sm">
                    <q-btn
                      flat
                      round
                      color="negative"
                      icon="delete"
                      size="sm"
                      @click="confirmDeletePayment(index)"
                      :disable="payment.isDefault"
                    />
                    <q-btn
                      v-if="!payment.isDefault"
                      flat
                      round
                      color="primary"
                      icon="check_circle"
                      size="sm"
                      @click="setDefaultPayment(index)"
                    />
                  </div>
                </q-item-section>
              </q-item>

              <q-item
                v-if="profileData.paymentMethods.length === 0"
                class="text-center"
              >
                <q-item-section>
                  <q-item-label class="text-grey"
                    >No payment methods saved</q-item-label
                  >
                </q-item-section>
              </q-item>
            </q-list>

            <div class="q-mt-md">
              <q-btn
                outline
                color="primary"
                icon="add"
                label="Add Payment Method"
                @click="addPaymentMethod"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Security Section -->
      <div class="col-12 col-md-6">
        <q-card class="profile-card">
          <q-card-section>
            <div class="text-h6">Security</div>
            <q-separator class="q-my-md" />

            <q-form @submit.prevent="changePassword" class="q-gutter-md">
              <div class="row q-col-gutter-md">
                <div class="col-12">
                  <q-input
                    v-model="passwordData.currentPassword"
                    label="Current Password"
                    type="password"
                    outlined
                    :rules="[(val) => !!val || 'Current password is required']"
                  />
                </div>

                <div class="col-12">
                  <q-input
                    v-model="passwordData.newPassword"
                    label="New Password"
                    type="password"
                    outlined
                    :rules="[
                      (val) => !!val || 'New password is required',
                      (val) =>
                        val.length >= 8 ||
                        'Password must be at least 8 characters',
                      (val) =>
                        /[A-Z]/.test(val) ||
                        'Password must contain at least one uppercase letter',
                      (val) =>
                        /[0-9]/.test(val) ||
                        'Password must contain at least one number',
                    ]"
                  />
                </div>

                <div class="col-12">
                  <q-input
                    v-model="passwordData.confirmPassword"
                    label="Confirm New Password"
                    type="password"
                    outlined
                    :rules="[
                      (val) => !!val || 'Please confirm your password',
                      (val) =>
                        val === passwordData.newPassword ||
                        'Passwords do not match',
                    ]"
                  />
                </div>

                <div class="col-12">
                  <q-btn
                    color="primary"
                    label="Change Password"
                    type="submit"
                    :loading="changingPassword"
                  />
                </div>
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Address Dialog -->
    <q-dialog v-model="addressDialog.show" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">
            {{ addressDialog.isEdit ? "Edit" : "Add New" }} Address
          </div>
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="saveAddress" class="q-gutter-md">
            <q-input
              v-model="addressDialog.data.label"
              label="Address Label (e.g., Home, Work)"
              outlined
              :rules="[(val) => !!val || 'Label is required']"
            />

            <q-input
              v-model="addressDialog.data.fullAddress"
              label="Full Address"
              type="textarea"
              outlined
              :rules="[(val) => !!val || 'Address is required']"
              autogrow
            />

            <q-checkbox
              v-model="addressDialog.data.isDefault"
              label="Set as default address"
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup />
          <q-btn
            flat
            label="Save"
            color="primary"
            @click="saveAddress"
            :loading="addressDialog.saving"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Payment Method Dialog -->
    <q-dialog v-model="paymentDialog.show" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Add Payment Method</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="savePaymentMethod" class="q-gutter-md">
            <q-select
              v-model="paymentDialog.data.type"
              :options="paymentTypeOptions"
              label="Payment Type"
              outlined
              emit-value
              map-options
              :rules="[(val) => !!val || 'Payment type is required']"
            />

            <q-input
              v-model="paymentDialog.data.name"
              label="Name on Card"
              outlined
              :rules="[(val) => !!val || 'Name is required']"
              v-if="paymentDialog.data.type === 'card'"
            />

            <q-input
              v-model="paymentDialog.data.cardNumber"
              label="Card Number"
              outlined
              mask="#### #### #### ####"
              :rules="[
                (val) =>
                  (!!val && val.length === 19) ||
                  'Valid card number is required',
              ]"
              v-if="paymentDialog.data.type === 'card'"
            />

            <div
              class="row q-col-gutter-md"
              v-if="paymentDialog.data.type === 'card'"
            >
              <div class="col-6">
                <q-input
                  v-model="paymentDialog.data.expiryDate"
                  label="Expiry Date"
                  outlined
                  mask="##/##"
                  :rules="[(val) => !!val || 'Expiry date is required']"
                />
              </div>
              <div class="col-6">
                <q-input
                  v-model="paymentDialog.data.cvv"
                  label="CVV"
                  outlined
                  mask="###"
                  :rules="[(val) => !!val || 'CVV is required']"
                />
              </div>
            </div>

            <q-input
              v-model="paymentDialog.data.accountNumber"
              label="Account Number"
              outlined
              :rules="[(val) => !!val || 'Account number is required']"
              v-if="paymentDialog.data.type === 'gcash'"
            />

            <q-checkbox
              v-model="paymentDialog.data.isDefault"
              label="Set as default payment method"
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup />
          <q-btn
            flat
            label="Save"
            color="primary"
            @click="savePaymentMethod"
            :loading="paymentDialog.saving"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Confirmation Dialog -->
    <q-dialog v-model="confirmDialog.show" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">{{ confirmDialog.title }}</span>
        </q-card-section>

        <q-card-section>
          <p>{{ confirmDialog.message }}</p>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup />
          <q-btn
            flat
            label="Confirm"
            color="negative"
            @click="confirmAction"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from "vue";
import { useQuasar } from "quasar";

export default defineComponent({
  name: "ProfilePage",

  setup() {
    const $q = useQuasar();

    const loading = ref(true);
    const updatingProfile = ref(false);
    const changingPassword = ref(false);

    // Profile data
    const profileData = ref({
      fullName: "",
      email: "",
      phone: "",
      addresses: [],
      paymentMethods: [],
    });

    // Password change data
    const passwordData = ref({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    // Address dialog
    const addressDialog = ref({
      show: false,
      isEdit: false,
      editIndex: -1,
      saving: false,
      data: {
        label: "",
        fullAddress: "",
        isDefault: false,
      },
    });

    // Payment dialog
    const paymentDialog = ref({
      show: false,
      saving: false,
      data: {
        type: "",
        name: "",
        cardNumber: "",
        expiryDate: "",
        cvv: "",
        accountNumber: "",
        isDefault: false,
      },
    });

    // Confirmation dialog
    const confirmDialog = ref({
      show: false,
      title: "",
      message: "",
      action: null,
      data: null,
    });

    // Payment type options
    const paymentTypeOptions = [
      { label: "Credit/Debit Card", value: "card" },
      { label: "GCash", value: "gcash" },
      { label: "Cash on Delivery", value: "cod" },
    ];

    // Load profile data
    const loadProfile = async () => {
      loading.value = true;

      try {
        // This would be an API call in a real app
        // const response = await api.get('/customer/profile')

        // Mock data for now
        setTimeout(() => {
          profileData.value = {
            fullName: "Juan Dela Cruz",
            email: "juan.delacruz@example.com",
            phone: "09123456789",
            addresses: [
              {
                label: "Home",
                fullAddress: "123 Main St, Makati City, Metro Manila",
                isDefault: true,
              },
              {
                label: "Work",
                fullAddress:
                  "456 Corporate Ave, BGC, Taguig City, Metro Manila",
                isDefault: false,
              },
            ],
            paymentMethods: [
              {
                type: "card",
                name: "Juan Dela Cruz",
                cardNumber: "**** **** **** 1234",
                expiryDate: "12/25",
                isDefault: true,
              },
              {
                type: "gcash",
                accountNumber: "09123456789",
                isDefault: false,
              },
            ],
          };

          loading.value = false;
        }, 1000);
      } catch (error) {
        console.error("Error loading profile:", error);
        $q.notify({
          color: "negative",
          message: "Failed to load profile",
          icon: "error",
        });
        loading.value = false;
      }
    };

    // Update profile
    const updateProfile = async () => {
      updatingProfile.value = true;

      try {
        // This would be an API call in a real app
        // await api.put('/customer/profile', {
        //   fullName: profileData.value.fullName,
        //   phone: profileData.value.phone
        // })

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

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
        updatingProfile.value = false;
      }
    };

    // Change password
    const changePassword = async () => {
      changingPassword.value = true;

      try {
        // This would be an API call in a real app
        // await api.put('/customer/password', {
        //   currentPassword: passwordData.value.currentPassword,
        //   newPassword: passwordData.value.newPassword
        // })

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        passwordData.value.currentPassword = "";
        passwordData.value.newPassword = "";
        passwordData.value.confirmPassword = "";

        $q.notify({
          color: "positive",
          message: "Password changed successfully",
          icon: "check_circle",
        });
      } catch (error) {
        console.error("Error changing password:", error);
        $q.notify({
          color: "negative",
          message: "Failed to change password",
          icon: "error",
        });
      } finally {
        changingPassword.value = false;
      }
    };

    // Address functions
    const addNewAddress = () => {
      addressDialog.value = {
        show: true,
        isEdit: false,
        editIndex: -1,
        saving: false,
        data: {
          label: "",
          fullAddress: "",
          isDefault: false,
        },
      };
    };

    const editAddress = (index) => {
      const address = profileData.value.addresses[index];

      addressDialog.value = {
        show: true,
        isEdit: true,
        editIndex: index,
        saving: false,
        data: {
          label: address.label,
          fullAddress: address.fullAddress,
          isDefault: address.isDefault,
        },
      };
    };

    const saveAddress = async () => {
      addressDialog.value.saving = true;

      try {
        // This would be an API call in a real app
        // const payload = {
        //   label: addressDialog.value.data.label,
        //   fullAddress: addressDialog.value.data.fullAddress,
        //   isDefault: addressDialog.value.data.isDefault
        // }
        //
        // if (addressDialog.value.isEdit) {
        //   await api.put(`/customer/addresses/${profileData.value.addresses[addressDialog.value.editIndex].id}`, payload)
        // } else {
        //   await api.post('/customer/addresses', payload)
        // }

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Update local state
        if (addressDialog.value.isEdit) {
          profileData.value.addresses[addressDialog.value.editIndex] = {
            ...addressDialog.value.data,
          };
        } else {
          profileData.value.addresses.push({ ...addressDialog.value.data });
        }

        // If setting as default, update other addresses
        if (addressDialog.value.data.isDefault) {
          profileData.value.addresses.forEach((address, idx) => {
            if (addressDialog.value.isEdit) {
              if (idx !== addressDialog.value.editIndex) {
                address.isDefault = false;
              }
            } else {
              if (idx !== profileData.value.addresses.length - 1) {
                address.isDefault = false;
              }
            }
          });
        }

        $q.notify({
          color: "positive",
          message: `Address ${
            addressDialog.value.isEdit ? "updated" : "added"
          } successfully`,
          icon: "check_circle",
        });

        addressDialog.value.show = false;
      } catch (error) {
        console.error("Error saving address:", error);
        $q.notify({
          color: "negative",
          message: `Failed to ${
            addressDialog.value.isEdit ? "update" : "add"
          } address`,
          icon: "error",
        });
      } finally {
        addressDialog.value.saving = false;
      }
    };

    const confirmDeleteAddress = (index) => {
      confirmDialog.value = {
        show: true,
        title: "Delete Address",
        message: "Are you sure you want to delete this address?",
        action: "deleteAddress",
        data: index,
      };
    };

    const deleteAddress = async (index) => {
      try {
        // This would be an API call in a real app
        // await api.delete(`/customer/addresses/${profileData.value.addresses[index].id}`)

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        profileData.value.addresses.splice(index, 1);

        $q.notify({
          color: "positive",
          message: "Address deleted successfully",
          icon: "check_circle",
        });
      } catch (error) {
        console.error("Error deleting address:", error);
        $q.notify({
          color: "negative",
          message: "Failed to delete address",
          icon: "error",
        });
      }
    };

    const setDefaultAddress = async (index) => {
      try {
        // This would be an API call in a real app
        // await api.put(`/customer/addresses/${profileData.value.addresses[index].id}/default`)

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Update local state
        profileData.value.addresses.forEach((address, idx) => {
          address.isDefault = idx === index;
        });

        $q.notify({
          color: "positive",
          message: "Default address updated",
          icon: "check_circle",
        });
      } catch (error) {
        console.error("Error setting default address:", error);
        $q.notify({
          color: "negative",
          message: "Failed to update default address",
          icon: "error",
        });
      }
    };

    // Payment functions
    const addPaymentMethod = () => {
      paymentDialog.value = {
        show: true,
        saving: false,
        data: {
          type: "card",
          name: "",
          cardNumber: "",
          expiryDate: "",
          cvv: "",
          accountNumber: "",
          isDefault: false,
        },
      };
    };

    const savePaymentMethod = async () => {
      paymentDialog.value.saving = true;

      try {
        // This would be an API call in a real app
        // const payload = { ...paymentDialog.value.data }
        // await api.post('/customer/payment-methods', payload)

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Update local state
        const newPayment = {
          type: paymentDialog.value.data.type,
          isDefault: paymentDialog.value.data.isDefault,
        };

        if (paymentDialog.value.data.type === "card") {
          newPayment.name = paymentDialog.value.data.name;
          newPayment.cardNumber =
            "**** **** **** " + paymentDialog.value.data.cardNumber.slice(-4);
          newPayment.expiryDate = paymentDialog.value.data.expiryDate;
        } else if (paymentDialog.value.data.type === "gcash") {
          newPayment.accountNumber = paymentDialog.value.data.accountNumber;
        }

        profileData.value.paymentMethods.push(newPayment);

        // If setting as default, update other payment methods
        if (paymentDialog.value.data.isDefault) {
          profileData.value.paymentMethods.forEach((payment, idx) => {
            if (idx !== profileData.value.paymentMethods.length - 1) {
              payment.isDefault = false;
            }
          });
        }

        $q.notify({
          color: "positive",
          message: "Payment method added successfully",
          icon: "check_circle",
        });

        paymentDialog.value.show = false;
      } catch (error) {
        console.error("Error adding payment method:", error);
        $q.notify({
          color: "negative",
          message: "Failed to add payment method",
          icon: "error",
        });
      } finally {
        paymentDialog.value.saving = false;
      }
    };

    const confirmDeletePayment = (index) => {
      confirmDialog.value = {
        show: true,
        title: "Delete Payment Method",
        message: "Are you sure you want to delete this payment method?",
        action: "deletePayment",
        data: index,
      };
    };

    const deletePayment = async (index) => {
      try {
        // This would be an API call in a real app
        // await api.delete(`/customer/payment-methods/${profileData.value.paymentMethods[index].id}`)

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        profileData.value.paymentMethods.splice(index, 1);

        $q.notify({
          color: "positive",
          message: "Payment method deleted successfully",
          icon: "check_circle",
        });
      } catch (error) {
        console.error("Error deleting payment method:", error);
        $q.notify({
          color: "negative",
          message: "Failed to delete payment method",
          icon: "error",
        });
      }
    };

    const setDefaultPayment = async (index) => {
      try {
        // This would be an API call in a real app
        // await api.put(`/customer/payment-methods/${profileData.value.paymentMethods[index].id}/default`)

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Update local state
        profileData.value.paymentMethods.forEach((payment, idx) => {
          payment.isDefault = idx === index;
        });

        $q.notify({
          color: "positive",
          message: "Default payment method updated",
          icon: "check_circle",
        });
      } catch (error) {
        console.error("Error setting default payment method:", error);
        $q.notify({
          color: "negative",
          message: "Failed to update default payment method",
          icon: "error",
        });
      }
    };

    // Helper functions
    const getPaymentIcon = (type) => {
      const icons = {
        card: "credit_card",
        gcash: "account_balance_wallet",
        cod: "payments",
      };
      return icons[type] || "credit_card";
    };

    const getPaymentDescription = (payment) => {
      if (payment.type === "card") {
        return `${payment.cardNumber} · Expires ${payment.expiryDate}`;
      } else if (payment.type === "gcash") {
        return `Account: ${payment.accountNumber}`;
      } else if (payment.type === "cod") {
        return "Pay with cash upon delivery";
      }
      return "";
    };

    const confirmAction = () => {
      const { action, data } = confirmDialog.value;

      if (action === "deleteAddress") {
        deleteAddress(data);
      } else if (action === "deletePayment") {
        deletePayment(data);
      }
    };

    onMounted(() => {
      loadProfile();
    });

    return {
      loading,
      profileData,
      passwordData,
      updatingProfile,
      changingPassword,
      addressDialog,
      paymentDialog,
      confirmDialog,
      paymentTypeOptions,
      updateProfile,
      changePassword,
      addNewAddress,
      editAddress,
      saveAddress,
      confirmDeleteAddress,
      setDefaultAddress,
      addPaymentMethod,
      savePaymentMethod,
      confirmDeletePayment,
      setDefaultPayment,
      getPaymentIcon,
      getPaymentDescription,
      confirmAction,
    };
  },
});
</script>

<style lang="scss" scoped>
.profile-card {
  height: 100%;
}
</style>
