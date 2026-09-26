# Readis

Readis is a React Native + Expo mobile app prototype for community disaster reporting and preparedness learning.

The app lets users create incident reports, view reports on a Feed and Map, read preparedness guides, complete quizzes, check readiness progress, and create community guides.

## How to run the app locally

### 1. Install dependencies

Open the project folder in your terminal and run:

```bash
npm install
````

### 2. Start Expo

Run:

```bash
npx expo start --clear
```

Expo will start the development server and show a QR code in the terminal. It may also open the Expo development page in your browser.

## Running on web

After Expo starts, press:

```bash
w
```

This opens the app in your web browser.

The web version is useful for quick testing, but some mobile features such as camera, location permissions, native maps and notifications may behave differently from a real phone.

## Running on iOS Simulator

This option requires a Mac with Xcode installed.

1. Install Xcode from the Mac App Store.
2. Open Xcode once and allow it to finish installing required components.
3. Start Expo:

```bash
npx expo start --clear
```

4. Press:

```bash
i
```

Expo will try to open the app in the iOS Simulator.

If the simulator does not open, open Xcode first and check that an iOS simulator is installed under **Xcode > Settings > Platforms**.

## Running on Android Emulator

This option requires Android Studio and an Android emulator.

1. Install Android Studio.
2. Open Android Studio and install the required Android SDK components.
3. Create an emulator from **Device Manager**.
4. Start the emulator before running the app.
5. In the project terminal, run:

```bash
npx expo start --clear
```

6. Press:

```bash
a
```

Expo will try to open the app in the Android emulator.

If Expo cannot find the emulator, make sure Android Studio is installed correctly and that the emulator is already running.

## Running on a phone with Expo Go using QR code

This is the easiest way to test the app on a real device.

### 1. Install Expo Go

Install **Expo Go** on your phone:

* iPhone: download **Expo Go** from the App Store.
* Android: download **Expo Go** from the Google Play Store.

### 2. Connect to the same Wi-Fi

Make sure your phone and computer are connected to the same Wi-Fi network.

### 3. Start Expo

In the project folder, run:

```bash
npx expo start --clear
```

### 4. Scan the QR code

Expo will show a QR code in the terminal or browser page.

For iPhone:

* Open the Camera app and scan the QR code; or
* Open Expo Go and scan the QR code from there.

For Android:

* Open Expo Go.
* Tap **Scan QR code**.
* Scan the QR code shown by Expo.

The app should open inside Expo Go.

### If the QR code does not work

Try starting Expo with tunnel mode:

```bash
npx expo start --tunnel --clear
```

This can help when the phone and computer cannot connect directly through the local network.

## What to expect when using the app

You should see the main Readis tabs:

* **Feed** — view recent incident reports and weather context.
* **Map** — view reported incidents on a map.
* **Report** — create a new incident report with location and optional image evidence.
* **Guides** — read Team Guides and Community Guides.
* **Profile** — view readiness score, recent progress and notification settings.

Some features may ask for permission only when needed:

* Location permission is requested when using current location or Find Me.
* Camera/photo permission is requested when adding image evidence.
* Notification permission is requested when enabling alerts.

If a permission is denied, the app should still allow the main local workflows to continue.

## Optional community API

The app can run without the API. By default, it works locally on one device.

The optional API is only needed if you want to test sharing reports or guides between two running devices on the same network.

In a second terminal, run:

```bash
node backend/server.js
```

Then start Expo with your computer’s local network IP address:

```bash
EXPO_PUBLIC_READIS_API_URL=http://YOUR_LAN_IP:4000 npx expo start --clear
```

Example:

```bash
EXPO_PUBLIC_READIS_API_URL=http://192.168.1.10:4000 npx expo start --clear
```

For browser testing on the same computer, you can use:

```bash
EXPO_PUBLIC_READIS_API_URL=http://localhost:4000 npx expo start --clear
```

## Running tests

To run the main verification scripts:

```bash
npm run test:all
```
