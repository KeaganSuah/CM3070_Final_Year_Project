# Readis MVP 10

Readis is a React Native + Expo mobile app prototype for community disaster reporting and preparedness learning.

The app lets users create incident reports, view reports on a Feed and Map, read preparedness guides, complete quizzes, check readiness progress, and create community guides.

## How to run the app locally

### 1. Install dependencies

Open the project folder in your terminal and run:

```bash
npm install
```

### 2. Start Expo

Run:

```bash
npx expo start --clear
```

Expo will open a local development page in your browser.

## Running on web

Press:

```bash
w
```

This opens the app in your web browser.

The web version is useful for quick testing, but some mobile features such as camera, location permissions, native maps and notifications may behave differently from a real phone.

## Running on a phone with Expo Go

1. Install **Expo Go** on your phone.
2. Make sure your phone and computer are on the same Wi-Fi network.
3. Run:

```bash
npx expo start --clear
```

4. Scan the QR code shown in the terminal or Expo browser page.

For iPhone, use the Camera app or Expo Go to scan the QR code.

## What to expect when using the app

You should see the main Readis tabs:

- **Feed** — view recent incident reports and weather context.
- **Map** — view reported incidents on a map.
- **Report** — create a new incident report with location and optional image evidence.
- **Guides** — read Team Guides and Community Guides.
- **Profile** — view readiness score, recent progress and notification settings.

Some features may ask for permission only when needed:

- Location permission is requested when using current location or Find Me.
- Camera/photo permission is requested when adding image evidence.
- Notification permission is requested when enabling alerts.

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

This checks the main prototype logic, API behaviour, simple security cases and basic performance smoke tests.
