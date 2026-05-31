import { Router } from "express";
import { db, incidentsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { insertIncidentSchema } from "@workspace/db";

const router = Router();

router.get("/incidents", async (req, res) => {
  try {
    const userId = (req.query.userId as string) || "demo-user";
    const incidents = await db
      .select()
      .from(incidentsTable)
      .where(eq(incidentsTable.userId, userId))
      .orderBy(desc(incidentsTable.createdAt))
      .limit(50);
    return res.json(incidents);
  } catch (err) {
    req.log.error({ err }, "Failed to get incidents");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/incidents", async (req, res) => {
  try {
    const parsed = insertIncidentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid incident data" });
    }
    const [incident] = await db
      .insert(incidentsTable)
      .values(parsed.data)
      .returning();
    return res.status(201).json(incident);
  } catch (err) {
    req.log.error({ err }, "Failed to report incident");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
