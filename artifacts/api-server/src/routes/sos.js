import { Router } from "express";
import { db, sosAlertsTable } from "@workspace/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import { insertSosAlertSchema } from "@workspace/db";
import { authenticateUser } from "../middlewares/auth.js";

const router = Router();

router.post("/sos", authenticateUser, async (req, res) => {
  try {
    req.body.userId = req.user.id.toString();
    const parsed = insertSosAlertSchema.safeParse({
      ...req.body,
      status: "active",
    });
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid SOS data" });
    }
    const [alert] = await db
      .insert(sosAlertsTable)
      .values(parsed.data)
      .returning();
    return res.status(201).json(alert);
  } catch (err) {
    req.log.error({ err }, "Failed to trigger SOS");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/sos", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id.toString();
    const alerts = await db
      .select()
      .from(sosAlertsTable)
      .where(eq(sosAlertsTable.userId, userId))
      .orderBy(desc(sosAlertsTable.triggeredAt))
      .limit(20);
    return res.json(alerts);
  } catch (err) {
    req.log.error({ err }, "Failed to get SOS history");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/sos/active", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id.toString();
    const [alert] = await db
      .select()
      .from(sosAlertsTable)
      .where(
        and(
          eq(sosAlertsTable.userId, userId),
          eq(sosAlertsTable.status, "active"),
          isNull(sosAlertsTable.cancelledAt),
        ),
      )
      .limit(1);
    return res.json({ active: !!alert, alert: alert ?? null });
  } catch (err) {
    req.log.error({ err }, "Failed to get active SOS");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/sos/:id/cancel", authenticateUser, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
    const [updated] = await db
      .update(sosAlertsTable)
      .set({ status: "cancelled", cancelledAt: new Date() })
      .where(
        and(
          eq(sosAlertsTable.id, id),
          eq(sosAlertsTable.userId, req.user.id.toString()),
        ),
      )
      .returning();
    if (!updated) return res.status(404).json({ error: "SOS not found or unauthorized" });
    return res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Failed to cancel SOS");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/emergency/stats", async (_req, res) => {
  const stats = {
    severityScore: Math.floor(Math.random() * 30) + 70,
    ambulanceEta: Math.floor(Math.random() * 8) + 3,
    nearbyTraumaCenters: 4,
    activeResponders: Math.floor(Math.random() * 10) + 12,
    networkQuality: "Excellent",
    emergencyReadiness: Math.floor(Math.random() * 10) + 90,
    gpsStatus: "Active",
    totalSosThisMonth: 3,
    avgResponseTime: 4.7,
  };
  return res.json(stats);
});

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}

async function searchNearby(lat, lng, googleType, keyword, apiKey) {
  try {
    let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=10000&key=${apiKey}`;
    if (googleType) {
      url += `&type=${googleType}`;
    }
    if (keyword) {
      url += `&keyword=${encodeURIComponent(keyword)}`;
    }
    const response = await fetch(url);
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    return data.results || [];
  } catch (e) {
    return [];
  }
}

async function getPlacePhone(placeId, apiKey) {
  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_phone_number&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.result?.formatted_phone_number || "";
  } catch (e) {
    return "";
  }
}

function getMockServices(lat, lng) {
  return [
    {
      id: "h1",
      name: "City General Hospital (Mock)",
      type: "hospital",
      latitude: lat + 0.005,
      longitude: lng + 0.005,
      distance: 0.8,
      phone: "+91-11-2345-6789",
      eta: 4,
      available: true,
    },
    {
      id: "p1",
      name: "Police Station — Sector 4 (Mock)",
      type: "police",
      latitude: lat - 0.005,
      longitude: lng - 0.005,
      distance: 0.5,
      phone: "100",
      eta: 3,
      available: true,
    },
    {
      id: "t1",
      name: "Metro Towing Services (Mock)",
      type: "towing",
      latitude: lat + 0.008,
      longitude: lng - 0.002,
      distance: 1.0,
      phone: "+91-98765-43210",
      eta: 10,
      available: true,
    },
    {
      id: "pu1",
      name: "24x7 Puncture Shop (Mock)",
      type: "puncture",
      latitude: lat - 0.002,
      longitude: lng + 0.006,
      distance: 0.4,
      phone: "+91-99887-76655",
      eta: 3,
      available: true,
    },
  ];
}

router.get("/nearby-services", async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const type = req.query.type;

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: "Invalid or missing lat/lng parameters" });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      req.log.warn("GOOGLE_MAPS_API_KEY is not defined. Returning mock services.");
      const dummyServices = getMockServices(lat, lng);
      const filtered = type && type !== "all" && type !== "ALL" ? dummyServices.filter((s) => s.type === type.toLowerCase().replace(/s$/, "")) : dummyServices;
      return res.json(filtered);
    }

    let searchTasks = [];
    const normalizedType = type ? type.toLowerCase() : "all";

    if (normalizedType === "hospitals" || normalizedType === "hospital" || normalizedType === "all") {
      searchTasks.push(
        searchNearby(lat, lng, "hospital", "hospital", apiKey).then((results) =>
          results.map((p) => ({ ...p, categoryType: "hospital" }))
        )
      );
    }
    if (normalizedType === "police" || normalizedType === "all") {
      searchTasks.push(
        searchNearby(lat, lng, "police", "police station", apiKey).then((results) =>
          results.map((p) => ({ ...p, categoryType: "police" }))
        )
      );
    }
    if (normalizedType === "towing" || normalizedType === "all") {
      searchTasks.push(
        searchNearby(lat, lng, null, "towing service", apiKey).then((results) =>
          results.map((p) => ({ ...p, categoryType: "towing" }))
        )
      );
    }
    if (normalizedType === "puncture" || normalizedType === "all") {
      searchTasks.push(
        searchNearby(lat, lng, null, "tire repair", apiKey).then((results) =>
          results.map((p) => ({ ...p, categoryType: "puncture" }))
        )
      );
    }

    const taskResults = await Promise.all(searchTasks);
    const rawPlaces = taskResults.flat();

    let places = rawPlaces.map((place) => {
      const pLat = place.geometry.location.lat;
      const pLng = place.geometry.location.lng;
      const distance = calculateDistance(lat, lng, pLat, pLng);
      return {
        id: place.place_id,
        name: place.name,
        type: place.categoryType,
        latitude: pLat,
        longitude: pLng,
        distance,
        vicinity: place.vicinity || "",
        eta: Math.round(distance * 3 + 2),
        available: place.business_status === "OPERATIONAL" && (!place.opening_hours || place.opening_hours.open_now !== false),
        phone: ""
      };
    });

    places.sort((a, b) => a.distance - b.distance);
    let finalPlaces = places.slice(0, 30);

    if (finalPlaces.length === 0) {
      req.log.warn("Google Places API returned 0 results or failed. Using mock nearby services.");
      const dummyServices = getMockServices(lat, lng);
      finalPlaces = type && type !== "all" && type !== "ALL" ? dummyServices.filter((s) => s.type === type.toLowerCase().replace(/s$/, "")) : dummyServices;
    } else {
      const phoneTasks = finalPlaces.slice(0, 8).map(async (p) => {
        const phone = await getPlacePhone(p.id, apiKey);
        p.phone = phone;
      });
      await Promise.all(phoneTasks);
    }

    return res.json(finalPlaces);
  } catch (err) {
    req.log.error({ err }, "Failed to fetch nearby services");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/config/maps-key", (req, res) => {
  return res.json({ apiKey: process.env.GOOGLE_MAPS_API_KEY || "" });
});

export default router;
