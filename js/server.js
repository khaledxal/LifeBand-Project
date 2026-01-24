import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();

// إعداد CORS للسماح لصفحة الـ Frontend بالوصول للسيرفر
app.use(cors()); 
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // يتم جلبه من ملف .env 
});

app.post("/api/emergency", async (req, res) => {
  try {
    const { patientName, history } = req.body;

    // تحسين البرومبت ليعطي نتائج طبية أدق بناءً على سياق LifeBand
    const prompt = `
أنت مساعد طوارئ طبي ذكي لمشروع LifeBand. 
المريض الحالي: ${patientName}.

مهمتك: طرح أسئلة تشخيصية قصيرة للمسعف للوصول للإجراء المناسب.
يجب أن يكون الرد بصيغة JSON فقط وبنفس الهيكل التالي:
{
 "question": "السؤال القادم هنا",
 "options": ["خيار 1", "خيار 2"],
 "isFinal": false
}

إذا وصلت للتشخيص النهائي أو الإسعافات الأولية المطلوبة:
1. اجعل "question" يحتوي على الإرشادات النهائية.
2. اجعل "options" مصفوفة فارغة [].
3. اجعل "isFinal" قيمته true.

سجل الإجابات السابقة لتجنب التكرار:
${JSON.stringify(history)}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // الموديل المستخدم 
      messages: [{ role: "system", content: "أنت مساعد طبي متخصص في حالات الطوارئ." },
                 { role: "user", content: prompt }],
      response_format: { type: "json_object" } // لضمان عدم حدوث خطأ في القراءة (Parsing)
    });

    // إرسال النتيجة للـ Frontend
    const aiResponse = JSON.parse(completion.choices[0].message.content);
    res.json(aiResponse);

  } catch (error) {
    console.error("خطأ في السيرفر:", error);
    res.status(500).json({ error: "حدث خطأ أثناء معالجة الطلب." });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Server LifeBand running on: http://localhost:${PORT}`);
});