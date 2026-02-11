import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { loadModel, createCompletion } from 'gpt4all';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// استخدام المسار المحلي داخل المشروع لضمان الوصول للملف
const MODEL_NAME = 'DeepSeek-R1-Distill-Qwen-7B-Q4_0.gguf';
const MODEL_PATH = './models'; 

console.log("⏳ جاري تشغيل الموديل من داخل مجلد المشروع...");

let model;

async function initializeAI() {
    try {
        // تحميل الموديل
        model = await loadModel(MODEL_NAME, {
            modelPath: MODEL_PATH,
            device: 'cpu', // الموديل يتطلب 8GB RAM
            verbose: true
        });
        console.log("✅ تم التشغيل بنجاح! DeepSeek جاهز لتحليل حالات LifeBand.");
    } catch (err) {
        console.error("❌ فشل التحميل: تأكد من نقل الملف إلى مجلد models وإغلاق أي برامج تستخدمه.");
    }
}

initializeAI();

app.post("/api/emergency", async (req, res) => {
    if (!model) return res.status(500).json({ success: false, message: "جاري تحميل الموديل..." });

    try {
        const { patientName, heartRate, oxygen, status, history } = req.body;

        // تنسيق Prompt لتحسين جودة الرد باللغة العربية
        const prompt = `### Instruction:
أنت نظام خبير في طب الطوارئ. حلل الحالة التالية واقترح الإجراء الفوري باللغة العربية:
اسم المريض: ${patientName}
النبض: ${heartRate}
الأكسجين: ${oxygen}
الحالة: ${status}
### Response:`;

        const chat = await createCompletion(model, [{ role: 'user', content: prompt }]);
        res.json({ success: true, analysis: chat.choices[0].message.content });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 السيرفر يعمل على: http://localhost:${PORT}`));