const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const fetch = (...args) => import("node-fetch").then(({ default: f }) => f(...args));
const admin = require("firebase-admin");
const https = require("https");
const querystring = require("querystring");

admin.initializeApp();

// ══════════════════════════════════════════════
// Secrets — محفوظة في Firebase Secret Manager
// لا تظهر في الكود ولا في GitHub أبداً
// أضفها بهذا الأمر:
//   firebase functions:secrets:set TWILIO_SID
//   firebase functions:secrets:set TWILIO_TOKEN
//   firebase functions:secrets:set TWILIO_FROM
//   firebase functions:secrets:set GEMINI_KEY
// ══════════════════════════════════════════════
const geminiKey   = defineSecret("GEMINI_KEY");
const twilioSid   = defineSecret("TWILIO_SID");
const twilioToken = defineSecret("TWILIO_TOKEN");
const twilioFrom  = defineSecret("TWILIO_FROM");

// ══════════════════════════════════════════════
// Function 1: askGemini (موجودة من قبل)
// ══════════════════════════════════════════════
exports.askGemini = onRequest(
  { secrets: [geminiKey], cors: true },
  async (req, res) => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "prompt is required" });
    }
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
// Function 2: sendEmergencySMS (جديدة - SMS تلقائي)
// ══════════════════════════════════════════════
function twilioSendSMS(sid, token, from, toNumber, message) {
  return new Promise((resolve, reject) => {
    const body = querystring.stringify({
      To:   toNumber.startsWith("+") ? toNumber : "+" + toNumber,
      From: from,
      Body: message,
    });
    const options = {
      hostname: "api.twilio.com",
      path:     `/2010-04-01/Accounts/${sid}/Messages.json`,
      method:   "POST",
      headers:  {
        "Content-Type":   "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(body),
        "Authorization":  "Basic " + Buffer.from(`${sid}:${token}`).toString("base64"),
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

exports.sendEmergencySMS = onRequest(
  { secrets: [twilioSid, twilioToken, twilioFrom], cors: true },
  async (req, res) => {
    if (req.method === "OPTIONS") return res.status(204).send("");
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const { patientId, patientName, bloodType, diseases } = req.body;
    if (!patientId) return res.status(400).json({ error: "patientId required" });

    try {
      const snapshot = await admin.database().ref(`users/${patientId}`).once("value");
      if (!snapshot.exists()) return res.status(404).json({ error: "Patient not found" });

      const patient   = snapshot.val();
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

      const result = await twilioSendSMS(
        twilioSid.value(),
        twilioToken.value(),
        twilioFrom.value(),
        waContact,
        smsMessage
      );

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
      console.error("SMS error:", err);
      try {
        await admin.database().ref(`sms_logs/${patientId || "unknown"}`).push({
          error: err.message, sentAt: new Date().toISOString(), status: "failed",
        });
      } catch(_) {}
      return res.status(500).json({ error: err.message });
    }
  }
);