# HAND SHOOTER - Real-Time Hand Gesture Arcade Game

> An arcade shooting game controlled in real time via computer vision hand gestures in the browser. Powered by **Next.js (App Router)**, **HTML5 Canvas**, and **MediaPipe Tasks Vision** (`@mediapipe/tasks-vision`).

🎮 **Zero Cost**: 100% Free, ₹0 cost. No API keys required.  
🔒 **100% Privacy**: All video and hand tracking executes locally in WebAssembly. No video frames leave your device.  
🖱️ **Full Fallback**: Complete mouse, keyboard (`Space`), and touch controls for seamless accessibility.

---

## 🕹️ Controls

| Action | Hand Gesture | Fallback Controls |
|---|---|---|
| **Aim Crosshair** | ☝️ Move Index Fingertip across camera frame | 🖱️ Move Mouse Cursor or Touch & Drag |
| **Shoot / Rapid Fire** | 🤏 Combine Thumb + Index fingers together | 🖱️ Left Click / Mobile Tap / `Spacebar` |
| **Stop Shooting** | ✋ Separate fingers | Release mouse click / `Spacebar` |

---

## 🚀 Key Features

- **MediaPipe Tasks Vision (21 Landmarks)**: Tracks real-time 3D hand landmarks in client-side WebAssembly + GPU.
- **Adaptive Aim Smoothing**: Exponential Moving Average ($\alpha=0.55$) eliminates camera hand jitter while preserving snappy tracking.
- **Continuous Rapid Fire**: Combining index and thumb fingers fires high-speed plasma bullets (~7 shots/second).
- **5 Player Lives + Health Drones**:
  - Starts with 5 lives (❤️ ❤️ ❤️ ❤️ ❤️).
  - Special **Emerald Health Drones (`+1 LIFE ❤️`)** spawn periodically—shoot them to recover lost health!
- **Dynamic Waves & Progressive Speed**:
  - Drones spawn and hover/descend slowly for the first 1.8 seconds, giving you time to aim.
  - Speed scales up progressively with higher levels and scores.
- **Web Audio API Sound Synthesizer**: Pure client-side audio synthesis for laser shots, explosions, alarms, and healing chimes (zero external `.mp3` downloads).

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Computer Vision**: `@mediapipe/tasks-vision` (HandLandmarker)
- **Rendering**: HTML5 Canvas (60 FPS `requestAnimationFrame` game engine)
- **Audio**: Web Audio API Synthesizer
- **Icons**: Lucide React

---

## 🏃 Getting Started Locally

```bash
# 1. Clone repository
git clone https://github.com/swamyrayudu/opencvgame.git
cd opencvgame

# 2. Install dependencies
npm install

# 3. Run development server
npm run dev

# 4. Open in browser
# Navigate to http://localhost:3000
```

---

## 🧪 Testing & Build

```bash
# Run automated test suite (18/18 unit tests)
npx tsx scripts/test-game.mjs

# Build production bundle
npm run build
```

---

## 🌐 Deploy to Vercel

1. Push to your GitHub repository.
2. Go to [vercel.com](https://vercel.com) and import `opencvgame`.
3. Framework: **Next.js**.
4. Environment Variables: **None required**.
5. Click **Deploy**. Vercel will build and serve your app over HTTPS (required for camera access).
