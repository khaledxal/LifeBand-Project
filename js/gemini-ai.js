// LifeBand AI Module - Powered by Google Gemini
// ⚠️ المفتاح يُقرأ من ملف config.js المحلي فقط - لا يُرفع على GitHub أبداً

/**
 * دالة عامة لاستدعاء Gemini API
 */
export async function askGemini(prompt) {
    // قراءة المفتاح من config.js
    const GEMINI_API_KEY = window.GEMINI_KEY || "";

    // التحقق من وجود المفتاح
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
        throw new Error(
            "مفتاح Gemini API غير موجود. يرجى:\n" +
            "1. الحصول على مفتاح مجاني من: https://aistudio.google.com/app/apikey\n" +
            "2. فتح ملف config.js\n" +
            "3. استبدال YOUR_GEMINI_API_KEY_HERE بمفتاحك الحقيقي"
        );
    }

    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(GEMINI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 500, temperature: 0.4 }
        })
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const errMsg = errData?.error?.message || `HTTP ${response.status}`;

        if (response.status === 400) {
            throw new Error("مفتاح API غير صالح. تأكد من المفتاح في ملف config.js");
        } else if (response.status === 403) {
            throw new Error("تم رفض المفتاح (403). تأكد أن Gemini API مفعّل في مشروعك على Google Cloud.\nالرسالة: " + errMsg);
        } else if (response.status === 429) {
            throw new Error("تجاوزت حد الطلبات المسموح (429). انتظر قليلاً ثم حاول مجدداً.");
        } else {
            throw new Error(`خطأ من Gemini API (${response.status}): ${errMsg}`);
        }
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "لم يتم الحصول على رد من AI";
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
