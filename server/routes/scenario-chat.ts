import { Router } from 'express';
import { GoogleGenAI, Type } from '@google/genai';

const router = Router();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is required. Please set it in your .env file.');
}
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

/**
 * POST /api/scenario/start
 * 开始一个新的实时对话场景
 * 
 * Body: {
 *   topic: string,  // 场景主题，如 "buying apples at market"
 *   setting?: string  // 可选的场景描述
 * }
 */
router.post('/start', async (req, res) => {
  try {
    const { topic, setting } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'topic is required' });
    }

    console.log(`💬 启动实时对话: ${topic}`);

    const systemInstruction = `You are a language learning scenario partner. Create realistic, educational dialogue scenarios.

Your role:
- Play the role of another character (vendor, waiter, friend, etc.) in the scenario
- Respond naturally to the student's choices
- Provide 3 response options for the student with different tones/appropriateness
- Keep conversations practical and educational

Response format:
- npc_says: What you (the NPC) say in this turn
- your_options: 3 options for how the student can respond
- Each option has: text, tone, appropriateness (excellent/good/acceptable/poor), brief_feedback

Keep it natural, conversational, and educational.`;

    const userPrompt = `Start a new dialogue scenario: "${topic}"

${setting ? `Setting: ${setting}` : ''}

This is the FIRST turn of the conversation. Set the scene and say the first line as the NPC character.

Provide 3 response options for the student with varying levels of appropriateness.`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        npc_says: { type: Type.STRING, description: "What the NPC says in this turn" },
        situation_context: { type: Type.STRING, description: "Brief context about the current situation" },
        your_options: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              tone: { type: Type.STRING },
              appropriateness: { 
                type: Type.STRING,
                enum: ['excellent', 'good', 'acceptable', 'poor']
              },
              brief_feedback: { type: Type.STRING, description: "1 sentence feedback" }
            }
          },
          minItems: 3,
          maxItems: 3
        }
      },
      required: ['npc_says', 'situation_context', 'your_options']
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema,
        temperature: 0.8,
        maxOutputTokens: 2048
      }
    });

    const dialogueTurn = JSON.parse(response.text);

    console.log('✅ 对话开始:', dialogueTurn.npc_says.substring(0, 50) + '...');

    res.json({
      turn: 1,
      ...dialogueTurn,
      conversation_history: []
    });

  } catch (error) {
    console.error('❌ 启动对话失败:', error);
    res.status(500).json({ 
      error: '对话启动失败',
      details: (error as Error).message 
    });
  }
});

/**
 * POST /api/scenario/continue
 * 继续对话（基于用户的选择）
 * 
 * Body: {
 *   topic: string,
 *   conversation_history: Array<{npc_says: string, user_choice: string}>,
 *   user_choice_index: number  // 用户选择的选项索引
 *   last_options: Array<{text: string, tone: string}>
 * }
 */
router.post('/continue', async (req, res) => {
  try {
    const { topic, conversation_history, user_choice_index, last_options } = req.body;

    if (!topic || !last_options || user_choice_index === undefined) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const userChoice = last_options[user_choice_index];
    console.log(`💬 继续对话: 用户选择了 [${userChoice.tone}] ${userChoice.text.substring(0, 30)}...`);

    const systemInstruction = `You are a language learning scenario partner. Continue the conversation naturally based on the student's choice.

Your role:
- React naturally to what the student said
- Keep the conversation flowing and educational
- Provide 3 new response options for the next turn
- Gradually progress the scenario toward a natural conclusion

Response format:
- npc_says: Your natural response to what the student just said
- your_options: 3 new options for the student's next response
- is_conversation_ending: true if this should be the last turn

Keep responses realistic and educational.`;

    // 构建对话历史上下文
    let contextText = `Scenario: "${topic}"\n\nConversation so far:\n`;
    
    if (conversation_history && conversation_history.length > 0) {
      conversation_history.forEach((turn: any, i: number) => {
        contextText += `Turn ${i + 1}:\n`;
        contextText += `NPC: "${turn.npc_says}"\n`;
        contextText += `Student: "${turn.user_choice}"\n\n`;
      });
    }

    contextText += `Student just said: "${userChoice.text}" (tone: ${userChoice.tone})\n\n`;
    contextText += `Now generate the NPC's response and 3 new options for the student.`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        npc_says: { type: Type.STRING, description: "NPC's response to the student's choice" },
        situation_context: { type: Type.STRING, description: "Updated situation context" },
        your_options: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              tone: { type: Type.STRING },
              appropriateness: { 
                type: Type.STRING,
                enum: ['excellent', 'good', 'acceptable', 'poor']
              },
              brief_feedback: { type: Type.STRING, description: "1 sentence feedback" }
            }
          },
          minItems: 3,
          maxItems: 3
        },
        is_conversation_ending: { type: Type.BOOLEAN, description: "Should this be the last turn?" }
      },
      required: ['npc_says', 'situation_context', 'your_options']
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contextText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema,
        temperature: 0.8,
        maxOutputTokens: 2048
      }
    });

    const dialogueTurn = JSON.parse(response.text);

    console.log('✅ 对话继续:', dialogueTurn.npc_says.substring(0, 50) + '...');

    // 更新对话历史
    const updatedHistory = [
      ...(conversation_history || []),
      {
        npc_says: conversation_history?.length > 0 ? conversation_history[conversation_history.length - 1].npc_says : '',
        user_choice: userChoice.text
      }
    ];

    res.json({
      turn: updatedHistory.length + 1,
      ...dialogueTurn,
      conversation_history: updatedHistory
    });

  } catch (error) {
    console.error('❌ 继续对话失败:', error);
    res.status(500).json({ 
      error: '对话继续失败',
      details: (error as Error).message 
    });
  }
});

export default router;

