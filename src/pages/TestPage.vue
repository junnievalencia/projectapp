<template>
  <q-page class="q-pa-md">
    <h1 class="text-h4 q-mb-lg">API Testing Page</h1>
    <div class="q-mb-lg">
      <p>Use the buttons below to test direct API communication with the backend:</p>
    </div>
    <test-api-button />
  </q-page>
</template>

<script>
import { defineComponent } from 'vue';
import TestApiButton from 'components/TestApiButton.vue';

export default defineComponent({
  name: 'TestPage',

  components: {
    TestApiButton
  }
});
</script>
