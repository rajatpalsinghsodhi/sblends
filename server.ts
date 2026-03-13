import express from "express";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

// S.Blends Barbershop - Oakville (150 Oak Park Blvd Unit 5)
const DEFAULT_PLACE_ID = "ChIJM7fhXaBDK4gRg-5N5Ps94Io";

// Resolve CID (numeric) to Place ID (ChIJ...) via Legacy Places API
async function resolvePlaceId(idOrCid: string, apiKey: string): Promise<string> {
  if (!/^\d+$/.test(idOrCid)) return idOrCid;
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?cid=${idOrCid}&key=${apiKey}`
  );
  const data = await res.json();
  if (data.result?.place_id) return data.result.place_id;
  throw new Error(data.error_message || "Could not resolve CID to Place ID");
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3001;

  // Helper: Find Place ID via Text Search (call /api/find-place?q=S+Blends+Oakville)
  app.get("/api/find-place", async (req, res) => {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const query = (req.query.q as string) || "S Blends Barbershop Oakville";
    if (!apiKey) {
      return res.status(500).json({ error: "GOOGLE_PLACES_API_KEY not configured" });
    }
    try {
      const response = await fetch(
        "https://places.googleapis.com/v1/places:searchText",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress",
          },
          body: JSON.stringify({ textQuery: query }),
        }
      );
      const data = await response.json();
      if (data.error) {
        return res.status(400).json(data);
      }
      res.json(data);
    } catch (error) {
      console.error("Error finding place:", error);
      res.status(500).json({ error: "Failed to find place" });
    }
  });

  // API routes
  app.get("/api/place-details", async (req, res) => {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const idOrCid = process.env.PLACE_ID || DEFAULT_PLACE_ID;
    
    if (!apiKey) {
      return res.status(500).json({ error: "API Key not configured" });
    }

    try {
      const placeId = await resolvePlaceId(idOrCid, apiKey);
      const response = await fetch(
        `https://places.googleapis.com/v1/places/${placeId}?fields=displayName,rating,reviews,photos,regularOpeningHours,formattedAddress,nationalPhoneNumber,websiteUri&key=${apiKey}`
      );
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching place details:", error);
      res.status(500).json({ error: "Failed to fetch place details" });
    }
  });

  app.get("/api/photo/:photoName(*)", async (req, res) => {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const photoName = req.params.photoName;

    if (!apiKey) {
      return res.status(500).json({ error: "API Key not configured" });
    }

    try {
      const response = await fetch(
        `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=800&key=${apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch photo: ${response.statusText}`);
      }

      // Pipe the image directly to the response
      const contentType = response.headers.get("content-type");
      if (contentType) {
        res.setHeader("Content-Type", contentType);
      }
      
      const buffer = await response.arrayBuffer();
      res.send(Buffer.from(buffer));
    } catch (error) {
      console.error("Error fetching photo:", error);
      res.status(500).json({ error: "Failed to fetch photo" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
