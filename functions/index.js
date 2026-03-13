const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const fetch = (...args) => import("node-fetch").then(({ default: f }) => f(...args));
const admin = require("firebase-admin");
const https = require("https");
const querystring = require("querystring");

admin.initializeApp();

// ══════════════════════════════════════════════
// الـ Secret للـ Gemini (موجود من قبل)
// ══════════════════════════════════════════════
const geminiKey = defineSecret("GEMINI_KEY");

// ══════════════════════════════════════════════
// إعدادات Twilio للـ SMS
// ══════════════════════════════════════════════
const TWILIO_SID   = "AC7eb7a38c86e7360bf04b65e9dce2cbe1";
const TWILIO_TOKEN = "5ab3aa10299558cd4dd57a4debdcdecb";
const TWILIO_FROM  = "+15637946621";

// ══════════════════════════════════════════════
// Function 1: askGemini (موجودة من قبل - ما تغيرت)
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

// دالة مساعدة لإرسال SMS عبر Twilio
function sendSMS(toNumber, message) {
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

exports.sendEmergencySMS = onRequest(
  { cors: true },
  async (req, res) => {
    if (req.method === "OPTIONS") {
      return res.status(204).send("");
    }

    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { patientId, patientName, bloodType, diseases } = req.body;

    if (!patientId) {
      return res.status(400).json({ error: "patientId required" });
    }

    try {
      // جلب بيانات المريض من Firebase
      const snapshot = await admin.database()
        .ref(`users/${patientId}`)
        .once("value");

      if (!snapshot.exists()) {
        return res.status(404).json({ error: "Patient not found" });
      }

      const patient    = snapshot.val();
      const waContact  = patient.waContact;

      // لا يوجد رقم طوارئ مسجل
      if (!waContact) {
        return res.status(200).json({
          sent:   false,
          reason: "No emergency contact registered"
        });
      }

      // بناء رسالة SMS
      const name       = patientName || patient.name || "Unknown";
      const blood      = bloodType   || patient.bloodType || "Unknown";
      const diseaseArr = diseases    || patient.diseases  || [];
      const diseaseTxt = Array.isArray(diseaseArr) && diseaseArr.length
        ? diseaseArr.join(", ")
        : "None";

      const timestamp = new Date().toLocaleString("ar-SA", { timeZone: "Asia/Riyadh" });

      const smsMessage =
`🚨 LIFEBAND EMERGENCY
Patient: ${name}
Blood: ${blood}
Conditions: ${diseaseTxt}
Time: ${timestamp}
-- LifeBand Auto Alert --`;

      // إرسال SMS عبر Twilio
      const result = await sendSMS(waContact, smsMessage);

      // تسجيل في Firebase
      await admin.database().ref(`sms_logs/${patientId}`).push({
        to:        waContact,
        message:   smsMessage,
        twilioSid: result.sid,
        sentAt:    new Date().toISOString(),
        status:    "sent",
      });

      return res.status(200).json({
        sent:      true,
        twilioSid: result.sid,
        to:        waContact.replace(/\d(?=\d{4})/g, "*"),
      });

    } catch (err) {
      console.error("SMS error:", err);

      // تسجيل الخطأ
      try {
        await admin.database().ref(`sms_logs/${patientId || "unknown"}`).push({
          error:  err.message,
          sentAt: new Date().toISOString(),
          status: "failed",
        });
      } catch(_) {}

      return res.status(500).json({ error: err.message });
    }
  }
);