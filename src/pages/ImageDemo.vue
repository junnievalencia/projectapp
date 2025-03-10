<template>
  <q-page class="q-pa-md">
    <div class="text-h4 q-mb-md">Image Import Demo</div>

    <!-- Method 1: Direct import and use in template -->
    <div class="q-mb-lg">
      <div class="text-subtitle1 q-mb-sm">Method 1: Direct import in template</div>
      <img src="../assets/logo.png" alt="Logo" style="width: 200px">
    </div>

    <!-- Method 2: Import as a variable -->
    <div class="q-mb-lg">
      <div class="text-subtitle1 q-mb-sm">Method 2: Import as a variable</div>
      <img :src="logoImage" alt="Logo" style="width: 200px">
    </div>

    <!-- Method 3: Dynamic import using require -->
    <div class="q-mb-lg">
      <div class="text-subtitle1 q-mb-sm">Method 3: Dynamic import</div>
      <img :src="dynamicImage" alt="Dynamic Image" style="width: 200px">
    </div>

    <!-- Method 4: Using as background image -->
    <div class="q-mb-lg">
      <div class="text-subtitle1 q-mb-sm">Method 4: Background image</div>
      <div class="bg-image"></div>
    </div>
  </q-page>
</template>

<script>
// Method 2: Import image as a variable
import logoImage from '../assets/logo.png'

export default {
  name: 'ImageDemo',
  data () {
    return {
      // Method 2: Use imported image
      logoImage,
      // Method 3: Dynamic import
      dynamicImage: require('../assets/logo.png')
    }
  }
}
</script>

<style lang="scss" scoped>
.bg-image {
  /* Method 4: Use image as background */
  background-image: url('../assets/logo.png');
  background-size: contain;
  background-repeat: no-repeat;
  width: 200px;
  height: 200px;
}
</style>
