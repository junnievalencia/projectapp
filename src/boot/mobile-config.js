import { boot } from 'quasar/wrappers'
import { Platform, Dark } from 'quasar'

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async ({ app }) => {
  // Set up platform-specific configurations
  if (Platform.is.capacitor) {
    console.log('Running on Capacitor')

    // Import Capacitor plugins only when running on mobile
    try {
      const { StatusBar } = await import('@capacitor/status-bar')
      const { SplashScreen } = await import('@capacitor/splash-screen')

      // Configure status bar
      if (Platform.is.ios) {
        StatusBar.setStyle({ style: Dark.isActive ? 'DARK' : 'LIGHT' })
        StatusBar.setBackgroundColor({ color: '#ffffff' })
      } else if (Platform.is.android) {
        StatusBar.setBackgroundColor({ color: '#ff9800' }) // Orange to match your theme
      }

      // Hide splash screen with fade
      SplashScreen.hide({
        fadeOutDuration: 500
      })

      // Listen for dark mode changes
      Dark.watch((isDark) => {
        if (Platform.is.ios) {
          StatusBar.setStyle({ style: isDark ? 'DARK' : 'LIGHT' })
        }
      })
    } catch (err) {
      console.error('Error loading Capacitor plugins:', err)
    }
  }
})
