# 🦉 Tamil English Learning App — Full Build & APK Guide

A Duolingo-style English learning app for Tamil speakers, built with React + Tailwind CSS + Claude AI, packaged as an Android APK using Capacitor.

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Prerequisites](#3-prerequisites)
4. [Project Setup](#4-project-setup)
5. [App Architecture](#5-app-architecture)
6. [Claude API Integration](#6-claude-api-integration)
7. [Building the React App](#7-building-the-react-app)
8. [Converting to Android APK (Capacitor)](#8-converting-to-android-apk-capacitor)
9. [APK Build — Step by Step](#9-apk-build--step-by-step)
10. [Signing the APK for Release](#10-signing-the-apk-for-release)
11. [Testing on Device / Emulator](#11-testing-on-device--emulator)
12. [Storage Strategy](#12-storage-strategy)
13. [Web Speech API in APK](#13-web-speech-api-in-apk)
14. [Folder Structure](#14-folder-structure)
15. [Environment Variables](#15-environment-variables)
16. [Troubleshooting](#16-troubleshooting)

---

## 1. Project Overview

| Feature | Details |
|---|---|
| Language | English + Tamil (bilingual) |
| Target Users | Tamil speakers learning English |
| Platform | Web → Android APK (iOS possible too) |
| AI Backend | Anthropic Claude API (`claude-sonnet-4-20250514`) |
| Storage | `window.localStorage` (mapped as `window.storage`) |
| Speech | Web Speech API (SpeechSynthesis + SpeechRecognition) |

### App Tabs
| Tab | Purpose |
|---|---|
| 🏠 Home | Dashboard, streak, Word of Day, XP |
| 📚 Learn | Progressive lessons (Beginner → Advanced) |
| 🎮 Games | Word puzzle, fill-blank, match pairs, emoji quiz |
| 📖 Dictionary | Claude-powered lookup + sentence checker |
| 👤 Profile | User stats, weak words, activity chart |

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 18 (Vite) |
| Styling | Tailwind CSS v3 |
| AI | Anthropic Claude API (`@anthropic-ai/sdk`) |
| Mobile Wrapper | Capacitor v6 |
| Android Build | Android Studio + Gradle |
| Package Manager | npm |
| Language | JavaScript (JSX) |

---

## 3. Prerequisites

Install all of the following before starting:

### 3a. Node.js & npm
- Download from https://nodejs.org (LTS version, v20+)
- Verify: `node -v` and `npm -v`

### 3b. Java Development Kit (JDK 17)
- Required by Android build tools
- Download: https://adoptium.net (Eclipse Temurin JDK 17)
- After install, set environment variable:
  ```
  JAVA_HOME = C:\Program Files\Eclipse Adoptium\jdk-17.x.x.x-hotspot
  ```
- Add to PATH: `%JAVA_HOME%\bin`
- Verify: `java -version`

### 3c. Android Studio
- Download: https://developer.android.com/studio
- During install, include:
  - Android SDK
  - Android SDK Platform-Tools
  - Android Emulator
  - SDK Platform: Android 14 (API 34) or API 33
- Set environment variables:
  ```
  ANDROID_HOME = C:\Users\<YourName>\AppData\Local\Android\Sdk
  ```
- Add to PATH:
  ```
  %ANDROID_HOME%\platform-tools
  %ANDROID_HOME%\tools
  %ANDROID_HOME%\tools\bin
  ```
- Verify: `adb --version`

### 3d. Gradle (auto-managed by Android Studio, but verify)
- Verify inside Android Studio: File → Project Structure → SDK Location

### 3e. Git
- Download: https://git-scm.com
- Verify: `git --version`

---

## 4. Project Setup

### Step 1 — Create Vite + React project

```bash
npm create vite@latest tamil-english-app -- --template react
cd tamil-english-app
npm install
```

### Step 2 — Install Tailwind CSS

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Edit `tailwind.config.js`:
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        tamil: ["Noto Sans Tamil", "sans-serif"],
      },
    },
  },
  plugins: [],
}
```

Edit `src/index.css` — add at the top:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;700&display=swap');
```

### Step 3 — Install Anthropic SDK

```bash
npm install @anthropic-ai/sdk
```

### Step 4 — Install Capacitor

```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android
npx cap init
```

When `cap init` asks:
- App Name: `Tamil English App`
- App ID: `com.yourname.tamilenglish`
- Web Dir: `dist`

---

## 5. App Architecture

```
src/
├── App.jsx                  ← Root component, tab router, storage init
├── main.jsx                 ← Entry point
├── storage.js               ← window.storage wrapper (uses localStorage)
├── claudeApi.js             ← All Claude API calls centralized
├── components/
│   ├── BottomNav.jsx        ← Tab bar navigation
│   ├── Mascot.jsx           ← Animated 🦉 owl with speech bubble
│   ├── ReminderBanner.jsx   ← Streak reminder in Tamil
│   ├── ConfettiEffect.jsx   ← Celebration animation
│   └── LoadingSpinner.jsx   ← "கொஞ்சம் காத்திருங்கள்..."
├── tabs/
│   ├── HomeTab.jsx          ← Dashboard
│   ├── LearnTab.jsx         ← Lessons browser
│   ├── GamesTab.jsx         ← All 5 game modes
│   ├── DictionaryTab.jsx    ← Search + AI + sentence builder
│   └── ProfileTab.jsx       ← Stats, weak words, activity chart
├── games/
│   ├── WordPuzzle.jsx       ← Drag-and-drop letter tiles
│   ├── FillBlank.jsx        ← Multiple choice fill-in
│   ├── MatchPair.jsx        ← Tap-to-match pairs
│   ├── EmojiQuiz.jsx        ← Guess word from emoji
│   └── SpeakingChallenge.jsx← Speech recognition game
└── data/
    ├── lessons.js           ← All lesson content (words, sentences)
    └── wordOfDay.js         ← 30-day rotating Word of Day list
```

---

## 6. Claude API Integration

### IMPORTANT — API Key Security

Never hardcode your API key in frontend code. For development use `.env`:

```
VITE_CLAUDE_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxx
```

For the APK (production), use a backend proxy:
- Deploy a tiny Node.js/Express server on Railway, Render, or Vercel
- The app calls YOUR server → your server calls Claude API
- This hides the key from the APK binary

### claudeApi.js — Template

```js
const CLAUDE_MODEL = "claude-sonnet-4-20250514";
const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

export async function lookupWord(word) {
  const response = await fetch(`${API_URL}/api/lookup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ word }),
  });
  if (!response.ok) throw new Error("API பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.");
  return response.json();
}

export async function checkSentence(sentence, word) {
  const response = await fetch(`${API_URL}/api/check-sentence`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sentence, word }),
  });
  if (!response.ok) throw new Error("சரிபார்க்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.");
  return response.json();
}
```

### Backend proxy (Node.js/Express) — server.js

```js
import Anthropic from "@anthropic-ai/sdk";
import express from "express";
import cors from "cors";

const app = express();
const client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

app.use(cors());
app.use(express.json());

app.post("/api/lookup", async (req, res) => {
  const { word } = req.body;
  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [{
      role: "user",
      content: `The user is a Tamil speaker learning English. They searched for the word: "${word}".
Respond ONLY in JSON with these fields:
{
  "word": "string (English)",
  "tamil_meaning": "string",
  "emoji": "string (1 relevant emoji)",
  "part_of_speech": "string",
  "pronunciation": "string (phonetic)",
  "definition": "string (simple English)",
  "tamil_definition": "string",
  "example_sentences": ["3 sentences with Tamil translations as objects: {en, ta}"],
  "synonyms": ["3 English synonyms"],
  "antonyms": ["2 English antonyms"],
  "sentence_builder_prompt": "string (encourage in Tamil)"
}`
    }]
  });
  const text = message.content[0].text;
  const json = JSON.parse(text.match(/\{[\s\S]*\}/)[0]);
  res.json(json);
});

