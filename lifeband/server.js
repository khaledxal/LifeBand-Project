import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

/* ===============================
   🔥 Gemini Setup
================================= */
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/* ===============================
   🚨 Emergency AI Endpoint
================================= */
app.post("/api/emergency", async (req, res) => {
  try {
    const { patientName, heartRate, oxygen, status, history } = req.body;

    const prompt = `
أنت نظام ذكاء اصطناعي طبي للطوارئ.

بيانات المريض:
الاسم: ${patientName}
معدل نبض القلب: ${heartRate}
نسبة الأكسجين: ${oxygen}
الأمراض المزمنة: ${history?.join(", ") || "لا يوجد"}
الحالة الحالية: ${status}

المطلوب:
1- حدد مستوى الخطورة (منخفض / متوسط / عالي / حرج)
2- أعطني الإجراء الطبي المقترح فوراً
3- الرد يجب أن يكون واضح ومباشر للطبيب أو المسعف
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    res.json({
      success: true,
      analysis: response.text,
    });

  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({
      success: false,
      message: "AI analysis failed",
      error: error.message,
    });
  }
});


/* ===============================
   🚀 Start Server
================================= */
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
