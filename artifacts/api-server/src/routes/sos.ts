import { Router } from "express";
import { db, sosAlertsTable } from "@workspace/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import { insertSosAlertSchema } from "@workspace/db";

const router = Router();

router.post("/sos", async (req, res) => {
  try {
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

router.get("/sos", async (req, res) => {
  try {
    const userId = (req.query.userId as string) || "demo-user";
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

router.get("/sos/active", async (req, res) => {
  try {
    const userId = (req.query.userId as string) || "demo-user";
    const [alert] = await db
      .select()
      .from(sosAlertsTable)
      .where(
        and(
          eq(sosAlertsTable.userId, userId),
          eq(sosAlertsTable.status, "active"),
          isNull(sosAlertsTable.cancelledAt)
        )
      )
      .limit(1);
    return res.json({ active: !!alert, alert: alert ?? null });
  } catch (err) {
    req.log.error({ err }, "Failed to get active SOS");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/sos/:id/cancel", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
    const [updated] = await db
      .update(sosAlertsTable)
      .set({ status: "cancelled", cancelledAt: new Date() })
      .where(eq(sosAlertsTable.id, id))
      .returning();
    if (!updated) return res.status(404).json({ error: "SOS not found" });
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

router.get("/nearby-services", (req, res) => {
  const type = req.query.type as string | undefined;
  const services = [
    { id: "h1", name: "City General Hospital", type: "hospital", latitude: 28.6139, longitude: 77.2090, distance: 0.8, phone: "+91-11-2345-6789", eta: 4, available: true },
    { id: "h2", name: "Apollo Emergency Center", type: "hospital", latitude: 28.6200, longitude: 77.2150, distance: 1.2, phone: "+91-11-9876-5432", eta: 6, available: true },
    { id: "p1", name: "Police Station — Sector 4", type: "police", latitude: 28.6100, longitude: 77.2050, distance: 0.5, phone: "100", eta: 3, available: true },
    { id: "p2", name: "Traffic Police Post", type: "police", latitude: 28.6160, longitude: 77.2000, distance: 1.1, phone: "100", eta: 5, available: true },
    { id: "a1", name: "Rapid Ambulance Service", type: "ambulance", latitude: 28.6120, longitude: 77.2080, distance: 0.6, phone: "108", eta: 4, available: true },
    { id: "a2", name: "City EMS Unit 7", type: "ambulance", latitude: 28.6180, longitude: 77.2120, distance: 1.4, phone: "102", eta: 7, available: false },
    { id: "t1", name: "Metro Towing Services", type: "towing", latitude: 28.6090, longitude: 77.2070, distance: 1.0, phone: "+91-98765-43210", eta: 10, available: true },
    { id: "t2", name: "Fastlane Recovery", type: "towing", latitude: 28.6220, longitude: 77.2200, distance: 2.1, phone: "+91-87654-32109", eta: 15, available: true },
    { id: "f1", name: "HP Petrol Station", type: "fuel", latitude: 28.6080, longitude: 77.2030, distance: 0.7, phone: "+91-11-2222-3333", eta: 2, available: true },
    { id: "f2", name: "IndianOil Express", type: "fuel", latitude: 28.6240, longitude: 77.2180, distance: 1.8, phone: "+91-11-4444-5555", eta: 5, available: true },
    { id: "pu1", name: "24x7 Puncture Shop", type: "puncture", latitude: 28.6110, longitude: 77.2060, distance: 0.4, phone: "+91-99887-76655", eta: 3, available: true },
    { id: "pu2", name: "Roadside Tire Fix", type: "puncture", latitude: 28.6170, longitude: 77.2130, distance: 1.3, phone: "+91-88776-65544", eta: 8, available: true },
  ];
  const filtered = type && type !== "all" ? services.filter(s => s.type === type) : services;
  return res.json(filtered);
});

export default router;
