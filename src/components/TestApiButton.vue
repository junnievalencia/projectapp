<template>
  <div class="q-pa-md">
    <q-btn color="primary" label="Test Register API" @click="testRegisterApi" />
    <q-btn color="secondary" class="q-ml-sm" label="Test Login API" @click="testLoginApi" />

    <div v-if="response" class="q-mt-md">
      <h5>API Response:</h5>
      <pre>{{ JSON.stringify(response, null, 2) }}</pre>
    </div>

    <div v-if="error" class="q-mt-md text-negative">
      <h5>API Error:</h5>
      <pre>{{ JSON.stringify(error, null, 2) }}</pre>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue';
import axios from 'axios';

export default defineComponent({
  name: 'TestApiButton',

  setup() {
    const response = ref(null);
    const error = ref(null);

    const testRegisterApi = async () => {
      try {
        response.value = null;
        error.value = null;

        // Test data that matches the backend's expected format EXACTLY
        const testData = {
          email: 'test@example.com',
          password: 'testpassword123',
          name: 'Test User',
          phone: '1234567890',
          role: 'customer'
        };

        console.log('Sending direct test registration:', testData);

        const result = await axios.post('http://localhost:5000/api/auth/register', testData);
        response.value = result.data;
      } catch (err) {
        console.error('Test API Error:', err);
        error.value = {
          message: err.message,
          response: err.response?.data || 'No response data'
        };
      }
    };

    const testLoginApi = async () => {
      try {
        response.value = null;
        error.value = null;

        const testCredentials = {
          email: 'test@example.com',
          password: 'testpassword123'
        };

        console.log('Sending direct test login:', testCredentials);

        const result = await axios.post('http://localhost:5000/api/auth/login', testCredentials);
        response.value = result.data;
      } catch (err) {
        console.error('Test API Error:', err);
        error.value = {
          message: err.message,
          response: err.response?.data || 'No response data'
        };
      }
    };

    return {
      response,
      error,
      testRegisterApi,
      testLoginApi
    };
  }
});
</script>