app.post("/api/check-sentence", async (req, res) => {
  const { sentence, word } = req.body;
  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 512,
    messages: [{
      role: "user",
      content: `Check this English sentence written by a Tamil learner: "${sentence}".
Is it grammatically correct? If not, correct it and explain the mistake in Tamil.
Also give one alternative sentence. Respond ONLY in JSON:
{
  "is_correct": boolean,
  "corrected": "string",
  "explanation_tamil": "string",
  "alternative": "string"
}`
    }]
  });
  const text = message.content[0].text;
  const json = JSON.parse(text.match(/\{[\s\S]*\}/)[0]);
  res.json(json);
});

app.listen(3001, () => console.log("Server running on port 3001"));
```

---

## 7. Building the React App

### Development

```bash
npm run dev
```
Opens at `http://localhost:5173`

### Production Build

```bash
npm run build
```
Output goes to `dist/` folder — this is what Capacitor wraps into the APK.

---

## 8. Converting to Android APK (Capacitor)

Capacitor wraps your `dist/` folder in a native Android WebView — giving you a real APK while keeping your React code untouched.

### How it works:

```
React App (dist/)
      ↓
  Capacitor
      ↓
 Android WebView
      ↓
   APK File
```

### capacitor.config.ts

```ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourname.tamilenglish',
  appName: 'Tamil English App',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#7C3AED",
      showSpinner: false,
    }
  }
};

export default config;
```

