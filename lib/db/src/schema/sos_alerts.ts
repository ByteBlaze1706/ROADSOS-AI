import { pgTable, text, serial, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const sosAlertsTable = pgTable("sos_alerts", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  latitude: real("latitude"),
  longitude: real("longitude"),
  status: text("status").notNull().default("active"),
  triggeredAt: timestamp("triggered_at", { withTimezone: true }).notNull().defaultNow(),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  severity: text("severity").notNull().default("high"),
  notes: text("notes"),
});

export const insertSosAlertSchema = createInsertSchema(sosAlertsTable).omit({ id: true, triggeredAt: true });
export type InsertSosAlert = z.infer<typeof insertSosAlertSchema>;
export type SosAlert = typeof sosAlertsTable.$inferSelect;
