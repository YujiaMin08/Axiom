
import { GoogleGenAI, Type } from "@google/genai";
import { LearningCategory } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateEducationalContent = async (topic: string, category: LearningCategory) => {
  const model = 'gemini-3-pro-preview';
  
  let systemInstruction = "";
  let responseSchema: any = null;

  if (category === LearningCategory.LANGUAGE) {
    systemInstruction = "You are a classical linguist and storyteller. Provide deep insights into language. Output must be in English for the content, but can use Chinese for explanations if appropriate for a learner.";
    responseSchema = {
      type: Type.OBJECT,
      properties: {
        word: { type: Type.STRING },
        phonetic: { type: Type.STRING },
        definition: { type: Type.STRING },
        usage: { type: Type.ARRAY, items: { type: Type.STRING } },
        etymology: { type: Type.STRING },
        story: { type: Type.STRING, description: "A creative story involving the word." },
        keySentence: { type: Type.STRING },
        quizzes: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              answerIndex: { type: Type.NUMBER },
              explanation: { type: Type.STRING }
            },
            required: ["question", "options", "answerIndex"]
          }
        }
      },
      required: ["word", "definition", "story", "quizzes"]
    };
  } else if (category === LearningCategory.SCIENCE) {
    systemInstruction = "You are a Renaissance natural philosopher like Leonardo or Newton. Transform scientific concepts into variables and interactive explanations.";
    responseSchema = {
      type: Type.OBJECT,
      properties: {
        concept: { type: Type.STRING },
        intuition: { type: Type.STRING, description: "A brief, intuitive explanation of the core idea." },
        formula: { type: Type.STRING },
        explanation: { type: Type.STRING },
        variables: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              label: { type: Type.STRING },
              min: { type: Type.NUMBER },
              max: { type: Type.NUMBER },
              current: { type: Type.NUMBER },
              unit: { type: Type.STRING }
            }
          }
        },
        scenarios: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["concept", "intuition", "variables", "formula"]
    };
  } else {
    // General / Liberal Arts
    systemInstruction = "You are a museum curator and polymath. Connect multiple disciplines.";
    responseSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            abstract: { type: Type.STRING },
            perspectives: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        field: { type: Type.STRING },
                        insight: { type: Type.STRING }
                    }
                }
            }
        },
        required: ["title", "abstract", "perspectives"]
    };
  }

  const response = await ai.models.generateContent({
    model,
    contents: `Generate a detailed learning space content for the topic: "${topic}" in the category: ${category}. Ensure it feels academic yet modern.`,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema,
      thinkingConfig: { thinkingBudget: 4000 }
    },
  });

  return JSON.parse(response.text);
};
