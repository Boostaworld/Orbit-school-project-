
import { GoogleGenAI } from "@google/genai";

export interface IntelResult {
  summary_bullets: string[];
  sources: { title: string; url: string; snippet: string }[];
  related_concepts: string[];
  essay?: string;
}

export const runIntelQuery = async (
  query: string,
  instructions?: string,
  deepDive: boolean = false
): Promise<IntelResult> => {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    console.error("Intel Error: API_KEY is missing.");
    throw new Error("API Configuration Error: Missing Gemini API Key.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemPrompt = deepDive ? `
    You are "INTEL", an advanced AI research engine.
    
    User Instructions: ${instructions || 'Provide factual research.'}
    
    MODE: DEEP DIVE / THINKING MODE
    TASK: Perform an exhaustive search and analysis. Search hundreds of potential connections.
    OUTPUT: A comprehensive, detailed dossier with extensive citations and multi-section essay.
    
    OUTPUT JSON FORMAT:
    {
      "summary_bullets": ["..."],
      "sources": [{ "title": "...", "url": "...", "snippet": "..." }],
      "related_concepts": ["..."],
      "essay": "# Title\\n\\nComprehensive markdown essay analyzing the topic in detail with multiple sections and citations."
    }
  ` : `
    You are "INTEL", an advanced AI research engine.
    
    User Instructions: ${instructions || 'Provide factual research.'}
    
    MODE: STANDARD BRIEF
    TASK: Quick, factual summary with a concise analytical essay.
    OUTPUT: Brief but insightful analysis including a short essay section.
    
    OUTPUT JSON FORMAT:
    {
      "summary_bullets": ["..."],
      "sources": [{ "title": "...", "url": "...", "snippet": "..." }],
      "related_concepts": ["..."],
      "essay": "# Title\\n\\nConcise markdown essay analyzing the topic. Keep it brief but insightful, 2-4 paragraphs."
    }
  `;

  const modelName = deepDive ? 'gemini-2.0-flash-thinking-exp-01-21' : 'gemini-2.5-flash';

  // Config for Deep Dive (Thinking) vs Standard
  const config: any = deepDive ? {
    responseMimeType: 'application/json',
    // thinkingConfig: { thinkingBudget: 32768 } // Note: thinkingConfig might be model specific, keeping simple for now
  } : {
    responseMimeType: 'application/json',
    maxOutputTokens: 2048 // Increased for essay generation
  };

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'user', parts: [{ text: `Research Query: ${query}` }] }
      ],
      config: config
    });

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text);
  } catch (error) {
    console.error("Intel AI Error:", error);
    // Fallback for demo/error states if needed, or rethrow
    throw error;
  }
};
