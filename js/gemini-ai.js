// LifeBand AI Module - Powered by Google Gemini (Free)
// ⚠️ المفتاح يُقرأ من ملف config.js المحلي فقط - لا يُرفع على GitHub أبداً

// يقرأ المفتاح من window.GEMINI_KEY الذي يُعرَّف في config.js (مستبعد من git)
const GEMINI_API_KEY = window.GEMINI_KEY || "";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

/**
 * دالة عامة لاستدعاء Gemini API
 */
export async function askGemini(prompt) {
    const response = await fetch(GEMINI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 500, temperature: 0.4 }
        })
    });
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "لم يتم الحصول على رد";
}

/**
 * 1. تحليل الحالة الطبية عند الطوارئ
 */
export async function analyzeEmergency(patientData) {
    const prompt = `
أنت مساعد طبي طارئ متخصص. بناءً على البيانات التالية، قدّم تحليلاً سريعاً وإجراء طارئ فوري.

بيانات المريض:
- الاسم: ${patientData.name}
- فصيلة الدم: ${patientData.bloodType}
- الأمراض المزمنة: ${patientData.diseases?.join('، ') || 'لا يوجد'}

المطلوب (أجب باختصار شديد - 3 نقاط فقط):
1. أهم خطر محتمل على هذا المريض
2. الإجراء الفوري للمسعف (جملة واحدة)
3. تنبيه طبي مهم خاص بحالته

أجب بالعربية بشكل واضح وعملي.`;
    return await askGemini(prompt);
}

/**
 * 2. اقتراح تشخيص للمسعف في البلاغات
 */
export async function suggestDiagnosis(patientName, diseases, bloodType) {
    const prompt = `
أنت مسعف طبي. مريض اسمه "${patientName}" فصيلة دمه ${bloodType} ويعاني من: ${diseases?.join('، ') || 'غير محدد'}.

أعطني في 2-3 أسطر فقط:
- التشخيص المبدئي الأكثر احتمالاً
- الإجراء الميداني الفوري

أجب بالعربية مباشرة بدون مقدمات.`;
    return await askGemini(prompt);
}

/**
 * 3. مساعد طبي ذكي (chatbot)
 */
export async function medicalChatbot(userMessage, patientData = null) {
    const context = patientData 
        ? `معلومات المستخدم: فصيلة دم ${patientData.bloodType}، أمراض مزمنة: ${patientData.diseases?.join('، ') || 'لا يوجد'}.` 
        : '';
    
    const prompt = `
أنت مساعد طبي ذكي لتطبيق LifeBand الصحي. ${context}

سؤال المستخدم: "${userMessage}"

أجب بالعربية بشكل مفيد وموجز (3-4 جمل). تذكر دائماً أن تنصح بمراجعة طبيب عند الضرورة.`;
    return await askGemini(prompt);
}

/**
 * 4. نصائح طبية مخصصة بالـ AI
 */
export async function getPersonalizedTips(patientData) {
    const prompt = `
أنت طبيب متخصص. قدّم 3 نصائح صحية مخصصة لشخص:
- فصيلة دمه: ${patientData.bloodType}
- أمراضه المزمنة: ${patientData.diseases?.join('، ') || 'لا يوجد'}

النصائح يجب أن تكون عملية ومختصرة (جملة لكل نصيحة).
الصيغة: نقطة، نقطة، نقطة - بالعربية فقط.`;
    return await askGemini(prompt);
}
