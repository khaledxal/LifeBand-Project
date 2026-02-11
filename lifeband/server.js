import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from 'gpt4all';

dotenv.config();

const GPT4All = pkg.GPT4All || pkg.default;

const app = express();
app.use(cors());
app.use(express.json());

// تحميل نموذج GPT4All
const gpt = await GPT4All.load({
  model: "./models/gpt4all-lora-quantized.bin",
});

app.post("/api/emergency", async (req, res) => {
  try {
    const { patientName, heartRate, oxygen, status, history } = req.body;

    const prompt = `
أنت نظام ذكاء اصطناعي طبي للطوارئ.

بيانات المريض:
الاسم: ${patientName}
معدل نبض القلب: ${heartRate || "غير معروف"}
نسبة الأكسجين: ${oxygen || "غير معروف"}
الأمراض المزمنة: ${history?.join(", ") || "لا يوجد"}
الحالة الحالية: ${status || "غير معروف"}

المطلوب:
1- حدد مستوى الخطورة (منخفض / متوسط / عالي / حرج)
2- أعطني الإجراء الطبي المقترح فوراً
3- الرد يجب أن يكون واضح ومباشر للطبيب أو المسعف
    `;

    const response = await gpt.generate({
      prompt: prompt,
      max_tokens: 300
    });

    res.json({ success: true, analysis: response.text });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "AI analysis failed", error: error.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
