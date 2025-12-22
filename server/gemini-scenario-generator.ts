/**
 * Gemini 场景生成器
 * 生成互动式语言学习场景（区别于叙事性故事）
 */

import { GoogleGenAI, Type } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is required. Please set it in your .env file.');
}
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

/**
 * 场景输出结构
 */
interface ScenarioContentOutput {
  title: string;
  scenario_type: 'roleplay' | 'conversation' | 'situation';
  setting: {
    location: string;
    context: string;
    your_role: string;
    other_characters: string[];
  };
  dialogue_sequence: Array<{
    step: number;
    situation: string;  // 当前情境描述
    npc_says?: string;  // NPC的话（如果有）
    your_options: Array<{
      text: string;
      appropriateness: 'excellent' | 'good' | 'acceptable' | 'poor';
      tone: string;  // formal, polite, casual, rude, etc.
      feedback: string;  // 为什么这个选择好/不好
      vocabulary_highlighted?: string[];  // 这个选项中的关键词汇
    }>;
    learning_point?: string;  // 这一步要学习的语言点
  }>;
  key_vocabulary: Array<{
    word: string;
    meaning: string;
    usage_context: string;
  }>;
  cultural_notes?: string[];  // 文化注意事项
}

/**
 * 使用 Gemini 3 Flash 生成互动场景
 */
export async function generateScenarioContent(
  topic: string,
  modulePlan: any,
  context?: {
    difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
    focus_skills?: string[];  // e.g., ['politeness', 'medical_vocabulary']
  }
): Promise<ScenarioContentOutput> {
  
  const level = context?.difficulty_level || 'beginner';

  const systemInstruction = `You are an expert language learning scenario designer, creating interactive roleplay situations for English learners.

Your scenarios are NOT passive stories - they are ACTIVE practice environments where the learner makes choices and receives feedback.

Key Differences from Stories:

**Story (Narrative)**:
- Third person: "Mia walked into the cafe..."
- Student reads passively
- Linear narrative

**Scenario (Interactive)**:
- Second person: "YOU walk into the cafe..."
- Student makes choices: "What do you say?"
- Branching possibilities with feedback

Scenario Design Principles:

1. **Clear Context**: Set the scene vividly
2. **Practical Situations**: Real-life scenarios students might encounter
3. **Choice Points**: 3-4 dialogue options for each interaction
4. **Differentiated Options**: Options should vary in appropriateness, tone, formality
5. **Educational Feedback**: Explain why each choice is good/poor
6. **Progressive Difficulty**: Start simple, build complexity
7. **Cultural Awareness**: Include cultural context when relevant

For each dialogue step:
- Describe the situation
- What the other person says (if applicable)
- 3-4 options for how YOU respond
- Clear feedback on each option
- Highlight key vocabulary used`;

  const userPrompt = `Topic/Scenario: "${topic}"
Difficulty Level: ${level}
${context?.focus_skills ? `Focus Skills: ${context.focus_skills.join(', ')}` : ''}

Create an interactive language learning scenario.

Requirements:
1. Set the scene (location, context, your role)
2. Design 3-4 dialogue interaction steps (keep it concise)
3. For each step, provide 3 response options with varying appropriateness
4. Provide BRIEF feedback for each option (max 1-2 sentences)
5. Extract 5-6 key vocabulary words used in the scenario
6. Include 1-2 cultural notes if relevant

IMPORTANT:
- Keep feedback text SHORT and simple
- Avoid complex nested structures
- Use simple, clear language
- Do NOT use quotes or apostrophes in feedback text - use simpler phrasing instead

Make it practical, engaging, and educational. The learner should feel like they're practicing real communication.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      scenario_type: {
        type: Type.STRING,
        enum: ["roleplay", "conversation", "situation"]
      },
      setting: {
        type: Type.OBJECT,
        properties: {
          location: { type: Type.STRING },
          context: { type: Type.STRING },
          your_role: { type: Type.STRING },
          other_characters: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      },
      dialogue_sequence: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            step: { type: Type.NUMBER },
            situation: { type: Type.STRING },
            npc_says: { type: Type.STRING },
            your_options: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  appropriateness: {
                    type: Type.STRING,
                    enum: ["excellent", "good", "acceptable", "poor"]
                  },
                  tone: { type: Type.STRING },
                  feedback: { type: Type.STRING },
                  vocabulary_highlighted: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              }
            },
            learning_point: { type: Type.STRING }
          }
        }
      },
      key_vocabulary: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING },
            meaning: { type: Type.STRING },
            usage_context: { type: Type.STRING }
          }
        }
      },
      cultural_notes: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ["title", "scenario_type", "setting", "dialogue_sequence", "key_vocabulary"]
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: userPrompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema,
      temperature: 0.7,
      maxOutputTokens: 8192,
      thinkingConfig: { thinkingLevel: 'minimal' }  // 降低 thinking level 避免过长输出
    },
  });

  try {
    return JSON.parse(response.text);
  } catch (parseError) {
    console.error('❌ Scenario JSON 解析失败');
    console.error('响应长度:', response.text.length);
    console.error('前 200 字符:', response.text.substring(0, 200));
    console.error('后 200 字符:', response.text.substring(response.text.length - 200));
    
    // 保存原始响应用于调试
    const fs = await import('fs');
    fs.writeFileSync('./scenario-raw-response.txt', response.text, 'utf-8');
    console.error('已保存到: scenario-raw-response.txt');
    
    throw parseError;
  }
}

