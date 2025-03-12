import { useRouter } from 'vue-router'
import { Platform } from 'quasar'
import { onMounted, ref } from 'vue'

export function useSplashPage () {
  const router = useRouter()
  const slide = ref('food')
  const autoplay = ref(true)

  const navigateToLogin = () => {
    console.log('Navigating to login page')
    router.push('/login')
  }

  onMounted(() => {
    // Check platform and apply specific styles if needed
    if (Platform.is.ios) {
      console.log('Running on iOS device')
      // iOS specific adjustments could be made here
      document.documentElement.classList.add('ios-device')
    } else if (Platform.is.android) {
      console.log('Running on Android device')
      // Android specific adjustments could be made here
      document.documentElement.classList.add('android-device')
    }
  })

  return {
    navigateToLogin,
    Platform,
    slide,
    autoplay
  }
}
