/**
 * Gemini AI Intent Analyzer
 * 智能分析用户输入意图：判断是创建新 Canvas 还是扩展当前 Canvas
 */

import { GoogleGenAI, Type } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is required. Please set it in your .env file.');
}
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

/**
 * 意图分析结果
 */
export interface IntentAnalysis {
  action: 'NEW_CANVAS' | 'EXPAND_CANVAS';
  topic?: string;           // 如果是新 Canvas，提取出的主题
  moduleType?: string;      // 如果是扩展，建议的模块类型
  reasoning?: string;       // AI 的推理过程
}

/**
 * 使用 Gemini AI 分析用户意图
 * 
 * @param userPrompt - 用户输入的内容
 * @param currentTopic - 当前 Canvas 的主题（如果有）
 * @param currentDomain - 当前 Canvas 的领域
 * @returns 意图分析结果
 */
export async function analyzeIntentWithAI(
  userPrompt: string,
  currentTopic: string = '',
  currentDomain: string = ''
): Promise<IntentAnalysis> {
  
  const systemInstruction = `You are an intelligent intent analyzer for Axiom, an educational learning platform.

Your role is to analyze user input and determine their intent:

1. **NEW_CANVAS**: User wants to learn about a NEW topic (start fresh)
2. **EXPAND_CANVAS**: User wants to ADD more content to the CURRENT topic

Current Context:
- Current Topic: "${currentTopic || 'None (empty canvas)'}"
- Current Domain: "${currentDomain || 'Not set'}"

Guidelines for Intent Recognition:

**NEW_CANVAS signals:**
- Explicitly mentions a NEW topic (e.g., "learn about photosynthesis", "tell me about Shakespeare")
- Very short input (1-3 words) that represents a topic (e.g., "apple", "gravity", "Renaissance")
- Keywords like: "new", "switch to", "about", "learn", "tell me about", "explore"
- Completely different subject from current topic
- Chinese equivalents: "新", "学习", "关于", "告诉我"

**EXPAND_CANVAS signals:**
- Requests MORE information about the CURRENT topic
- Asks for specific content types (examples, quiz, formula, explanation)
- Uses words like: "add", "more", "explain", "show me", "can you", "give me", "tell me more"
- References the current topic implicitly
- Asks questions about the current topic
- Chinese equivalents: "添加", "更多", "解释", "给我", "能不能"

Module Type Suggestions (for EXPAND_CANVAS):
- "examples", "more examples" → "examples"
- "quiz", "test", "questions" → "quiz"
- "formula", "equation", "math" → "formula"
- "story", "narrative" → "story"
- "compare", "comparison", "vs" → "comparison"
- "perspective", "viewpoint", "from X angle" → "perspective_*"
- "experiment", "interactive", "simulation" → "experiment"
- "animation", "visualization" → "animation"
- "video" → "video"
- "image", "picture", "illustration" → "image"
- Default for general requests → "overview" or "examples"

Important Rules:
1. If current topic is empty or "None", ANY input should be NEW_CANVAS
2. If input is 1-3 words and doesn't reference current topic → NEW_CANVAS
3. If input explicitly asks to "add" or "show more" about current topic → EXPAND_CANVAS
4. When uncertain, prefer NEW_CANVAS for short inputs, EXPAND_CANVAS for longer descriptive requests
5. Extract the core topic clearly for NEW_CANVAS (remove filler words like "learn about", "tell me about")

Response Format:
- action: 'NEW_CANVAS' or 'EXPAND_CANVAS'
- topic: (if NEW_CANVAS) clean topic name
- moduleType: (if EXPAND_CANVAS) suggested module type
- reasoning: brief explanation of your decision`;

  const userMessage = `User Input: "${userPrompt}"

Analyze the user's intent and determine:
1. Is this a NEW_CANVAS (new topic) or EXPAND_CANVAS (add to current)?
2. If NEW_CANVAS: extract the clean topic name
3. If EXPAND_CANVAS: suggest the most appropriate module type
4. Provide brief reasoning`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      action: {
        type: Type.STRING,
        enum: ['NEW_CANVAS', 'EXPAND_CANVAS'],
        description: 'The determined user intent'
      },
      topic: {
        type: Type.STRING,
        description: 'Clean topic name for NEW_CANVAS (empty if EXPAND_CANVAS)',
        nullable: true
      },
      moduleType: {
        type: Type.STRING,
        description: 'Suggested module type for EXPAND_CANVAS (empty if NEW_CANVAS)',
        nullable: true
      },
      reasoning: {
        type: Type.STRING,
        description: 'Brief explanation of the decision'
      }
    },
    required: ['action', 'reasoning']
  };

  try {
    const result = await ai.generateContent({
      model: 'gemini-2.0-flash-exp',
      systemInstruction,
      contents: userMessage,
      config: {
        responseMimeType: 'application/json',
        responseSchema,
        temperature: 0.3,  // Lower temperature for more consistent intent detection
      }
    });

    const response = result.response;
    const parsed = JSON.parse(response.text) as IntentAnalysis;

    console.log('🤖 AI Intent Analysis:', {
      userPrompt,
      currentTopic,
      action: parsed.action,
      topic: parsed.topic,
      moduleType: parsed.moduleType,
      reasoning: parsed.reasoning
    });

    return parsed;

  } catch (error) {
    console.error('❌ Gemini Intent Analysis failed:', error);
    
    // Fallback to simple heuristic
    return fallbackIntentAnalysis(userPrompt, currentTopic);
  }
}

/**
 * 降级方案：简单的意图识别
 */
function fallbackIntentAnalysis(prompt: string, currentTopic: string): IntentAnalysis {
  const p = prompt.toLowerCase();
  
  // If no current topic, always create new canvas
  if (!currentTopic) {
    return {
      action: 'NEW_CANVAS',
      topic: prompt.trim(),
      reasoning: 'Fallback: No current topic, creating new canvas'
    };
  }
  
  // Short input likely means new topic
  if (prompt.trim().split(' ').length <= 3) {
    return {
      action: 'NEW_CANVAS',
      topic: prompt.trim(),
      reasoning: 'Fallback: Short input detected as new topic'
    };
  }
  
  // Keywords for expansion
  if (p.includes('add') || p.includes('more') || p.includes('show') || p.includes('explain')) {
    return {
      action: 'EXPAND_CANVAS',
      moduleType: 'examples',
      reasoning: 'Fallback: Expansion keywords detected'
    };
  }
  
  // Default to new canvas for safety
  return {
    action: 'NEW_CANVAS',
    topic: prompt.trim(),
    reasoning: 'Fallback: Default to new canvas'
  };
}

