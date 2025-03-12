import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bufood.orders',
  appName: 'BUsinessHub',
  webDir: 'dist/spa',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    hostname: 'app'
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    appendUserAgent: 'BUsinessHub Android App',
    backgroundColor: '#FFFFFF'
  },
  ios: {
    contentInset: 'always',
    allowsLinkPreview: false,
    scrollEnabled: true,
    appendUserAgent: 'BUsinessHub iOS App',
    backgroundColor: '#FFFFFF',
    limitsNavigationsToAppBoundDomains: true
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: '#FFFFFF',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerColor: '#FF9800',
      splashFullScreen: true,
      splashImmersive: true
    }
  }
};

export default config;
