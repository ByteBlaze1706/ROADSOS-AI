import jwt from "jsonwebtoken";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export async function authenticateUser(req, res, next) {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: "Access denied. No session token found." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ error: "Invalid session token." });
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, decoded.id))
      .limit(1);

    if (!user) {
      return res.status(401).json({ error: "User session not found." });
    }

    req.user = user;
    next();
  } catch (err) {
    req.log.warn({ err }, "Authentication failed");
    return res.status(401).json({ error: "Session expired or invalid." });
  }
}
