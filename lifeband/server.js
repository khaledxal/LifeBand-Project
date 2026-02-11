import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// تهيئة Gemini باستخدام المفتاح من .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/api/emergency", async (req, res) => {
  try {
    const { patientName, history } = req.body;

    // استخدام الاسم المستقر للنموذج (بدون كلمة latest)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      أنت مساعد طبي ذكي لمشروع LifeBand. حلل حالة المريض التالية:
      المريض: ${patientName}
      التاريخ الطبي: ${JSON.stringify(history)}

      المطلوب (بالعربية وباختصار شديد):
      1. تحديد مستوى الخطورة (عادي، متوسط، عالي، حرج).
      2. الإجراء الطبي الفوري المطلوب.
    `;

    // طلب توليد المحتوى
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiText = response.text();

    res.json({ analysis: aiText });

  } catch (error) {
    console.error("Gemini Error:", error);
    // في حال فشل Gemini، نرسل استجابة بديلة لكي لا يتوقف الموقع
    res.status(500).json({ analysis: "تنبيه: فشل تحليل الذكاء الاصطناعي. اتبع إجراءات الطوارئ القياسية فوراً." });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`✅ السيرفر يعمل بذكاء Gemini على http://localhost:${PORT}`));