---

## 9. APK Build — Step by Step

### Step 1 — Build the React app

```bash
npm run build
```

### Step 2 — Add Android platform (first time only)

```bash
npx cap add android
```

This creates an `android/` folder with a full Android Studio project.

### Step 3 — Sync web assets into Android project

```bash
npx cap sync android
```

Run this every time you rebuild the React app.

### Step 4 — Open in Android Studio

```bash
npx cap open android
```

### Step 5 — Build APK in Android Studio

**Option A — Debug APK (for testing):**
- Menu: Build → Build Bundle(s) / APK(s) → Build APK(s)
- Wait for Gradle build (first time takes 5–10 minutes)
- APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

**Option B — Release APK (for distribution):**
- Menu: Build → Generate Signed Bundle / APK
- Choose APK → Next
- Create or select your keystore (see Section 10)
- Choose `release` build variant → Finish
- APK location: `android/app/build/outputs/apk/release/app-release.apk`

**Option C — Command line build (no Android Studio UI):**

```bash
cd android
./gradlew assembleDebug          # debug APK
./gradlew assembleRelease        # release APK (needs keystore)
```

On Windows:
```powershell
cd android
.\gradlew.bat assembleDebug
```

---

## 10. Signing the APK for Release

Unsigned APKs cannot be installed on devices (except debug). For release:

### Step 1 — Generate a keystore (do this once, keep it safe!)

```bash
keytool -genkey -v -keystore tamil-english-release.jks ^
  -alias tamilenglish ^
  -keyalg RSA ^
  -keysize 2048 ^
  -validity 10000
```

You will be prompted for:
- Keystore password (remember this!)
- Key password
- Name, organization, country

### Step 2 — Add signing config to Gradle

Edit `android/app/build.gradle`:

```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file("../../tamil-english-release.jks")
            storePassword "YOUR_KEYSTORE_PASSWORD"
            keyAlias "tamilenglish"
            keyPassword "YOUR_KEY_PASSWORD"
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Step 3 — Build signed release APK

```bash
cd android
.\gradlew.bat assembleRelease
```

Output: `android/app/build/outputs/apk/release/app-release.apk`

---

## 11. Testing on Device / Emulator

### On Android Emulator (Android Studio):
1. Open Android Studio → Device Manager → Create Virtual Device
2. Choose a phone (e.g., Pixel 7, API 34)
3. Start the emulator
4. In Android Studio: Run → Run 'app'

### On a Real Android Device:
1. Enable Developer Options on your phone:
   - Settings → About Phone → tap "Build Number" 7 times
2. Enable USB Debugging:
   - Settings → Developer Options → USB Debugging → ON
3. Connect phone via USB
4. In terminal:
   ```bash
   adb devices           # verify device is listed
   adb install android/app/build/outputs/apk/debug/app-debug.apk
   ```
5. App appears in your phone's app drawer

### Live Reload during development:
```bash
npx cap run android --livereload --external
```

---

## 12. Storage Strategy

The prompt specifies `window.storage`. Implement it as a wrapper over `localStorage`:

```js
// src/storage.js
window.storage = {
  get: (key) => {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : null;
    } catch { return null; }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error("Storage error:", e);
    }
  },
  remove: (key) => localStorage.removeItem(key),
  clear: () => localStorage.clear(),
};
```

Import and call `initStorage()` once in `main.jsx` before rendering.

### Storage Keys Used

| Key | Type | Description |
|---|---|---|
| `user_name` | string | User's display name |
| `user_level` | string | `beginner` / `intermediate` / `advanced` |
| `xp_points` | number | Total XP earned |
| `streak_days` | number | Consecutive days active |
| `last_active_date` | string | ISO date string |
| `lessons_completed` | array | List of completed lesson IDs |
| `words_learned` | array | Words marked as learned |
| `weak_words` | array | Words answered wrong |
| `activity_log` | array | `[{date, lesson, score, accuracy}]` |
| `recent_searches` | array | Last 10 dictionary searches |
| `onboarding_done` | boolean | Whether setup is complete |

---

## 13. Web Speech API in APK

Web Speech API works inside Capacitor's WebView on Android, but requires permissions.

### Add permissions to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.INTERNET" />
```

