// LifeBand AI Module - Powered by Groq
// ✅ المفتاح يأتي تلقائياً من GitHub Actions - لا يظهر في الكود أبداً

const _cache = new Map();
let _lastCallTime = 0;
const MIN_INTERVAL_MS = 500;

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function askGroq(prompt, retries = 3) {
const GROQ_API_KEY = window.GROQ_KEY || "__GROQ_KEY__";


if (!GROQ_API_KEY || GROQ_API_KEY === "__GROQ_KEY__") {
            throw new Error("⚠️ مفتاح Groq غير متوفر");
    }

    if (_cache.has(prompt)) return _cache.get(prompt);

    const now = Date.now();
    const gap = now - _lastCallTime;
    if (gap < MIN_INTERVAL_MS) await sleep(MIN_INTERVAL_MS - gap);
    _lastCallTime = Date.now();

    const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

    for (let attempt = 1; attempt <= retries; attempt++) {
        const response = await fetch(GROQ_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 500,
                temperature: 0.4
            })
        });

        if (response.status === 429) {
            const waitMs = attempt * 3000;
            console.warn(`Groq rate limit hit. Retrying in ${waitMs/1000}s... (attempt ${attempt}/${retries})`);
            if (attempt < retries) { await sleep(waitMs); continue; }
            throw new Error("⚠️ الخادم مشغول حالياً، يرجى المحاولة بعد قليل.");
        }

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err?.error?.message || `خطأ ${response.status}`);
        }

        const data = await response.json();
        const result = data.choices?.[0]?.message?.content || "لم يتم الحصول على رد";

        _cache.set(prompt, result);
        setTimeout(() => _cache.delete(prompt), 5 * 60 * 1000);

        return result;
    }
}

/** 1. تحليل الحالة الطبية عند الطوارئ */
export async function analyzeEmergency(patientData) {
    const prompt = `أنت مساعد طبي طارئ متخصص. بناءً على البيانات التالية، قدّم تحليلاً سريعاً وإجراء طارئ فوري.

بيانات المريض:
- الاسم: ${patientData.name}
- فصيلة الدم: ${patientData.bloodType}
- الأمراض المزمنة: ${patientData.diseases?.join('، ') || 'لا يوجد'}

المطلوب (أجب باختصار شديد - 3 نقاط فقط):
1. أهم خطر محتمل على هذا المريض
2. الإجراء الفوري للمسعف (جملة واحدة)
3. تنبيه طبي مهم خاص بحالته

أجب بالعربية بشكل واضح وعملي.`;
    return await askGroq(prompt);
}

/** 2. اقتراح تشخيص للمسعف في البلاغات */
export async function suggestDiagnosis(patientName, diseases, bloodType) {
    const prompt = `أنت مسعف طبي. مريض اسمه "${patientName}" فصيلة دمه ${bloodType} ويعاني من: ${diseases?.join('، ') || 'غير محدد'}.

أعطني في 2-3 أسطر فقط:
- التشخيص المبدئي الأكثر احتمالاً
- الإجراء الميداني الفوري

أجب بالعربية مباشرة بدون مقدمات.`;
    return await askGroq(prompt);
}

/** 3. مساعد طبي ذكي (chatbot) */
export async function medicalChatbot(userMessage, patientData = null) {
    const context = patientData
        ? `معلومات المستخدم: فصيلة دم ${patientData.bloodType}، أمراض مزمنة: ${patientData.diseases?.join('، ') || 'لا يوجد'}.`
        : '';
    const prompt = `أنت مساعد طبي ذكي لتطبيق LifeBand الصحي. ${context}

سؤال المستخدم: "${userMessage}"

أجب بالعربية بشكل مفيد وموجز (3-4 جمل). تذكر دائماً أن تنصح بمراجعة طبيب عند الضرورة.`;
    return await askGroq(prompt);
}

/** 4. نصائح طبية مخصصة بالـ AI */
export async function getPersonalizedTips(patientData) {
    const prompt = `أنت طبيب متخصص. قدّم 3 نصائح صحية مخصصة لشخص:
- فصيلة دمه: ${patientData.bloodType}
- أمراضه المزمنة: ${patientData.diseases?.join('، ') || 'لا يوجد'}

النصائح يجب أن تكون عملية ومختصرة (جملة لكل نصيحة).
الصيغة: نقطة، نقطة، نقطة - بالعربية فقط.`;
    return await askGroq(prompt);
}