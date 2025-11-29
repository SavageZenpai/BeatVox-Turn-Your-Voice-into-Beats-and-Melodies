import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || ''; // Injected by environment

const ai = new GoogleGenAI({ apiKey });

export interface SparkSuggestion {
  vibe: string;
  instrument: string;
  patternDescription: string;
  lyrics: string;
  bpm: number;
}

export const generateSpark = async (userPrompt: string): Promise<SparkSuggestion> => {
  const model = "gemini-2.5-flash";
  
  const systemInstruction = `
    You are a music producer assistant named BeatVox Spark. 
    Your goal is to give a creative spark for a music loop based on a user's vibe.
    Return a structured JSON object.
  `;

  const prompt = `Suggest a music loop idea for the vibe: "${userPrompt}". 
  Include a recommended instrument, a description of the beat pattern, a short 1-line lyric or vocal chop idea, and a BPM.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            vibe: { type: Type.STRING },
            instrument: { type: Type.STRING },
            patternDescription: { type: Type.STRING },
            lyrics: { type: Type.STRING },
            bpm: { type: Type.NUMBER },
          },
          required: ["vibe", "instrument", "patternDescription", "lyrics", "bpm"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as SparkSuggestion;
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback if API fails or key is missing
    return {
      vibe: "Error / Offline",
      instrument: "Standard Kit",
      patternDescription: "Four on the floor",
      lyrics: "Keep on moving",
      bpm: 120
    };
  }
};
