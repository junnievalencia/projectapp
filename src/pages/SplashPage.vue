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
        <!-- First Slide: Merchant Dashboard -->
        <q-carousel-slide name="dashboard" class="text-center">
          <div class="splash-content text-center">
            <div class="q-mt-xl">
              <img src="../assets/splash1.png" alt="Dashboard" class="splash-illustration" />
              <div class="q-mt-md text-h6 text-weight-bold">Merchant Dashboard</div>
              <div class="q-mt-md text-subtitle1 text-black">Manage your food items and orders efficiently</div>
            </div>
          </div>
        </q-carousel-slide>

        <!-- Second Slide: Order Management -->
        <q-carousel-slide name="orders" class="text-center">
          <div class="splash-content text-center">
            <div class="q-mt-xl">
              <img src="../assets/splash2.png" alt="Orders" class="splash-illustration" />
              <div class="q-mt-md text-h6 text-weight-bold">Order Management</div>
              <div class="q-mt-md text-subtitle1 text-black">Track and fulfill customer orders easily</div>
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
import { useSplashPage } from './SplashPage.js'

export default {
  name: 'SplashPage',
  setup () {
    const { navigateToLogin, Platform, slide, autoplay } = useSplashPage()

    return {
      navigateToLogin,
      Platform,
      slide,
      autoplay
    }
  }
}
</script>

<style lang="scss" scoped>
.splash-container {
  width: 100%;
  max-width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  padding: 0px;
  background-color: white;

  /* Adjust for mobile devices */
  @media (max-width: 599px) {
    height: 100vh;
    justify-content: space-between;
    padding-top: 10vh;
    padding-bottom: 5vh;
  }

  /* Specific iOS adjustments */
  :global(.ios-device) & {
    /* iOS safe areas - adjust for notch */
    padding-top: env(safe-area-inset-top, 0);
    padding-bottom: env(safe-area-inset-bottom, 20px);
  }

  /* Specific Android adjustments */
  :global(.android-device) & {
    /* Android may need different adjustments */
    padding-top: 10px;
  }
}

.q-panel {
  padding: 0px;
}

.splash-content {
  width: 100%;
  padding: 20px;

  @media (max-width: 599px) {
    padding: 10px;
  }
}

.splash-illustration {
  width: 250px;
  height: 250px;
  object-fit: contain;

  @media (max-width: 599px) {
    width: 200px;
    height: 200px;
  }

  @media (max-height: 700px) {
    width: 180px;
    height: 180px;
  }
}

.button-container {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 0 20px;
  margin-top: 20px;

  @media (max-width: 599px) {
    padding: 0 15px;
    margin-top: 10px;
  }

  /* iOS safe area bottom adjustment */
  :global(.ios-device) & {
    margin-bottom: env(safe-area-inset-bottom, 0);
  }
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

  @media (max-width: 599px) {
    width: 100%;
    max-width: 280px;
  }
}

/* Add a light orange circular background to the dashboard illustration */
.q-carousel-slide[name="dashboard"] .splash-illustration {
  background-color: rgba(255, 192, 103, 0.2);
  border-radius: 50%;
  padding: 20px;
}

/* Add a light blue circular background to the orders illustration */
.q-carousel-slide[name="orders"] .splash-illustration {
  background-color: rgba(190, 220, 255, 0.2);
  border-radius: 50%;
  padding: 20px;
}

/* Touch-friendly adjustments */
.q-carousel-slide {
  touch-action: pan-y;
}
</style> 