### Text-to-Speech usage:

```js
export function speak(text, lang = "en-US") {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.85;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}
```

### Speech Recognition usage:

```js
export function startListening(onResult, onError) {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    onError("உங்கள் சாதனம் பேச்சை அங்கீகரிக்கவில்லை.");
    return;
  }
  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.onresult = (e) => onResult(e.results[0][0].transcript);
  recognition.onerror = (e) => onError("பேச்சு பிழை: " + e.error);
  recognition.start();
}
```

---

## 14. Folder Structure

```
tamil-english-app/
├── android/                    ← Generated by Capacitor (do not edit manually)
│   └── app/
│       ├── build/
│       │   └── outputs/apk/   ← Final APK files here
│       └── src/main/
│           └── AndroidManifest.xml
├── dist/                       ← React production build (auto-generated)
├── public/
│   └── icon.png                ← App icon (512×512 recommended)
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── storage.js
│   ├── claudeApi.js
│   ├── components/
│   ├── tabs/
│   ├── games/
│   └── data/
├── server/                     ← Backend proxy (deploy separately)
│   ├── server.js
│   └── package.json
├── capacitor.config.ts
├── tailwind.config.js
├── vite.config.js
├── .env                        ← NEVER commit this file
├── .gitignore
├── index.html
└── package.json
```

---

## 15. Environment Variables

Create a `.env` file in the project root:

```env
# For development only (use backend proxy for production APK)
VITE_CLAUDE_API_KEY=sk-ant-your-key-here

# URL of your deployed backend proxy
VITE_BACKEND_URL=https://your-backend.railway.app
```

Add `.env` to `.gitignore`:

```
.env
*.jks
*.keystore
```

### Getting a Claude API Key:
1. Go to https://console.anthropic.com
2. Sign in → API Keys → Create Key
3. Copy the key (starts with `sk-ant-`)

---

## 16. Troubleshooting

### "Gradle build failed"
- Make sure `JAVA_HOME` and `ANDROID_HOME` are set correctly
- Run: `npx cap doctor` to diagnose setup issues
- Delete `android/.gradle` and retry: `cd android && .\gradlew.bat clean assembleDebug`

### "App crashes on launch"
- Check the WebView console: `adb logcat | grep Capacitor`
- Make sure `dist/` exists and has `index.html` before running `npx cap sync`

### "Claude API not working in APK"
- The APK cannot call the Claude API directly from frontend (CORS + key exposure)
- You MUST use the backend proxy server (Section 6)
- Make sure `VITE_BACKEND_URL` points to your deployed server

### "Tamil font not rendering"
- Add Google Fonts link to `index.html`:
  ```html
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;700&display=swap" rel="stylesheet">
  ```
- Set font in Tailwind and CSS: `font-family: 'Noto Sans Tamil', sans-serif`

### "Speech API not working on device"
- Check `RECORD_AUDIO` permission in AndroidManifest.xml
- Test with `adb` to see permission errors: `adb logcat -s WebViewActivity`

### "window.storage is not defined"
- Make sure `storage.js` is imported and executed before any component renders
- Import it at the very top of `main.jsx`, before `ReactDOM.createRoot`

### APK install blocked on phone
- Enable "Install from Unknown Sources":
  - Settings → Security → Install Unknown Apps → allow your file manager

---

## Quick Reference — Full Build Commands

```bash
# 1. Install dependencies
npm install

# 2. Run in browser (development)
npm run dev

# 3. Build React app
npm run build

# 4. First time: add Android
npx cap add android

# 5. Sync build to Android
npx cap sync android

# 6. Open Android Studio
npx cap open android

# 7. Build APK via command line
cd android && .\gradlew.bat assembleDebug

# 8. Install APK on connected phone
adb install app/build/outputs/apk/debug/app-debug.apk

# 9. View device logs
adb logcat | grep -i capacitor
```

---

## Estimated Build Time

| Step | Time |
|---|---|
| Prerequisites install | 30–60 min |
| Project setup | 15 min |
| React app development | 2–5 days |
| First Gradle build | 5–10 min |
| APK install & test | 5 min |

---

*Built for Tamil speakers learning English — powered by Claude AI 🦉*
