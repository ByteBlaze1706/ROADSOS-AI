import { Router } from "express";
import { db, chatMessagesTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { insertChatMessageSchema } from "@workspace/db";

const router = Router();

const EMERGENCY_RESPONSES = {
  default:
    "I am ROADSOS AI, your emergency assistant. I am here to help you in any road emergency. Please describe your situation or use one of the quick action buttons.",
  hospital:
    "The nearest hospital is City General Hospital, 0.8 km away. ETA approximately 4 minutes. Shall I activate SOS and notify them you are en route?",
  accident:
    "Stay calm. I have detected your location. Nearest emergency services are 3-8 minutes away. If you are injured, do not move. Press the SOS button for immediate dispatch.",
  cpr: "CPR Instructions: 1. Call 112. 2. Push hard and fast in the center of the chest — at least 2 inches deep, 100-120 pushes per minute. 3. Give rescue breaths if trained. Continue until help arrives.",
  ambulance:
    "Ambulance dispatched. Rapid Ambulance Service Unit 7 is 4 minutes away. Your GPS location has been shared. Stay where you are and keep this app open.",
  fuel: "Nearest fuel station: HP Petrol Station, 0.7 km away. Open 24 hours. Phone: +91-11-2222-3333. Shall I navigate you there?",
  police:
    "Police Station Sector 4 is 0.5 km away, ETA 3 minutes. You can also call 100 directly. Do you want me to alert them to your location?",
  towing:
    "Metro Towing Services is available — 1.0 km away, ETA 10 minutes. Phone: +91-98765-43210. Shall I call them on your behalf?",
  puncture:
    "24x7 Puncture Shop is just 0.4 km away, ETA 3 minutes. They have mobile service available. Phone: +91-99887-76655.",
};

function getAiResponse(message) {
  const lower = message.toLowerCase();
  if (lower.includes("hospital") || lower.includes("doctor"))
    return EMERGENCY_RESPONSES.hospital;
  if (
    lower.includes("accident") ||
    lower.includes("crash") ||
    lower.includes("injured")
  )
    return EMERGENCY_RESPONSES.accident;
  if (lower.includes("cpr") || lower.includes("heart"))
    return EMERGENCY_RESPONSES.cpr;
  if (lower.includes("ambulance") || lower.includes("ems"))
    return EMERGENCY_RESPONSES.ambulance;
  if (
    lower.includes("fuel") ||
    lower.includes("petrol") ||
    lower.includes("gas")
  )
    return EMERGENCY_RESPONSES.fuel;
  if (
    lower.includes("police") ||
    lower.includes("robbery") ||
    lower.includes("theft")
  )
    return EMERGENCY_RESPONSES.police;
  if (
    lower.includes("tow") ||
    lower.includes("breakdown") ||
    lower.includes("broke down")
  )
    return EMERGENCY_RESPONSES.towing;
  if (
    lower.includes("puncture") ||
    lower.includes("flat tire") ||
    lower.includes("tyre")
  )
    return EMERGENCY_RESPONSES.puncture;
  return EMERGENCY_RESPONSES.default;
}

router.get("/models", async (req, res) => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
    );
    const data = await response.json();
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get("/chat", async (req, res) => {
  try {
    const userId = req.query.userId || "demo-user";
    const messages = await db
      .select()
      .from(chatMessagesTable)
      .where(eq(chatMessagesTable.userId, userId))
      .orderBy(asc(chatMessagesTable.createdAt))
      .limit(50);
    return res.json(messages);
  } catch (err) {
    req.log.error({ err }, "Failed to get chat history");
    return res.status(500).json({ error: "Internal server error" });
  }
});

async function getGeminiResponse(message, chatHistory = []) {
  if (!process.env.GEMINI_API_KEY) {
    return getAiResponse(message);
  }

  try {
    const formattedHistory = chatHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const systemPrompt = "You are ROADSOS AI, an emergency assistant co-pilot for road emergencies, crashes, breakdowns, and medical situations. Provide clear, concise, actionable emergency advice. Direct the user to emergency services or quick actions (e.g. SOS button) when appropriate. Keep your responses short and focused on immediate safety.";
    
    const contents = [
      {
        role: 'user',
        parts: [{ text: `System context: ${systemPrompt}` }]
      },
      {
        role: 'model',
        parts: [{ text: "Understood. I will act as ROADSOS AI and provide concise, actionable emergency assistance." }]
      },
      ...formattedHistory,
      {
        role: 'user',
        parts: [{ text: message }]
      }
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contents }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) return text.trim();
  } catch (err) {
    console.error("Gemini API call failed:", err);
    throw err;
  }

  return getAiResponse(message);
}

router.post("/chat", async (req, res) => {
  try {
    const userId = req.body.userId || "demo-user";
    const message = req.body.message;
    if (!message) return res.status(400).json({ error: "Message required" });

    // Fetch last 10 messages for context
    const history = await db
      .select()
      .from(chatMessagesTable)
      .where(eq(chatMessagesTable.userId, userId))
      .orderBy(asc(chatMessagesTable.createdAt))
      .limit(10);

    const userMsgData = insertChatMessageSchema.parse({
      userId,
      role: "user",
      content: message,
    });
    await db.insert(chatMessagesTable).values(userMsgData);

    const aiContent = await getGeminiResponse(message, history);
    const aiMsgData = insertChatMessageSchema.parse({
      userId,
      role: "assistant",
      content: aiContent,
    });
    const [aiMsg] = await db
      .insert(chatMessagesTable)
      .values(aiMsgData)
      .returning();

    return res.json(aiMsg);
  } catch (err) {
    req.log.error({ err }, "Failed to send chat message");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
