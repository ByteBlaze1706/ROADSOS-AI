import { Router } from "express";
import { db, profilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { insertProfileSchema } from "@workspace/db";
import { authenticateUser } from "../middlewares/auth.js";

const router = Router();

router.get("/profile", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id.toString();
    const [profile] = await db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.userId, userId))
      .limit(1);
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }
    return res.json(profile);
  } catch (err) {
    req.log.error({ err }, "Failed to get profile");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/profile", authenticateUser, async (req, res) => {
  try {
    req.body.userId = req.user.id.toString();
    const parsed = insertProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid profile data" });
    }
    const data = parsed.data;
    const [existing] = await db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.userId, data.userId))
      .limit(1);

    if (existing) {
      const [updated] = await db
        .update(profilesTable)
        .set(data)
        .where(eq(profilesTable.userId, data.userId))
        .returning();
      return res.json(updated);
    }
    const [created] = await db.insert(profilesTable).values(data).returning();
    return res.json(created);
  } catch (err) {
    req.log.error({ err }, "Failed to save profile");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
