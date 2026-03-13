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
