// LifeBand AI Module - Powered by Groq

const _cache = new Map();
let _lastCallTime = 0;
const MIN_INTERVAL_MS = 500;

// Returns a promise that resolves after the specified delay in milliseconds
async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Gets the current preferred language from localStorage (defaults to 'ar')
function getLang() {
    return localStorage.getItem('preferred_lang') || 'ar';
}

// Sends a prompt to the Groq API with caching, rate-limiting and retry logic
export async function askGroq(prompt, retries = 3) {
    if (_cache.has(prompt)) return _cache.get(prompt);

    const now = Date.now();
    const gap = now - _lastCallTime;
    if (gap < MIN_INTERVAL_MS) await sleep(MIN_INTERVAL_MS - gap);
    _lastCallTime = Date.now();

    const GROQ_URL = "https://green-meadow-35a6.fyyghgggg.workers.dev";

    const lang = getLang();
    const isAr = lang === 'ar';

    for (let attempt = 1; attempt <= retries; attempt++) {
        const response = await fetch(GROQ_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
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
            throw new Error(isAr ? "⚠️ الخادم مشغول حالياً، يرجى المحاولة بعد قليل." : "⚠️ Server is busy, please try again shortly.");
        }

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err?.error?.message || (isAr ? `خطأ ${response.status}` : `Error ${response.status}`));
        }

        const data = await response.json();
        const result = data.choices?.[0]?.message?.content || (isAr ? "لم يتم الحصول على رد" : "No response received");

        _cache.set(prompt, result);
        setTimeout(() => _cache.delete(prompt), 5 * 60 * 1000);

        return result;
    }
}

// Analyzes a patient's emergency medical data and returns a brief AI assessment
export async function analyzeEmergency(patientData) {
    const lang = getLang();
    const isAr = lang === 'ar';

    const prompt = isAr
        ? `أنت مساعد طبي طارئ متخصص. بناءً على البيانات التالية، قدّم تحليلاً سريعاً وإجراء طارئ فوري.

بيانات المريض:
- الاسم: ${patientData.name}
- فصيلة الدم: ${patientData.bloodType}
- الأمراض المزمنة: ${patientData.diseases?.join('، ') || 'لا يوجد'}

المطلوب (أجب باختصار شديد - 3 نقاط فقط):
1. أهم خطر محتمل على هذا المريض
2. الإجراء الفوري للمسعف (جملة واحدة)
3. تنبيه طبي مهم خاص بحالته

أجب بالعربية بشكل واضح وعملي.`
        : `You are a specialized emergency medical assistant. Based on the following data, provide a quick analysis and immediate emergency action.

Patient Data:
- Name: ${patientData.name}
- Blood Type: ${patientData.bloodType}
- Chronic Diseases: ${patientData.diseases?.join(', ') || 'None'}

Required (answer very briefly - 3 points only):
1. The most likely risk for this patient
2. Immediate action for the rescuer (one sentence)
3. Important medical alert specific to their condition

Answer in English clearly and practically.`;
    return await askGroq(prompt);
}

// Suggests an initial diagnosis based on patient info for field paramedics
export async function suggestDiagnosis(patientName, diseases, bloodType) {
    const lang = getLang();
    const isAr = lang === 'ar';

    const prompt = isAr
        ? `أنت مسعف طبي. مريض اسمه "${patientName}" فصيلة دمه ${bloodType} ويعاني من: ${diseases?.join('، ') || 'غير محدد'}.

أعطني في 2-3 أسطر فقط:
- التشخيص المبدئي الأكثر احتمالاً
- الإجراء الميداني الفوري

أجب بالعربية مباشرة بدون مقدمات.`
        : `You are a medical paramedic. A patient named "${patientName}" with blood type ${bloodType} suffers from: ${diseases?.join(', ') || 'Not specified'}.

Give me in 2-3 lines only:
- The most likely initial diagnosis
- Immediate field action

Answer in English directly without introductions.`;
    return await askGroq(prompt);
}

// AI medical chatbot that answers user health questions with optional patient context
export async function medicalChatbot(userMessage, patientData = null) {
    const lang = getLang();
    const isAr = lang === 'ar';

    const context = patientData
        ? (isAr
            ? `معلومات المستخدم: فصيلة دم ${patientData.bloodType}، أمراض مزمنة: ${patientData.diseases?.join('، ') || 'لا يوجد'}.`
            : `User info: Blood type ${patientData.bloodType}, chronic diseases: ${patientData.diseases?.join(', ') || 'None'}.`)
        : '';

    const prompt = isAr
        ? `أنت مساعد طبي ذكي لتطبيق LifeBand الصحي. ${context}

سؤال المستخدم: "${userMessage}"

أجب بالعربية بشكل مفيد وموجز (3-4 جمل). تذكر دائماً أن تنصح بمراجعة طبيب عند الضرورة.`
        : `You are a smart medical assistant for the LifeBand health app. ${context}

User question: "${userMessage}"

Answer in English helpfully and concisely (3-4 sentences). Always remember to advise consulting a doctor when necessary.`;
    return await askGroq(prompt);
}

// Generates personalized health tips based on the patient's blood type and chronic conditions
export async function getPersonalizedTips(patientData) {
    const lang = getLang();
    const isAr = lang === 'ar';

    const prompt = isAr
        ? `أنت طبيب متخصص. قدّم 3 نصائح صحية مخصصة لشخص:
- فصيلة دمه: ${patientData.bloodType}
- أمراضه المزمنة: ${patientData.diseases?.join('، ') || 'لا يوجد'}

النصائح يجب أن تكون عملية ومختصرة (جملة لكل نصيحة).
الصيغة: نقطة، نقطة، نقطة - بالعربية فقط.`
        : `You are a specialist doctor. Provide 3 personalized health tips for a person:
- Blood type: ${patientData.bloodType}
- Chronic diseases: ${patientData.diseases?.join(', ') || 'None'}

Tips should be practical and brief (one sentence each).
Format: bullet point, bullet point, bullet point - in English only.`;
    return await askGroq(prompt);
}
