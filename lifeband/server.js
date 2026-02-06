import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/api/emergency", async (req, res) => {
  try {
    const { patientName, history } = req.body;

    const prompt = `أنت مساعد طبي للمشروع LifeBand... المريض: ${patientName} ... تاريخ الإجابات: ${JSON.stringify(history)}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "أنت مساعد طبي متخصص في الطوارئ." },
        { role: "user", content: prompt }
      ]
    });

    const aiResponse = JSON.parse(completion.choices[0].message.content.trim());
    res.json(aiResponse);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "حدث خطأ في السيرفر." });
  }
});

app.listen(3000, () => console.log("✅ السيرفر يعمل على http://localhost:3000"));
