import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/analyze", async (req, res) => {
    try {
      const { text } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: "GEMINI_API_KEY missing" });
      
      if (!text || text.trim().length === 0) {
        return res.json({
          scores: { grammar: 100, spelling: 100, clarity: 100, readability: 100 },
          suggestions: []
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are NeoBot, an intelligent writing assistant. Analyze the following text and return a JSON object ONLY. Do not wrap in markdown blocks, just raw JSON.
      Format:
      {
        "scores": {
          "grammar": (0-100),
          "spelling": (0-100),
          "clarity": (0-100),
          "readability": (0-100)
        },
        "suggestions": [
          {
            "id": "unique-id",
            "type": "grammar" | "spelling" | "flow" | "tone",
            "original": "the exact text to replace",
            "replacement": "suggested replacement",
            "reason": "brief reason"
          }
        ]
      }
      
      Text to analyze:
      """
      ${text}
      """`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: { temperature: 0.2 }
      });

      let jsonStr = response.text || "{}";
      jsonStr = jsonStr.replace(/```json\n?|```/g, '').trim();
      const result = JSON.parse(jsonStr);
      res.json(result);
    } catch (error: any) {
      console.error("Error in analyze API:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/rewrite", async (req, res) => {
    try {
      const { text, mode } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: "GEMINI_API_KEY missing" });
      
      let instruction = "Rewrite the following text to fix grammar and spelling.";
      switch (mode) {
        case "professional": instruction = "Rewrite the following text to sound highly professional, suitable for emails, reports, and assignments."; break;
        case "casual": instruction = "Rewrite the following text to sound casual, friendly, and approachable."; break;
        case "shorter": instruction = "Make the following text shorter and more concise without losing key information."; break;
        case "longer": instruction = "Expand the following text to add more detail and flow."; break;
        case "genz": instruction = "Rewrite the following text in modern Gen Z slang. Sound friendly and cool. Use emojis."; break;
        case "academic": instruction = "Rewrite the following text for an academic or scholarly context. Use formal vocabulary."; break;
        case "simplify": instruction = "Simplify the following text so it's easy for anyone to understand. Use plain language."; break;
        case "summarize": instruction = "Provide a brief summary of the following text."; break;
        case "translate": instruction = "Translate the following text into clear, natural English (if not English) or improve it (if already English)."; break;
        case "vocabulary": instruction = "Enhance the vocabulary of the following text, making it more eloquent."; break;
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are NeoBot, an intelligent writing assistant. ${instruction}
      Respond ONLY with the rewritten text. Do not include quotes, markdown blocks, or conversational filler.
      
      Original text:
      """
      ${text}
      """`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: { temperature: 0.7 }
      });

      res.json({ text: response.text?.trim() });
    } catch (error: any) {
      console.error("Error in rewrite API:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY environment variable is required" });
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const systemInstruction = "You are NeoBot, an intelligent writing assistant built into Neonotex. Your personality is Friendly, Gen Z, Supportive, Fast, and Smart. You never sound robotic. Use modern but professional language. If someone says hi, respond with something like: 'Hey bestie! 🌸 I'm NeoBot. I'll help make your notes cleaner, smarter, and easier to read. Ready to cook? ✨'";
      
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
            ...history,
            message
        ],
        config: {
            systemInstruction: systemInstruction,
            temperature: 0.7
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Error in chat API:", error);
      res.status(500).json({ error: error.message || "Failed to generate response" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
