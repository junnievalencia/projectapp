<template>
  <q-page class="bg-white">
    <div class="splash-container">
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
        height="80%"
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

      <div class="button-container q-mt-md">
        <q-btn
          push
          color="orange"
          class="full-width get-started-btn"
          size="lg"
          label="GET STARTED"
          @click="navigateToLogin"
          rounded
        />
      </div>
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
      console.log('Navigating to login page')
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
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  padding: 20px;
  background-color: white;
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

.button-container {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 0 20px;
  margin-top: 20px;
}

.get-started-btn {
  width: 280px;
  height: 50px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 25px;
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
