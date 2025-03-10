import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bufood.orders',
  appName: 'BUsinessHub',
  webDir: 'dist/spa',
  server: {
    androidScheme: 'https'
  }
};

export default config;
