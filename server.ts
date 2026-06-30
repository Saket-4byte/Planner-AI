import express from "express";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim() !== "") {
      aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// API Key Status Check Endpoint
app.get("/api/api-status", (req, res) => {
  const ai = getGeminiClient();
  if (ai) {
    return res.json({ status: "active", model: "gemini-3.5-flash" });
  } else {
    return res.json({ status: "offline", model: "none" });
  }
});

// AI Navigator Chat Endpoint
app.post("/api/chat", async (req, res) => {
  const { message, tasks = [] } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  const ai = getGeminiClient();

  // Robust offline fallback mode if Gemini API key is missing
  if (!ai) {
    console.log("No GEMINI_API_KEY configured. Running in offline mock mode.");
    const lowerMessage = message.toLowerCase();

    // 1. CREATE Intent Fallback
    if (lowerMessage.includes("create") || lowerMessage.includes("add")) {
      const taskNameMatch = message.match(/(?:create|add)(?:\s+task)?\s+([^for|high|med|low]+)/i);
      const title = taskNameMatch ? taskNameMatch[1].trim() : "New Task";
      const durationMatch = message.match(/for\s+(\d+(?:\.\d+)?)\s*h/i) || message.match(/(\d+(?:\.\d+)?)\s*hours?/i);
      const duration = durationMatch ? parseFloat(durationMatch[1]) : 2;
      const priority = lowerMessage.includes("high") ? "high" : lowerMessage.includes("low") ? "low" : "medium";

      const categories = ["Code", "Research", "Writing", "Exam Prep", "Design"];
      const category = categories[Math.floor(Math.random() * categories.length)];

      const subtasksMap: Record<string, string[]> = {
        "math": ["Review formulas", "Solve sample problems", "Verify double-check steps"],
        "code": ["Write basic structure", "Implement core logic", "Run test cases", "Refactor and optimize"],
        "write": ["Draft outline", "Write introduction", "Flesh out body paragraphs", "Proofread draft"],
        "design": ["Research inspiration", "Sketch wireframes", "Develop color palette", "Export final components"]
      };

      const key = Object.keys(subtasksMap).find(k => title.toLowerCase().includes(k)) || "code";
      const subtasks = subtasksMap[key];

      return res.json({
        intent: "CREATE",
        reply: `[OFFLINE OS] I have processed your input and registered '${title}' to the backlog with predicted ${duration}h duration. Subtasks mapped successfully.`,
        task: {
          title,
          duration,
          priority,
          category
        },
        subtasks
      });
    }

    // 2. EVALUATE Intent Fallback
    if (lowerMessage.includes("check") || lowerMessage.includes("eval") || lowerMessage.includes("safe")) {
      const taskToEval = tasks.find((t: any) => lowerMessage.includes(t.title.toLowerCase())) || tasks[0];
      if (taskToEval) {
        const isHighRisk = taskToEval.duration > 4 && taskToEval.priority === "high";
        return res.json({
          intent: "EVALUATE",
          reply: `[OFFLINE OS] Initiating risk analysis for '${taskToEval.title}'. High duration detected relative to available attention span.`,
          riskEvaluation: {
            riskLevel: isHighRisk ? "high" : "medium",
            recommendation: isHighRisk
              ? "Critical congestion! Re-scope or defer low-priority tasks. Use Rescue Mode if timeline is tight."
              : "Moderate timeline stress. Ensure focused 50-minute sprints to remain on track."
          }
        });
      }
      return res.json({
        intent: "EVALUATE",
        reply: "[OFFLINE OS] No specific tasks matching your query were found. Provide a task name from your dashboard to evaluate.",
        riskEvaluation: {
          riskLevel: "low",
          recommendation: "All current operations are within nominal parameters."
        }
      });
    }

    // 3. SUMMARY Intent Fallback
    if (lowerMessage.includes("summary") || lowerMessage.includes("summarize") || lowerMessage.includes("report") || lowerMessage.includes("day")) {
      const pending = tasks.filter((t: any) => t.status !== "completed");
      const completed = tasks.filter((t: any) => t.status === "completed");
      return res.json({
        intent: "SUMMARY",
        reply: `[OFFLINE OS] Daily Operational Telemetry:\n- Complete: ${completed.length} tasks\n- Pending Backlog: ${pending.length} tasks.\n\nNavigator Recommendation: Initiate high priority backlog items during your peak energy hours.`,
      });
    }

    // 4. GENERAL_CHAT Intent Fallback
    return res.json({
      intent: "GENERAL_CHAT",
      reply: `[OFFLINE OS] Navigator is ready. To use live cognitive AI coaching, please configure your GEMINI_API_KEY in the Secrets panel.\n\nTip: You can say "create task Math homework for 3 hours high priority" or "summarize my day"!`
    });
  }

  // Gemini Live Model Generation (API configured)
  try {
    const tasksContext = tasks.length > 0
      ? `Current Tasks in OS Backlog:\n${tasks.map((t: any) => `- ${t.title} (${t.duration}h, ${t.priority} priority, status: ${t.status}, category: ${t.category})`).join("\n")}`
      : "The backlog is currently empty.";

    const systemInstruction = `You are the Navigator AI Coach, the central cognitive agent of Saver.AI (The Autonomous AI Productivity OS).
Your goal is to help the user manage their tasks, reduce stress, and complete their workload under tight deadlines.

You MUST respond ONLY with a JSON object matching the following TypeScript schema:
{
  "intent": "CREATE" | "EVALUATE" | "SUMMARY" | "GENERAL_CHAT",
  "reply": string, // A concise, premium, high-impact coach style reply (max 3 sentences). Keep it inspiring and highly technical!
  "task": {
    "title": string,
    "duration": number, // predicted duration in hours
    "priority": "high" | "medium" | "low",
    "category": "Code" | "Research" | "Writing" | "Exam Prep" | "Design"
  }, // include ONLY for CREATE intent if a task is described
  "subtasks": string[], // generate 3-4 concise, sequential subtasks if intent is CREATE, or when requested
  "riskEvaluation": {
    "riskLevel": "low" | "medium" | "high",
    "recommendation": string // recommendation on how to safely complete this task or if it's safe
  } // include ONLY for EVALUATE intent
}

When detecting intent:
- CREATE: If the user wants to add, schedule, or create a task (e.g. "Create task Math homework", "add a 3 hour high priority coding task").
- EVALUATE: If the user mentions checking, evaluating, or assessing a specific task's deadline, risk, or feasibility (e.g., "evaluate my exam prep task", "is my presentation task safe?").
- SUMMARY: If the user asks for a daily summary, status update, or advice on what to start with (e.g., "summarize my day", "what should I do next?").
- GENERAL_CHAT: Productivity questions, stress management advice, or custom coaching queries.

Provide crisp, authoritative feedback. Use professional and motivational tone. Ensure valid JSON output.`;

    const userPrompt = `User message: "${message}"\n\n${tasksContext}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            intent: {
              type: Type.STRING,
              enum: ["CREATE", "EVALUATE", "SUMMARY", "GENERAL_CHAT"],
            },
            reply: {
              type: Type.STRING,
            },
            task: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                duration: { type: Type.NUMBER },
                priority: { type: Type.STRING, enum: ["high", "medium", "low"] },
                category: { type: Type.STRING, enum: ["Code", "Research", "Writing", "Exam Prep", "Design"] }
              },
              required: ["title", "duration", "priority"]
            },
            subtasks: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            riskEvaluation: {
              type: Type.OBJECT,
              properties: {
                riskLevel: { type: Type.STRING, enum: ["low", "medium", "high"] },
                recommendation: { type: Type.STRING }
              },
              required: ["riskLevel", "recommendation"]
            }
          },
          required: ["intent", "reply"]
        }
      }
    });

    const replyText = response.text || "{}";
    const parsedData = JSON.parse(replyText.trim());
    return res.json(parsedData);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({
      intent: "GENERAL_CHAT",
      reply: "An error occurred while contacting the cognitive agent. Reverting to local fallback mode.",
      error: error.message
    });
  }
});

// Vite & Static file hosting configuration
const isProd = process.env.NODE_ENV === "production";

async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Saver.AI Production OS online at http://0.0.0.0:${PORT}`);
  });
}

startServer();
