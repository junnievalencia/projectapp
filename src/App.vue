<template>
  <div>
    <router-view />
  </div>
</template>

<script>
import { defineComponent, onMounted } from 'vue';
import { useQuasar } from 'quasar';

export default defineComponent({
  name: 'App',

  setup() {
    const $q = useQuasar();

    onMounted(() => {
      // Check if app is running in mock mode
      const urlParams = new URLSearchParams(window.location.search);
      const mockMode = urlParams.get('mock') === 'true';

      if (mockMode) {
        $q.notify({
          message: 'App is running in MOCK MODE. Server interactions are simulated.',
          color: 'warning',
          position: 'top',
          timeout: 5000,
          multiLine: true,
          actions: [
            { label: 'Dismiss', color: 'white' }
          ]
        });
      }
    });

    return {};
  }
});
</script>
