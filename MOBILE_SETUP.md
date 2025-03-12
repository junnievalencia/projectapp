# BUsinessHub Mobile Setup Guide

This guide will help you set up and run the BUsinessHub app on iOS and Android devices.

## Prerequisites

- Node.js (v16 or higher)
- npm (v6.13.4 or higher)
- For iOS:
  - macOS computer
  - Xcode (latest version)
  - CocoaPods (`sudo gem install cocoapods`)
  - iOS device or simulator
- For Android:
  - Android Studio (latest version)
  - Android SDK
  - Android device or emulator

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the app for Capacitor:
   ```bash
   npm run cap:build
   ```

3. Sync Capacitor changes:
   ```bash
   npm run cap:sync
   ```

## Running on Android

1. Open Android Studio:
   ```bash
   npx cap open android
   ```

2. Or use the development command:
   ```bash
   npm run cap:android
   ```

3. Connect your Android device via USB with USB debugging enabled, or use an emulator.

4. Click the "Run" button in Android Studio or let the Quasar CLI handle it.

## Running on iOS (requires macOS)

1. Open Xcode:
   ```bash
   npx cap open ios
   ```

2. Or use the development command:
   ```bash
   npm run cap:ios
   ```

3. Connect your iOS device or select a simulator.

4. Click the "Run" button in Xcode or let the Quasar CLI handle it.

## Building for Production

### Android

1. Build for production:
   ```bash
   npm run cap:build:android
   ```

2. Open Android Studio:
   ```bash
   npx cap open android
   ```

3. Generate a signed APK or App Bundle:
   - In Android Studio, go to Build > Generate Signed Bundle/APK
   - Follow the wizard to create or use an existing keystore
   - Select release build variant
   - Complete the process to generate your APK or AAB file

### iOS

1. Build for production:
   ```bash
   npm run cap:build:ios
   ```

2. Open Xcode:
   ```bash
   npx cap open ios
   ```

3. Configure signing:
   - In Xcode, select your project in the Project Navigator
   - Select your app target
   - Go to the "Signing & Capabilities" tab
   - Configure your team and signing certificate

4. Archive for distribution:
   - Select a real device as the build target (not a simulator)
   - Go to Product > Archive
   - Once archiving is complete, the Organizer window will open
   - Choose your distribution method (App Store, Ad Hoc, etc.)
   - Follow the prompts to complete the process

## Troubleshooting

### Android Issues

- If you encounter build errors, try:
  ```bash
  npx cap clean android
  npm run cap:sync
  ```

- Make sure your Android SDK is properly configured in Android Studio.

### iOS Issues

- If you encounter CocoaPods issues:
  ```bash
  cd ios/App
  pod install
  ```

- Ensure you have the correct Xcode command-line tools selected:
  ```bash
  sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
  ```

## Additional Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Quasar Capacitor Guide](https://quasar.dev/quasar-cli-webpack/developing-capacitor-apps/introduction)
