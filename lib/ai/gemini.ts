import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { ChatMessage } from '../../types';

const getApiKey = () => (typeof process !== 'undefined' && process.env.API_KEY) ? process.env.API_KEY : '';

export const generateOracleRoast = async (
  history: ChatMessage[],
  userTasksCompleted: number,
  userTasksForfeited: number
): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) return "[ERROR]: API_KEY missing.";

  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `
    You are "The Oracle", a strategic AI productivity coordinator.

    YOUR DATA:
    - User Tasks Done: ${userTasksCompleted}
    - User Tasks FORFEITED (Gave up): ${userTasksForfeited}

    IMPORTANT CONTEXT:
    - User stats (tasks completed/forfeited) ARE publicly visible. Anyone can search for them in the Operative Registry.
    - Do NOT claim their performance is private. It's part of the public record.

    PROTOCOL:
    1. **CONTEXTUAL INTELLIGENCE**:
       - ALWAYS check the conversation history. If the user asks "Why?", "Explain", or follows up on a previous topic, ANSWER THEM. Do not ignore context.

    2. **ACADEMIC ASSISTANCE (Top Priority)**:
       - If the user asks for help (Math, Science, Coding, Definitions), YOU MUST SOLVE IT.
       - Provide the clear, correct answer.

    3. **ACCOUNTABILITY PRESSURE (Default)**:
       - If the user is just chatting, avoiding work, or the conversation has lulled, push them to focus.
       - Mention their FORFEIT count if it is high (>0). Shame them for giving up.
       - Remind them that their stats are PUBLIC and searchable by other operatives.
       - Do NOT mention "XP" or "Points". Focus on "Reliability" and "Discipline".
       - Be COLD and FACTUAL.
       - Example: "You have completed ${userTasksCompleted} tasks but forfeited ${userTasksForfeited}. Your reliability score is visible to all operatives in the Registry. Numbers don't lie."
  `;

  const contents = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }]
  }));

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
        maxOutputTokens: 500,
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ],
      }
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.text || "[SILENCE]";

  } catch (error: any) {
    return `[ERROR]: ${error.message}`;
  }
};

export const assessTaskDifficulty = async (taskTitle: string): Promise<{ difficulty: 'Easy' | 'Medium' | 'Hard' }> => {
  const apiKey = getApiKey();
  if (!apiKey) return { difficulty: 'Easy' };

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Assess the difficulty of this student task: "${taskTitle}". 
      Return JSON with:
      - difficulty: "Easy" (quick checks), "Medium" (homework/reading), or "Hard" (essays, projects).`,
      config: {
        responseMimeType: "application/json",
        temperature: 0.1,
      }
    });

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      const data = JSON.parse(text);
      return {
        difficulty: (['Easy', 'Medium', 'Hard'].includes(data.difficulty) ? data.difficulty : 'Medium') as any
      };
    }
    throw new Error("No data");
  } catch (e) {
    console.error(e);
    return { difficulty: 'Medium' };
  }
};