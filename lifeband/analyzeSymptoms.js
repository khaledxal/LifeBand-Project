const functions = require("firebase-functions");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// حط مفتاح Gemini هنا (مؤقتاً)
const genAI = new GoogleGenerativeAI("AIzaSyBkaHQrGzkKK-res_E13S5Zqn2pBzW7qqo");

exports.analyzeSymptoms = functions.https.onRequest(async (req, res) => {
  try {
    const { symptoms, patientData } = req.body;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
    أنت نظام طبي للطوارئ.
    حلل الأعراض التالية:

    الأعراض:
    ${symptoms}

    بيانات المريض:
    ${JSON.stringify(patientData)}

    اعطني:
    - مستوى الخطورة (منخفض - متوسط - عالي - حرج)
    - الإجراء المطلوب
    - هل يحتاج إسعاف فوراً؟
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ analysis: text });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Analysis failed" });
  }
});
