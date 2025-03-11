<template>
  <q-page class="bg-grey-1">
    <div class="q-pa-md">
      <h1>Store Test Page</h1>
      <p>This is a simplified version of the store page to identify issues.</p>

      <q-btn color="primary" label="Go Back" @click="$router.go(-1)" />
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'StoreTest',

  setup () {
    console.log('StoreTest component is initializing')

    return {}
  }
})
</script>
