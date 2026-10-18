TAHAFFUZ (needs Node.js, free: https://nodejs.org)
Easiest on Windows: double-click run.bat
Or in PowerShell inside this folder:  npm install   then   npm start    (npm run dev also works)
Open http://localhost:3000 (traveller) and http://localhost:3000/guardian.html (guardian).
Short demo timers: npm run demo     (real: prompt 2 min, guardians 90 s, call 3 min, stopped 3 min, lost contact 60 s)
Demo tools: tap the logo chip 3 times. PINs: 1234 = cancel, 0000 = silent duress alert.
Data is stored in data/db.json (guardians and place marks). Delete a guardian or mark in the app to remove it; delete data/db.json to wipe everything.
WhatsApp: set WA_PHONE_ID, WA_TOKEN (system-user token), PUBLIC_URL, then start. Only the numbers added in Meta's dashboard (max 5) can receive it; everyone else gets push notifications.
Phones need HTTPS for GPS and push: use a free tunnel such as cloudflared.

PERMANENT GUARDIANS (always present, cannot be removed in the app, survive restarts):
  Option A (best for hosting): set env GUARDIANS="Ali:923001234567,Sara:923007654321"
  Option B: copy guardians.example.json to guardians.json and edit it (do not publish real numbers on public GitHub).
  Max 3 guardians in total; permanent ones count toward the 3. Numbers: digits only, with country code.
HOSTING (Render etc.): the host sets PORT automatically. To keep push notifications working after restarts, create keys once with  npx web-push generate-vapid-keys  and set env VAPID_PUBLIC and VAPID_PRIVATE.
