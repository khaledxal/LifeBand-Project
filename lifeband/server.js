import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { loadModel, createCompletion } from 'gpt4all';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// إعدادات الموديل المحلي
const MODEL_NAME = 'DeepSeek-R1-Distill-Qwen-7B-Q4_0.gguf';
const MODEL_PATH = './models'; 

let model;

async function initializeAI() {
    try {
        console.log("⏳ جاري تحميل الموديل المحلي...");
        model = await loadModel(MODEL_NAME, {
            modelPath: MODEL_PATH,
            device: 'cpu', // يتطلب 8GB RAM
            verbose: true
        });
        console.log("✅ DeepSeek جاهز للعمل!");
    } catch (err) {
        console.error("❌ فشل تحميل الموديل:", err.message);
    }
}

initializeAI();

app.post("/api/emergency", async (req, res) => {
    if (!model) return res.status(500).json({ success: false, message: "الموديل لا يزال يتحمل..." });

    try {
        const { patientName, heartRate, oxygen, status, history } = req.body;

        // تنسيق Prompt خاص بموديلات DeepSeek لضمان أفضل نتيجة بالعربية
        const prompt = `<｜User｜>أنت نظام خبير في طب الطوارئ. حلل الحالة التالية واقترح مستوى الخطورة والإجراء الفوري باللغة العربية باختصار شديد:
المريض: ${patientName}
النبض: ${heartRate || "غير متوفر"}
الأكسجين: ${oxygen || "غير متوفر"}
التاريخ الطبي: ${history?.join(", ") || "لا يوجد"}
الحالة الحالية: ${status || "غير معروفة"}<｜Assistant｜>`;

        const chat = await createCompletion(model, prompt, {
            max_tokens: 500,
            temp: 0.6
        });

        // إزالة "تفكير الموديل" <think> لإعطاء المسعف النتيجة النهائية فقط
        let text = chat.choices[0].message.content;
        text = text.replace(/<think>[\s\S]*?<\/think>/, '').trim();

        res.json({ success: true, analysis: text });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 السيرفر يعمل على: http://localhost:${PORT}`));