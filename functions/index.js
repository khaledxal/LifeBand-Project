const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const fetch = (...args) => import("node-fetch").then(({ default: f }) => f(...args));

// المفتاح محفوظ في Firebase Secret Manager - لا يظهر في الكود أبداً
const geminiKey = defineSecret("GEMINI_KEY");

exports.askGemini = onRequest(
  { secrets: [geminiKey], cors: true },
  async (req, res) => {
    // السماح فقط بـ POST
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
