<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/524b4f24-195e-48c6-9291-eb6a4da1d214

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

3. **Get live reviews and photos from Google Business:**
   - Get a [Google Places API key](https://console.cloud.google.com/apis/credentials)
   - Enable **Places API (New)** and **Places API** (legacy, for CID support) in your Google Cloud project
   - Add to `.env`:
     ```
     GOOGLE_PLACES_API_KEY=your_api_key_here
     ```
   - (Optional) If you need a different location, use [gmbidconverter.com](https://gmbidconverter.com/) with your Google Maps URL. You can use either the **Place ID** (ChIJ...) or the **CID** (numeric) in `.env`:
     ```
     PLACE_ID=10007066524093640323
     ```

4. Run the app:
   ```bash
   npm run dev
   ```

Without a valid API key, the app shows fallback placeholder data. With a valid key, it fetches **real reviews and photos** from your Google Business listing.

## Owner Dashboard (Internal)

The owner/staff dashboard is built inside the same app and served from:

- `/owner`

It shares the same noir + gold visual theme and is optimized for desktop operations (with tablet responsiveness).

### Implemented Architecture

- Dashboard is part of the main app (same frontend + server)
- Role-based authentication: `Admin`, `Barber`, `Reception`
- Real-time updates via SSE (`/api/owner/stream`) with 5-second polling fallback
- Notification integrations:
   - SMS via Vonage
   - Email via SendGrid
- Designed to deploy on Railway free tier as a single service

### Role Login

Use the `/owner` login form.

Environment variables for role PINs:

```
OWNER_ADMIN_PIN=1111
OWNER_BARBER_PIN=2222
OWNER_RECEPTION_PIN=3333
```

If these are not set, the defaults above are used locally.

### Notification Configuration

Add these for live notification sending:

```
VONAGE_API_KEY=...
VONAGE_API_SECRET=...
VONAGE_FROM=SBLENDS

SENDGRID_API_KEY=...
SENDGRID_FROM_EMAIL=notifications@sblends.com
```

If missing, sends are logged as failed in the dashboard notification log.

### Booksy Through Google Calendar

To sync Booksy appointments through Google Calendar, configure:

GOOGLE_BOOKSY_CLIENT_ID=...
GOOGLE_BOOKSY_CLIENT_SECRET=...
GOOGLE_BOOKSY_REDIRECT_URI=http://localhost:3001/api/owner/booksy/google/callback
BOOKSY_GOOGLE_CALENDAR_IDS=b1:calendar1@group.calendar.google.com,b2:calendar2@group.calendar.google.com
BOOKSY_SYNC_INTERVAL_MS=45000

Optional owner alerts for newly imported Booksy appointments:

OWNER_NOTIFICATION_PHONE=+1...
OWNER_NOTIFICATION_EMAIL=owner@example.com

Owner endpoints:

- GET /api/owner/booksy/status
- GET /api/owner/booksy/google/auth-url
- GET /api/owner/booksy/google/callback
- POST /api/owner/booksy/sync-now

### Dashboard Feature Coverage

- Barber status overview (available / busy / break, current customer, estimated finish, queue length)
- Live queue management (add walk-in, assign barber, reorder, remove)
- Appointment management (today, in-progress, completed, no-shows, quick actions)
- Real-time operational updates (SSE + polling)
- Notification panel (SMS/email triggers + log history)
- Basic analytics (today bookings, walk-ins vs appointments, peak hours, barber performance)

### Railway Notes

- Keep `npm run dev` for development.
- On Railway free tier, use `npm start` as the service start command.
- Set all required env vars in Railway service settings.
