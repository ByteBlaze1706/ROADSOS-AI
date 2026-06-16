import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authenticateUser } from "../middlewares/auth.js";

const router = Router();

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const hasUppercase = /[A-Z]/;
const hasLowercase = /[a-z]/;
const hasNumber = /[0-9]/;

const isProd = process.env.NODE_ENV === "production";
const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

router.post("/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: "Name must be at least 2 characters long." });
    }
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ error: "A valid email address is required." });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters long." });
    }
    if (!hasUppercase.test(password) || !hasLowercase.test(password) || !hasNumber.test(password)) {
      return res.status(400).json({
        error: "Password must contain at least one uppercase letter, one lowercase letter, and one number.",
      });
    }

    const trimmedEmail = email.toLowerCase().trim();

    // Check if email already exists
    const [existing] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, trimmedEmail))
      .limit(1);

    if (existing) {
      return res.status(409).json({ error: "Email is already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [user] = await db
      .insert(usersTable)
      .values({
        name: name.trim(),
        email: trimmedEmail,
        passwordHash,
      })
      .returning();

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.cookie("token", token, cookieOptions);
    return res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    });
  } catch (err) {
    req.log.error({ err }, "Registration failed");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase().trim()))
      .limit(1);

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.cookie("token", token, cookieOptions);
    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    });
  } catch (err) {
    req.log.error({ err }, "Login failed");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
  });
  return res.json({ success: true });
});

router.get("/auth/me", authenticateUser, (req, res) => {
  return res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    createdAt: req.user.createdAt,
  });
});

export default router;
