/**
 * 真正的 Gemini 内容生成器
 * 独立实现，用于测试验证，暂不接入主系统
 */

import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

/**
 * 文本内容输出结构
 */
interface TextContentOutput {
  title: string;
  body: string;
  key_points: string[];
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
  estimated_reading_time?: number;  // 分钟
}

/**
 * 模块计划（来自 Planner 的输出）
 */
interface ModulePlan {
  type: string;
  title: string;
  description?: string;
}

/**
 * 使用 Gemini 2.5 Flash 生成基础文本内容
 * 
 * @param topic - 主题
 * @param domain - 领域（LANGUAGE | SCIENCE | LIBERAL_ARTS）
 * @param modulePlan - Planner 生成的模块计划
 * @param context - 可选的上下文（如其他模块的内容）
 */
export async function generateTextContent(
  topic: string,
  domain: string,
  modulePlan: ModulePlan,
  context?: {
    other_modules?: ModulePlan[];
    user_preferences?: any;
    previous_content?: string;
  }
): Promise<TextContentOutput> {
  
  const systemInstruction = `You are an expert educational content writer for Axiom, a GenUI-powered learning platform for students aged 12-18 (G7-G12).

Your role is to generate engaging, accurate, and well-structured educational content based on a module plan created by our AI Planner.

Core Principles:

1. **Clarity First**: Use clear, accessible language. Avoid unnecessary jargon, but don't shy away from proper terminology when needed.

2. **Engagement**: Make content interesting and relevant. Use analogies, real-world connections, and thought-provoking questions.

3. **Depth with Accessibility**: Balance between being thorough and being understandable for the target age group.

4. **Structure**: Organize content with clear sections, bullet points, and visual hierarchy (using Markdown).

5. **Bilingual Support**: 
   - For LANGUAGE domain: Content should be primarily in the target language with explanations in Chinese when helpful
   - For SCIENCE and LIBERAL_ARTS: Mix English and Chinese naturally - use English for technical terms with Chinese explanations

Domain-Specific Guidelines:

${domain === 'LANGUAGE' ? `
**LANGUAGE Domain**:
- For "definition": Provide pronunciation, core meaning, word class, and usage notes
- For "intuition": Explain the concept or word in everyday language
- For "overview": Give a comprehensive introduction
- For "examples": Provide 3-5 varied, realistic examples showing different contexts
- Include etymology when relevant and interesting
- Use bilingual approach: English for the word/content, Chinese for explanations
` : ''}

${domain === 'SCIENCE' ? `
**SCIENCE Domain**:
- For "intuition": Start with everyday phenomena, avoid formulas initially
- For "definition": Be precise but accessible
- For "overview": Provide the "big picture" before details
- For "examples": Use concrete, relatable scenarios
- Connect abstract concepts to tangible experiences
- Use analogies and visual descriptions
- Technical terms in English, explanations in Chinese when helpful
` : ''}

${domain === 'LIBERAL_ARTS' ? `
**LIBERAL_ARTS Domain**:
- For "intuition": Ground abstract ideas in familiar experiences
- For "overview": Provide historical and cultural context
- For "examples": Use diverse, multicultural examples
- Connect concepts to contemporary issues
- Encourage critical thinking with open-ended questions
- Balance between depth and accessibility
` : ''}

Content Structure:

1. **Hook/Opening**: Start with something interesting - a question, a surprising fact, or a relatable scenario
2. **Core Content**: Develop the main ideas clearly and logically
3. **Examples/Illustrations**: Provide concrete instances
4. **Key Takeaways**: Summarize the most important points
5. **Connections**: Link to other concepts or real-world applications

Formatting:
- Use Markdown for structure
- Use **bold** for key terms
- Use bullet points for lists
- Use > blockquotes for important notes
- Keep paragraphs short (2-4 sentences)
- Break up text with subheadings`;

  const userPrompt = `Topic: "${topic}"
Domain: ${domain}
Module Type: ${modulePlan.type}
Module Title: "${modulePlan.title}"
${modulePlan.description ? `Module Description: ${modulePlan.description}` : ''}

${context?.other_modules ? `
Context - Other modules in this Canvas:
${context.other_modules.map(m => `- ${m.title} (${m.type})`).join('\n')}
` : ''}

${context?.user_preferences ? `
User Preferences: ${JSON.stringify(context.user_preferences)}
` : ''}

Generate COMPLETE and COMPREHENSIVE educational content for this module.

Requirements:
- Length: 200-400 words (keep it concise but complete)
- Audience: G7-G12 students
- Style: Engaging, clear, and accessible
- Structure: Well-organized with Markdown headings and sections
- Format: Use **bold** for key terms, bullet points for lists
- Bilingual: Mix English and Chinese naturally (English terms with Chinese annotations)
- Focus: Cover the essential points, avoid unnecessary elaboration
- Completeness: Must have a clear beginning, middle, and end

The content should align with the module's title and description. Be concise but thorough - quality over quantity. Make sure to FINISH the content completely - do not cut off mid-paragraph or mid-list.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      title: { 
        type: Type.STRING,
        description: "The module title (can refine the planner's title if needed)"
      },
      body: { 
        type: Type.STRING,
        description: "Complete main content in Markdown format. Aim for 400-1000 words. Must be comprehensive and well-developed with multiple sections. Do NOT truncate or cut off mid-sentence."
      },
      key_points: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "3-5 key takeaways students should remember"
      },
      difficulty_level: {
        type: Type.STRING,
        enum: ["beginner", "intermediate", "advanced"],
        description: "Assessed difficulty of this content"
      },
      estimated_reading_time: {
        type: Type.NUMBER,
        description: "Estimated reading time in minutes"
      }
    },
    required: ["title", "body", "key_points"]
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',  // 使用最新的 Gemini 2.5 Flash
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.8,  // 平衡创意和一致性
        candidateCount: 1,
        maxOutputTokens: 8192,  // 增加输出长度限制，确保内容完整
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error('Gemini Content Generator Error:', error);
    throw error;
  }
}

/**
 * 批量生成多个模块的内容（用于测试）
 */
export async function generateMultipleModuleContents(
  topic: string,
  domain: string,
  modulePlans: ModulePlan[]
): Promise<TextContentOutput[]> {
  const results: TextContentOutput[] = [];
  
  for (let i = 0; i < modulePlans.length; i++) {
    const plan = modulePlans[i];
    console.log(`\n📝 正在生成模块 ${i + 1}/${modulePlans.length}: ${plan.title}...`);
    
    try {
      const content = await generateTextContent(topic, domain, plan, {
        other_modules: modulePlans,
      });
      results.push(content);
      console.log(`✅ 完成 (${content.body.length} 字符)`);
      
      // 避免 API 限流
      if (i < modulePlans.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.log(`❌ 失败: ${error}`);
      throw error;
    }
  }
  
  return results;
}

