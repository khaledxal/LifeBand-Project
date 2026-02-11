import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai"; // استيراد Gemini

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// تهيئة Gemini باستخدام المفتاح من ملف .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/api/emergency", async (req, res) => {
  try {
    const { patientName, history } = req.body;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      أنت مساعد طبي ذكي لمشروع LifeBand. 
      حلل حالة المريض الطارئة التالية:
      اسم المريض: ${patientName}
      السجل الطبي والأمراض: ${JSON.stringify(history)}

      المطلوب:
      1. تحديد مستوى الخطورة (عادي، متوسط، عالي، حرج).
      2. الإجراء الفوري الواجب اتخاذه من قبل المسعف.
      
      أجب باختصار شديد وباللغة العربية.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiText = response.text();

    // إرسال النتيجة للـ Frontend
    res.json({ analysis: aiText });

  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: "حدث خطأ في تحليل الذكاء الاصطناعي." });
  }
});

app.listen(3000, () => console.log("✅ السيرفر يعمل بذكاء Gemini على http://localhost:3000"));