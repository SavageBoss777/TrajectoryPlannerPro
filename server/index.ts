import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

// Load environment variables
dotenv.config({ path: ".env" });

// Debug: confirm key is loading
console.log(
  "OPENAI key loaded?",
  process.env.OPENAI_API_KEY ? "YES" : "NO"
);

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Simple health route
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/api/chat", async (req, res) => {
  try {
    const { question, context } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Missing question" });
    }

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "You are the Trajectory Results Assistant. Answer ONLY using the provided context. Be concise. Use bullet points when helpful.",
        },
        {
          role: "user",
          content:
            `USER QUESTION:\n${question}\n\n` +
            `CONTEXT JSON:\n${JSON.stringify(context)}`,
        },
      ],
      max_output_tokens: 250,
    });

    res.json({
      answer: response.output_text,
    });
  } catch (err: any) {
    console.error("CHAT ERROR:", err?.message ?? err);

    res.status(500).json({
      error: "Server error",
      detail: err?.message ?? String(err),
    });
  }
});

app.listen(8787, () => {
  console.log("AI server running on http://localhost:8787");
});