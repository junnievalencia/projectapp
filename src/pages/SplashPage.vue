<template>
  <q-page class="bg-white">
    <div class="splash-container absolute-center">
      <q-carousel
        v-model="slide"
        animated
        swipeable
        infinite
        :autoplay="autoplay"
        arrows
        transition-prev="slide-right"
        transition-next="slide-left"
        @mouseenter="autoplay = false"
        @mouseleave="autoplay = true"
        height="100%"
      >
        <!-- First Slide: Delicious Food -->
        <q-carousel-slide name="food" class="text-center">
          <div class="splash-content text-center">
            <div class="q-mt-xl">
              <img src="../assets/food.png" alt="Food" class="splash-illustration" />
            </div>
          </div>
        </q-carousel-slide>

        <!-- Second Slide: Fast Delivery -->
        <q-carousel-slide name="delivery" class="text-center">
          <div class="splash-content text-center">
            <div class="q-mt-xl">
              <img src="../assets/delivery.png" alt="Delivery" class="splash-illustration" />
            </div>

          </div>
        </q-carousel-slide>
      </q-carousel>

      <q-btn
              push color="orange"
              class="q-mt-xl full-width get-started-btn"
              size="lg"
              label="GET STARTED"
              @click="navigateToLogin"
              rounded
              style="width: 280px; height: 39px; font-size: 16px; font-weight: 600; top: 10px; border-radius: 20px;"
            />
    </div>
  </q-page>
</template>

<script>
import { useRouter } from 'vue-router'

export default {
  name: 'SplashPage',
  setup () {
    const router = useRouter()

    const navigateToLogin = () => {
      router.push('/login')
    }

    return {
      navigateToLogin
    }
  },
  data () {
    return {
      slide: 'food',
      autoplay: true
    }
  }
}
</script>

<style lang="scss" scoped>
.splash-container {
  width: 100%;
  max-width: 400px;
  height: 100vh;
  max-height: 400px;
  padding: 20px;
  background-color: white;
  border-radius: 20px;
}

.splash-content {
  width: 100%;
  padding: 20px;
}

.splash-illustration {
  width: 250px;
  height: 250px;
  object-fit: contain;
}

.get-started-btn {
  box-shadow: 0 4px 6px rgba(255, 140, 0, 0.2);
  transition: transform 0.2s;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(255, 140, 0, 0.3);
  }
}

/* Add a light pink circular background to the food illustration */
.q-carousel-slide[name="food"] .splash-illustration {
  background-color: rgba(255, 192, 203, 0.2);
  border-radius: 50%;
  padding: 20px;
}

/* Add a light purple circular background to the delivery illustration */
.q-carousel-slide[name="delivery"] .splash-illustration {
  background-color: rgba(230, 190, 255, 0.2);
  border-radius: 50%;
  padding: 20px;
}
</style>
