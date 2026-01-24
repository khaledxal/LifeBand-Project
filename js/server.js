import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post("/api/emergency", async (req, res) => {
  const { patientName, history } = req.body;

  const prompt = `
أنت مساعد طوارئ طبي.
الرد JSON فقط.

{
 "question": "",
 "options": [],
 "isFinal": false
}

${JSON.stringify(history)}
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }]
  });

  res.json(JSON.parse(completion.choices[0].message.content));
});

app.listen(3000, () => console.log("Server running"));
