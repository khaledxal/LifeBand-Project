const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const fetch = (...args) => import("node-fetch").then(({ default: f }) => f(...args));
const admin = require("firebase-admin");
const https = require("https");
const querystring = require("querystring");

admin.initializeApp();

// ══════════════════════════════════════════════
// Gemini Key — Secret Manager
// ══════════════════════════════════════════════
const geminiKey = defineSecret("GEMINI_KEY");

// ══════════════════════════════════════════════
// Twilio credentials
// يُستبدل __TWILIO_*__ تلقائياً من GitHub Actions
// لا تضع القيم الحقيقية هنا أبداً
// ══════════════════════════════════════════════
const TWILIO_SID   = "__TWILIO_SID__";
const TWILIO_TOKEN = "__TWILIO_TOKEN__";
const TWILIO_FROM  = "__TWILIO_FROM__";

// ══════════════════════════════════════════════
// Function 1: askGemini
// ══════════════════════════════════════════════
exports.askGemini = onRequest(
  { secrets: [geminiKey], cors: true },
  async (req, res) => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "prompt is required" });

    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey.value()}`;
    try {
      const response = await fetch(GEMINI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 500, temperature: 0.4 },
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        return res.status(response.status).json({ error: data?.error?.message || "Gemini error" });
      }
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "لم يتم الحصول على رد";
      return res.json({ result: text });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
);

// ══════════════════════════════════════════════
// Function 2: sendEmergencySMS
// ══════════════════════════════════════════════
function twilioSendSMS(toNumber, message) {
  return new Promise((resolve, reject) => {
    const body = querystring.stringify({
      To:   toNumber.startsWith("+") ? toNumber : "+" + toNumber,
      From: TWILIO_FROM,
      Body: message,
    });
    const options = {
      hostname: "api.twilio.com",
      path:     `/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`,
      method:   "POST",
      headers:  {
        "Content-Type":   "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(body),
        "Authorization":  "Basic " + Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString("base64"),
      },
    };
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.sid) resolve(parsed);
          else reject(new Error(parsed.message || "Twilio error"));
        } catch(e) { reject(e); }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

// ══════════════════════════════════════════════
// Function 2: sendTelegramAlert
// ══════════════════════════════════════════════
const tgToken = defineSecret("TG_BOT_TOKEN");

exports.sendTelegramAlert = onRequest(
  { secrets: [tgToken], cors: true },
  async (req, res) => {
    if (req.method === "OPTIONS") return res.status(204).send("");
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const { chatId, message } = req.body;
    if (!chatId || !message) return res.status(400).json({ error: "chatId and message required" });

    try {
      const response = await fetch(
        `https://api.telegram.org/bot${tgToken.value()}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "Markdown" })
        }
      );
      const data = await response.json();
      if (!data.ok) throw new Error(data.description || "Telegram error");

      // تسجيل في Firebase
      await admin.database().ref(`tg_logs/${chatId}`).push({
        sentAt: new Date().toISOString(), status: "sent"
      });

      return res.status(200).json({ sent: true });
    } catch (err) {
      console.error("Telegram error:", err.message);
      return res.status(500).json({ error: err.message });
    }
  }
);

// ══════════════════════════════════════════════
// Function 3: sendEmergencySMS
// ══════════════════════════════════════════════
exports.sendEmergencySMS = onRequest(
  { cors: true },
  async (req, res) => {
    if (req.method === "OPTIONS") return res.status(204).send("");
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const { patientId, patientName, bloodType, diseases } = req.body;
    if (!patientId) return res.status(400).json({ error: "patientId required" });

    try {
      const patientSnap = await admin.database().ref(`users/${patientId}`).once("value");
      if (!patientSnap.exists()) return res.status(404).json({ error: "Patient not found" });

      const patient   = patientSnap.val();
      const waContact = patient.waContact;

      if (!waContact) {
        return res.status(200).json({ sent: false, reason: "No emergency contact registered" });
      }

      const name       = patientName || patient.name      || "Unknown";
      const blood      = bloodType   || patient.bloodType || "Unknown";
      const diseaseArr = diseases    || patient.diseases  || [];
      const diseaseTxt = Array.isArray(diseaseArr) && diseaseArr.length
        ? diseaseArr.join(", ") : "None";
      const timestamp  = new Date().toLocaleString("ar-SA", { timeZone: "Asia/Riyadh" });

      const smsMessage =
`🚨 LIFEBAND EMERGENCY
Patient: ${name}
Blood: ${blood}
Conditions: ${diseaseTxt}
Time: ${timestamp}
-- LifeBand Auto Alert --`;

      const result = await twilioSendSMS(waContact, smsMessage);

      await admin.database().ref(`sms_logs/${patientId}`).push({
        to: waContact, message: smsMessage,
        twilioSid: result.sid, sentAt: new Date().toISOString(), status: "sent",
      });

      return res.status(200).json({
        sent: true,
        twilioSid: result.sid,
        to: waContact.replace(/\d(?=\d{4})/g, "*"),
      });

    } catch (err) {
      console.error("SMS error:", err.message);
      try {
        await admin.database().ref(`sms_logs/${patientId || "unknown"}`).push({
          error: err.message, sentAt: new Date().toISOString(), status: "failed",
        });
      } catch(_) {}
      return res.status(500).json({ error: err.message });
    }
  }
);