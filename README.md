<div align="center">

# 🛡️ Tahaffuz

### Safe-journey and threat-prevention web app

*Travel with someone watching over you, even when no one is next to you.*

**[🔴 Live demo](https://tahaffuz-digital.onrender.com)** · **[👥 Guardian view](https://tahaffuz-digital.onrender.com/guardian.html)**

![Node](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![PWA](https://img.shields.io/badge/Web%20Push-enabled-00AEEF)
![Maps](https://img.shields.io/badge/Maps-OpenStreetMap-7EBC6F)
![WhatsApp](https://img.shields.io/badge/Alerts-WhatsApp%20Cloud%20API-25D366?logo=whatsapp&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)
![Cost](https://img.shields.io/badge/API%20keys%20for%20maps-none%20needed-brightgreen)

</div>

---

## 📖 Table of contents

1. [The problem](#-the-problem)
2. [What Tahaffuz does](#-what-tahaffuz-does)
3. [Features](#-features)
4. [How the safety ladder works](#-how-the-safety-ladder-works)
5. [Tech stack](#-tech-stack)
6. [Project structure](#-project-structure)
7. [Run it locally](#-run-it-locally)
8. [Configuration](#-configuration-environment-variables)
9. [WhatsApp setup guide](#-whatsapp-alerts-setup-guide)
10. [Deploy to Render](#-deploy-to-render-free)
11. [Demo guide](#-demo-guide)
12. [Privacy and safety notes](#-privacy-and-safety-notes)
13. [Known limitations](#-known-limitations)
14. [Troubleshooting](#-troubleshooting)
15. [Roadmap](#-roadmap)

---

## 🚨 The problem

Many people, especially women and students, travel alone through the city and feel unsafe. Existing options either need someone to stay on a phone call, or only help *after* something has already gone wrong. Calling for help can also be impossible in the moment.

## 💡 What Tahaffuz does

Tahaffuz is a web app that **watches your journey and reaches your trusted people automatically**. You pick a destination and start a safe journey. The app follows your route, notices when something is wrong (you leave the route, stop for too long, lose signal, or press SOS), asks if you are okay, and if you do not answer, it alerts your guardians with your live location.

It works in the browser, with nothing to install, and needs **no map API key**.

---

## ✨ Features

### 🧭 Safe journey
- Search a destination (Pakistan-friendly place search) and see a real route on a live map.
- Distance and estimated time before you start.
- **Live journey screen** with an "I'm safe" PIN screen and a signal-health line (`Signal good` or `Signal weak, last update Ns ago`).
- Reaching the destination ends the trip and tells your guardians.

### 👥 Guardians
- Up to **3 guardians**, shown as *Invited* or *Accepted*.
- Guardians must **accept** before they can see anything, and can leave at any time.
- **Permanent guardians** can be set on the server, so they always exist, even after a restart.
- A separate **guardian page** shows the route and the live position, with one-tap **"I'm calling"** and **"On my way"** buttons.

### 🔔 Smart prompts and notifications
- Notification permission is requested after sign-in.
- When you leave the route or stop for a long time, you get a notification: **"Are you safe?"** with **Yes** and **No** buttons.
  - **Yes** cancels the prompt and pauses checks for 5 minutes.
  - **No** alerts your guardians immediately.
  - **No reply for 2 minutes** alerts your guardians automatically.
- **"Different route"** and **"Making a stop"** buttons pause deviation checks for 5 minutes, so normal detours do not cause false alarms.

### 💬 WhatsApp alerts to guardians
- A message when a **trip starts**, with a personal live-map link for each guardian.
- A message when an **alert** fires, in the form *"Please check on [name]"*, with the reason and the live map.
- A message when the trip **ends or arrives**.

### 🆘 SOS
- **Press-and-hold SOS** to avoid accidental taps.
- A secret **duress PIN**: the normal PIN cancels the alarm, while a different PIN looks like it cancels but **silently alerts guardians**.
- Escalation ladder with waiting times, described below.

### 🏥 Nearby help
- Finds the **nearest police stations and hospitals** within 2, 5 or 10 km.
- Filter by **All / Police / Hospitals**.
- Results are marked on the map and listed in the side panel, nearest first, with a **Directions** button.

### 🟢 Safe places
- **Auto-detect:** scans the area around the map and marks places that are likely safe (police, hospitals, fire stations, pharmacies, petrol stations, malls and so on) using a transparent scoring rule.
- **Community marks:** mark a spot as safe or unsafe yourself, with a short note.
- Places near an "unsafe" report get a lower score.

### ⚖️ Know your rights
- Plain-language guidance on harassment, travel precautions and what to do if you feel followed.
- Helplines: **Police 15, Rescue 1122, Edhi 115**, with a one-tap **Call 15** button.

### 🔐 Sign-in
- Name and phone sign-in, or **Continue without logging in**.
- This is a lightweight demo sign-in, with details kept on the device.

---

## 🪜 How the safety ladder works

```
        Something looks wrong
   (off route · long stop · lost signal · SOS)
                    │
                    ▼
      ┌──────────────────────────────┐
      │ "Are you safe?" notification │──── Yes ───▶ checks paused 5 min
      └──────────────────────────────┘
          │ No, or no reply in 2 min
          ▼
   1️⃣  Guardians alerted (push + WhatsApp, live map link)
          │ no guardian responds (~90 s)
          ▼
   2️⃣  Call stage: guardians are asked to call you
          │ still no response (~3 min)
          ▼
   3️⃣  Police console (simulated in this prototype)
```

An **SOS** skips the question and goes straight to alerting guardians. Every step is logged in an activity log.

> ⏱️ For a short demo, run the server with `FAST=1` to shorten the waiting times.

---

## 🧰 Tech stack

| Layer | Technology |
|---|---|
| Backend | Node.js (plain `http` server), no framework |
| Frontend | Vanilla HTML, CSS and JavaScript, mobile-first |
| Map | [Leaflet](https://leafletjs.com) with OpenStreetMap tiles (no key) |
| Place search | Nominatim, with Photon as a fallback |
| Routing | OSRM public server, with a straight-line fallback |
| Nearby places | Overpass API, proxied through the server, with Nominatim as a fallback |
| Push notifications | Web Push (`web-push`) with a Service Worker |
| Guardian alerts | WhatsApp Cloud API (Meta) |
| Hosting | Render (free tier) |

The only npm dependency is **`web-push`**.

---

## 🗂️ Project structure

```
tahaffuz/
├── server.js               # Backend: journeys, ladder, alerts, WhatsApp, push, proxies
├── package.json
├── guardians.example.json  # Format for permanent guardians (use env vars on hosting)
├── run.bat                 # Windows quick-start
├── README.md
└── public/
    ├── index.html          # Traveller app
    ├── guardian.html       # Guardian page
    ├── map.js              # Map helpers (Leaflet)
    ├── style.css           # Design
    ├── sw.js               # Service worker for push notifications
    ├── logo-full.png
    └── logo-mark.png
```

---

## 💻 Run it locally

**Requirements:** [Node.js 18 or newer](https://nodejs.org)

```bash
git clone https://github.com/SyedWaqarAliZaidi/TAHAFFUZ-DIGITAL-WEB_APP.git
cd TAHAFFUZ-DIGITAL-WEB_APP
npm install
npm start
```

Open:
- **Traveller:** http://localhost:3000
- **Guardian:** http://localhost:3000/guardian.html

On Windows you can also double-click `run.bat`.

> 📱 **GPS and push notifications need HTTPS** on phones. `localhost` works on your computer, but to test on a phone use the hosted version or a tunnel such as Cloudflare Tunnel.

---

## ⚙️ Configuration (environment variables)

All settings are optional. The app runs without any of them, with WhatsApp turned off.

| Variable | Purpose | Example |
|---|---|---|
| `WA_PHONE_ID` | WhatsApp Cloud API *Phone number ID* | `1234567890` |
| `WA_TOKEN` | WhatsApp access token (**keep secret**) | |
| `PUBLIC_URL` | Public HTTPS address, used in message links | `https://your-app.onrender.com` |
| `GUARDIANS` | Permanent guardians, `Name:number` separated by commas | `Ali:923001234567,Sara:923007654321` |
| `VAPID_PUBLIC` / `VAPID_PRIVATE` | Push-notification keys, so they survive restarts | from the command below |
| `PORT` | Set automatically by most hosts | `3000` |
| `FAST` | Set to `1` to shorten ladder timings for demos | `1` |
| `GOOGLE_MAPS_KEY` | Optional Google base map. Without it, OpenStreetMap is used | |

Generate push keys once:

```bash
npx web-push generate-vapid-keys
```

Set variables on **Windows Command Prompt**:

```bat
set "WA_PHONE_ID=your-id"
set "WA_TOKEN=your-token"
set "PUBLIC_URL=https://your-app.onrender.com"
npm start
```

On **PowerShell**: `$env:WA_PHONE_ID="your-id"; npm start`
On **macOS and Linux**: `WA_PHONE_ID=your-id npm start`

On startup the console prints `WhatsApp alerts: ON` or `OFF`, and lists any permanent guardians.

> 🔒 **Never commit tokens, keys or real phone numbers.** Put them only in environment variables.

---

## 💬 WhatsApp alerts: setup guide

Tahaffuz uses Meta's official **WhatsApp Cloud API**. The free test number is enough for a prototype.

### 1. Create the Meta app
1. Go to [developers.facebook.com](https://developers.facebook.com), press **My Apps → Create App**, and choose the **Connect with customers through WhatsApp** use case.
2. Open **Use cases → Customize → Step 1: Try it out** (API Setup).

### 2. Copy your values
- **Phone number ID** → `WA_PHONE_ID` (this is *not* the WhatsApp Business account ID).
- **Access token** → `WA_TOKEN`. The temporary token **expires in about 24 hours**, so create a permanent one (see below).

### 3. Add recipients
In **To → Manage phone number list**, add each guardian's number and confirm the code WhatsApp sends them. Test numbers allow only a small number of recipients (about 5).

### 4. Open the 24-hour window
WhatsApp only allows free-form messages to people who **messaged your number in the last 24 hours**. Each guardian sends "hi" to the test number. If the window is closed, the server falls back to the `hello_world` template and logs the reason.

### 5. Create a permanent token
1. [business.facebook.com](https://business.facebook.com) → **Business Settings → Users → System users → Add** (role: Admin).
2. **Add assets**: your app and your WhatsApp account, with full control.
3. **Generate token**, expiry **Never**, with the permissions `whatsapp_business_messaging` and `whatsapp_business_management`.
4. Put it in `WA_TOKEN`.

### Common errors

| Message | Meaning |
|---|---|
| Recipient not in allowed list | Add the number in API Setup |
| Re-engagement message | The 24-hour window closed, so the guardian should message the number again |
| Token or session error | The temporary token expired, so use the permanent token |
| Console says `WhatsApp alerts: OFF` | `WA_PHONE_ID` or `WA_TOKEN` was not set in the same session |

---

## 🚀 Deploy to Render (free)

The server delivers both the frontend and the backend, so you deploy **one** service.

1. Push this repository to GitHub (leave out `node_modules`).
2. On [render.com](https://render.com), choose **New → Web Service** and connect the repository.
3. Settings: **Build** `npm install`, **Start** `npm start`, **Instance** Free, **Region** Singapore.
4. Add the environment variables from the table above: `GUARDIANS`, `WA_PHONE_ID`, `WA_TOKEN`, `VAPID_PUBLIC`, `VAPID_PRIVATE`.
5. After the first deploy, add `PUBLIC_URL` set to your Render address, and save. Render redeploys.
6. Optional but recommended: use a free uptime monitor (for example UptimeRobot, 5-minute interval) to keep the free service awake.

**Free-tier notes:** a free service sleeps after about 15 minutes without visitors, and its disk is temporary. Saved community places are lost on restart, while permanent guardians stay because they come from environment variables.

---

## 🎬 Demo guide

1. Open the live app and **sign in** (or continue without logging in), and allow notifications.
2. Make sure each guardian has messaged the WhatsApp test number in the last 24 hours.
3. Open `/guardian.html` on a second phone and tap **Accept**.
4. On the traveller phone, pick a destination and press **Start safe journey**. Guardians receive a WhatsApp message.
5. Try the features:
   - Leave the route, or tap **Making a stop**, and watch the **"Are you safe?"** prompt.
   - **Hold SOS** and watch the guardian alert and the ladder.
   - Enter the normal PIN to cancel, or the duress PIN to alert silently.
   - Open **Nearby help** and **Safe places**.
6. For a quicker demo, start the server with `FAST=1` to shorten the waiting times of the safety ladder.

> Demo PINs: `1234` cancels the alarm, and `0000` secretly alerts guardians.

---

## 🔐 Privacy and safety notes

- Guardians **must accept** before they can see a trip, and can leave at any time.
- Location is shared **only during an active journey**.
- No account passwords are collected. Sign-in details stay on the device.
- Secrets live in environment variables, not in the code.
- Community "safe" and "unsafe" marks are **unverified**.
- The auto-detected "likely safe" places are an **estimate from OpenStreetMap data**, not a guarantee of safety.
- Tahaffuz is a **support tool**. In an emergency, call **15** (Police) or **1122** (Rescue).

---

## ⚠️ Known limitations

This is a hackathon prototype. Please be aware of the following:

- **Journey movement is simulated in this demo build.** During a journey the position moves along the planned route automatically, so the app can be demonstrated from a desk. The phone's real GPS is used when SOS is pressed.
- **The call and police stages are simulated.** The app does not place a real phone call or contact real police yet.
- **Sign-in is not real authentication.** It is a demo sign-in without passwords.
- **WhatsApp test number limits:** only pre-approved recipients, and a 24-hour reply window. A production version needs a verified WhatsApp Business number and approved message templates.
- **Push notification buttons (Yes/No)** do not appear on iPhone, and tapping Yes in a notification skips the PIN.
- **Free map services** (OpenStreetMap, Nominatim, OSRM, Overpass) have fair-use limits. Production use needs a paid or self-hosted provider.
- **Free hosting** sleeps when idle and stores nothing permanently.
- **Safe-place detection is rule-based**, not a machine-learning model.
- Urdu and right-to-left layout are not implemented yet.

---

## 🛠️ Troubleshooting

| Problem | Fix |
|---|---|
| Map is blank or shows "API KEY REQUIRED" | You are using an old version with a map provider that needs a key. Use the OpenStreetMap tile layer in `public/map.js` |
| `Missing script: "start"` | You are in the wrong folder. Open the folder that contains `server.js` and `package.json` |
| Nearby help or safe-place scan fails | The free map-data servers may be busy. Press **Try again**, or check your connection |
| WhatsApp link says `localhost` | Set `PUBLIC_URL` to your public HTTPS address and redeploy |
| No WhatsApp message arrives | Check recipients, the 24-hour window and the token, then read the server log for the error |
| Push notifications do not work on a phone | Use the HTTPS address, and allow notifications in the browser |

---

## 🗺️ Roadmap

- [ ] Real phone-call and emergency-service integration
- [ ] Real authentication and an encrypted database
- [ ] Press-and-hold and shake-to-SOS on native mobile
- [ ] Urdu and right-to-left layout
- [ ] Verified WhatsApp Business number with approved templates
- [ ] Safer-route suggestions using community reports
- [ ] Native Android and iOS apps

---

## 🤝 Contributing

Ideas and pull requests are welcome. Please open an issue first to discuss big changes.

## 📄 License

Released under the [MIT License](LICENSE).

---

<div align="center">

**Built with care for safer journeys.** 🛡️

*Tahaffuz* means "protection".

</div>
